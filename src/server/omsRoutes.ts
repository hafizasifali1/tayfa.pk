import express from 'express';
import { db } from '../db';
import { 
  orders, 
  orderItems, 
  orderStatusHistory, 
  shipments, 
  returns, 
  invoices, 
  creditNotes, 
  ledgers, 
  auditLogs,
  products,
  users,
  transactions,
  payments
} from '../db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// --- Order Generation (Website & Manual) ---

router.post('/orders', async (req, res) => {
  const { 
    customerId, 
    customerEmail, 
    items, 
    shippingAddress, 
    billingAddress, 
    paymentMethod,
    notes,
    source = 'website',
    createdBy
  } = req.body;

  try {
    const orderId = uuidv4();
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    let totalAmount = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    // Start Transaction (Implicitly handled by multiple inserts if not using explicit tx, 
    // but for ACID we should use db.transaction)
    await db.transaction(async (tx) => {
      // 1. Create Order Items and calculate total
      const orderItemsData = [];
      for (const item of items) {
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

        const itemTotal = Number(item.price || product.price) * item.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          id: uuidv4(),
          orderId,
          productId: item.productId,
          sellerId: product.brandId || 'admin', // Assuming brandId as sellerId for now
          name: product.name,
          originalPrice: product.price,
          price: item.price || product.price, // Manual override support
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          status: 'pending'
        });

        // Update Stock
        await tx.update(products)
          .set({ stock: product.stock - item.quantity })
          .where(eq(products.id, item.productId));
      }

      // 2. Create Order
      await tx.insert(orders).values({
        id: orderId,
        orderNumber,
        customerId,
        customerEmail,
        totalAmount: totalAmount.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod,
        shippingAddress,
        billingAddress,
        notes,
        source,
        createdBy
      });

      // 3. Insert Order Items
      for (const orderItem of orderItemsData) {
        await tx.insert(orderItems).values(orderItem);
      }

      // 4. Initial Status History
      await tx.insert(orderStatusHistory).values({
        id: uuidv4(),
        orderId,
        status: 'pending',
        comment: 'Order created',
        changedBy: createdBy || customerId
      });

      // 5. Audit Log
      await tx.insert(auditLogs).values({
        id: uuidv4(),
        userId: createdBy || customerId,
        action: 'create_order',
        module: 'orders',
        details: { orderNumber, totalAmount },
        createdAt: new Date()
      });
    });

    res.status(201).json({ id: orderId, orderNumber });
  } catch (error: any) {
    console.error('Order creation failed:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

// --- Order Updates & Status Transitions ---

router.put('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, comment, changedBy } = req.body;

  try {
    await db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, id));
      if (!order) throw new Error('Order not found');

      // Update Order Status
      await tx.update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, id));

      // Add to History
      await tx.insert(orderStatusHistory).values({
        id: uuidv4(),
        orderId: id,
        status,
        comment,
        changedBy
      });

      // If status is 'delivered', maybe auto-generate invoice if not exists
      if (status === 'delivered') {
        const [existingInvoice] = await tx.select().from(invoices).where(eq(invoices.orderId, id));
        if (!existingInvoice) {
          const invoiceId = uuidv4();
          const invoiceNumber = `INV-${Date.now()}`;
          await tx.insert(invoices).values({
            id: invoiceId,
            invoiceNumber,
            orderId: id,
            sellerId: 'admin', // Simplified
            customerId: order.customerId,
            amount: order.totalAmount,
            taxAmount: order.taxAmount,
            status: order.paymentStatus === 'paid' ? 'paid' : 'unpaid',
            createdAt: new Date()
          });
        }
      }

      // Audit Log
      await tx.insert(auditLogs).values({
        id: uuidv4(),
        userId: changedBy,
        action: 'update_order_status',
        module: 'orders',
        details: { orderId: id, oldStatus: order.status, newStatus: status },
        createdAt: new Date()
      });
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update order status' });
  }
});

// --- Payment Management ---

router.post('/orders/:id/payments', async (req, res) => {
  const { id } = req.params;
  const { amount, method, transactionRef, recordedBy } = req.body;

  try {
    await db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, id));
      if (!order) throw new Error('Order not found');

      const transactionId = uuidv4();
      await tx.insert(transactions).values({
        id: transactionId,
        orderId: id,
        gatewayId: method, // Simplified
        amount: amount.toFixed(2),
        status: 'completed',
        createdAt: new Date()
      });

      await tx.insert(payments).values({
        id: uuidv4(),
        transactionId,
        paymentMethod: method,
        paymentStatus: 'paid',
        gatewayResponse: { ref: transactionRef },
        createdAt: new Date()
      });

      // Update Order Payment Status
      // Calculate total paid so far
      const allTransactions = await tx.select().from(transactions).where(eq(transactions.orderId, id));
      const totalPaid = allTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      
      let newPaymentStatus = 'partial';
      if (totalPaid >= Number(order.totalAmount)) {
        newPaymentStatus = 'paid';
      }

      await tx.update(orders)
        .set({ paymentStatus: newPaymentStatus, updatedAt: new Date() })
        .where(eq(orders.id, id));

      // Ledger Entry
      await tx.insert(ledgers).values({
        id: uuidv4(),
        entityId: order.customerId,
        entityType: 'customer',
        transactionType: 'payment',
        amount: amount.toFixed(2),
        balance: (0).toFixed(2), // Simplified balance tracking
        referenceId: transactionId,
        description: `Payment for order ${order.orderNumber}`,
        createdAt: new Date()
      });
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to record payment' });
  }
});

// --- Return & Credit Note Management ---

router.post('/orders/:id/returns', async (req, res) => {
  const { id } = req.params;
  const { itemId, quantity, reason, processedBy } = req.body;

  try {
    await db.transaction(async (tx) => {
      const [orderItem] = await tx.select().from(orderItems).where(eq(orderItems.id, itemId));
      if (!orderItem) throw new Error('Order item not found');
      if (orderItem.quantity < (orderItem.returnedQuantity || 0) + quantity) {
        throw new Error('Return quantity exceeds purchased quantity');
      }

      const returnId = uuidv4();
      const refundAmount = (Number(orderItem.price) * quantity).toFixed(2);

      await tx.insert(returns).values({
        id: returnId,
        orderId: id,
        orderItemId: itemId,
        reason,
        quantity, // Assuming I added quantity to returns table or it's implied
        status: 'approved',
        refundAmount,
        createdAt: new Date()
      });

      // Update Order Item
      await tx.update(orderItems)
        .set({ returnedQuantity: (orderItem.returnedQuantity || 0) + quantity })
        .where(eq(orderItems.id, itemId));

      // Generate Credit Note
      const [invoice] = await tx.select().from(invoices).where(eq(invoices.orderId, id));
      if (invoice) {
        await tx.insert(creditNotes).values({
          id: uuidv4(),
          noteNumber: `CN-${Date.now()}`,
          invoiceId: invoice.id,
          amount: refundAmount,
          reason: `Return: ${reason}`,
          status: 'issued',
          createdAt: new Date()
        });
      }

      // Restock product
      const [product] = await tx.select().from(products).where(eq(products.id, orderItem.productId));
      if (product) {
        await tx.update(products)
          .set({ stock: product.stock + quantity })
          .where(eq(products.id, orderItem.productId));
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to process return' });
  }
});

export default router;
