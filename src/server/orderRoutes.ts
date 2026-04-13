import express from 'express';
import { db } from '../db';
import { 
  orders, 
  orderItems, 
  orderStatusHistory, 
  shipments, 
  returns, 
  refunds,
  products
} from '../db/schema';
import { handlePatchUpdate } from './utils/updateHandler';
import { eq, and, desc, sql, exists } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Middleware to check for database connection
const checkDb = (req: any, res: any, next: any) => {
  if (!process.env.DATABASE_URL) {
    // Return mock/empty data if DB not connected to prevent crashes
    if (req.method === 'GET') {
      if (req.path === '/orders' || req.path.includes('/shipments') || req.path.includes('/returns')) {
        return res.json([]);
      }
      return res.status(200).json({});
    }
    return res.status(503).json({ error: 'Database not connected' });
  }
  next();
};

router.use(checkDb);

// --- Order Creation (Customer & Admin) ---
router.post('/orders', async (req, res) => {
  try {
    const { 
      items, 
      totalAmount, 
      customerId, 
      customerEmail, 
      shippingAddress, 
      paymentMethod,
      paymentResult,
      notes 
    } = req.body;

    // 1. Create Order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderId = uuidv4();
    await db.insert(orders).values({
      id: orderId,
      orderNumber,
      customerId,
      customerEmail,
      totalAmount: totalAmount.toString(),
      taxAmount: (req.body.taxAmount || 0).toString(),
      discountAmount: (req.body.discountAmount || 0).toString(),
      currency: req.body.currency || 'PKR',
      shippingAddress,
      billingAddress: req.body.billingAddress || shippingAddress,
      paymentMethod,
      paymentStatus: paymentResult?.status === 'completed' ? 'paid' : 'pending',
      status: 'pending',
      notes,
      source: req.body.source || 'website',
      createdBy: req.body.createdBy
    });

    const [newOrder] = await db.select().from(orders).where(eq(orders.id, orderId));

    // 2. Create Order Items (Split by Seller)
    const itemsToInsert = items.map((item: any) => ({
      id: uuidv4(),
      orderId: newOrder.id,
      productId: item.id,
      sellerId: item.sellerId || '00000000-0000-0000-0000-000000000000', // Default if not provided
      name: item.name,
      price: item.price.toString(),
      originalPrice: (item.originalPrice || item.price).toString(),
      quantity: item.quantity,
      shippedQuantity: 0,
      returnedQuantity: 0,
      size: item.size,
      color: item.color,
      status: 'pending'
    }));

    await db.insert(orderItems).values(itemsToInsert);

    // 3. Add Initial Status History
    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: newOrder.id,
      status: 'pending',
      comment: 'Order placed successfully'
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// --- List Orders (Admin, Seller, Customer) ---
router.get('/orders', async (req, res) => {
  try {
    const { customerId, sellerId, status } = req.query;
    
    let query = db.select().from(orders);
    
    const conditions = [];
    if (customerId) conditions.push(eq(orders.customerId, customerId as string));
    if (status) conditions.push(eq(orders.status, status as string));
    
    // If sellerId is provided, we need to filter orders that have items from this seller
    if (sellerId) {
      const result = await db.select()
        .from(orders)
        .where(
          exists(
            db.select()
              .from(orderItems)
              .where(
                and(
                  eq(orderItems.orderId, orders.id),
                  eq(orderItems.sellerId, sellerId as string)
                )
              )
          )
        )
        .orderBy(desc(orders.createdAt));
      
      return res.json(result);
    }

    const result = await db.select().from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt));
      
    res.json(result);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// --- Order Details ---
router.get('/orders/:id', async (req, res) => {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, req.params.id));
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const history = await db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, order.id)).orderBy(desc(orderStatusHistory.createdAt));
    const orderShipments = await db.select().from(shipments).where(eq(shipments.orderId, order.id));
    const orderReturns = await db.select().from(returns).where(eq(returns.orderId, order.id));

    res.json({
      ...order,
      items,
      history,
      shipments: orderShipments,
      returns: orderReturns
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

router.patch('/orders/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: orders,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'Order',
      allowedFields: ['status', 'paymentStatus', 'shippingAddress', 'billingAddress', 'notes'],
      enumValidators: {
        status: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
        paymentStatus: ['pending', 'partial', 'paid', 'failed', 'refunded']
      }
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating order:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

// --- Update Order Status ---
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status, comment, changedBy } = req.body;
    
    await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, req.params.id));

    const [updatedOrder] = await db.select().from(orders).where(eq(orders.id, req.params.id));

    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: req.params.id,
      status,
      comment,
      changedBy
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// --- Shipments ---
router.post('/orders/:id/shipments', async (req, res) => {
  try {
    const { sellerId, carrier, trackingNumber, trackingUrl, estimatedDelivery } = req.body;
    
    const shipmentId = uuidv4();
    await db.insert(shipments).values({
      id: shipmentId,
      orderId: req.params.id,
      sellerId,
      carrier,
      trackingNumber,
      trackingUrl,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      status: 'shipped'
    });

    const [newShipment] = await db.select().from(shipments).where(eq(shipments.id, shipmentId));

    // Auto-update order status if all items shipped (simplified)
    await db.update(orders)
      .set({ status: 'shipped', updatedAt: new Date() })
      .where(eq(orders.id, req.params.id));

    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: req.params.id,
      status: 'shipped',
      comment: `Shipment created with tracking: ${trackingNumber}`
    });

    res.status(201).json(newShipment);
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

router.patch('/shipments/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: shipments,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'Shipment',
      allowedFields: ['carrier', 'trackingNumber', 'trackingUrl', 'estimatedDelivery', 'status'],
      enumValidators: {
        status: ['pending', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned']
      }
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating shipment:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

// --- Returns & Refunds ---
router.post('/orders/:id/returns', async (req, res) => {
  try {
    const { orderItemId, reason, images } = req.body;
    
    const returnId = uuidv4();
    await db.insert(returns).values({
      id: returnId,
      orderId: req.params.id,
      orderItemId,
      reason,
      images,
      status: 'requested'
    });

    const [newReturn] = await db.select().from(returns).where(eq(returns.id, returnId));

    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: req.params.id,
      status: 'return_requested',
      comment: `Return requested for item: ${orderItemId}`
    });

    res.status(201).json(newReturn);
  } catch (error) {
    console.error('Error initiating return:', error);
    res.status(500).json({ error: 'Failed to initiate return' });
  }
});

router.patch('/returns/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: returns,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'Return',
      allowedFields: ['status', 'refundAmount', 'reason'],
      enumValidators: {
        status: ['requested', 'approved', 'rejected', 'received', 'refunded', 'cancelled']
      }
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating return:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

router.patch('/returns/:id/status', async (req, res) => {
  try {
    const { status, refundAmount, comment } = req.body;
    
    await db.update(returns)
      .set({ status, refundAmount: refundAmount?.toString(), updatedAt: new Date() })
      .where(eq(returns.id, req.params.id));

    const [updatedReturn] = await db.select().from(returns).where(eq(returns.id, req.params.id));

    if (status === 'refunded') {
      await db.insert(refunds).values({
        id: uuidv4(),
        orderId: updatedReturn.orderId,
        returnId: updatedReturn.id,
        amount: refundAmount.toString(),
        status: 'completed'
      });
      
      // Update order status to partially_returned or returned
      await db.update(orders)
        .set({ status: 'returned', paymentStatus: 'refunded', updatedAt: new Date() })
        .where(eq(orders.id, updatedReturn.orderId));
    }

    res.json(updatedReturn);
  } catch (error) {
    console.error('Error updating return status:', error);
    res.status(500).json({ error: 'Failed to update return status' });
  }
});

export default router;
