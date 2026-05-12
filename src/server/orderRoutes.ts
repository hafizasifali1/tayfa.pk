import express from 'express';
import { db } from '../db';
import {
  orders,
  orderItems,
  orderStatusHistory,
  shipments,
  returns,
  refunds,
    refundRequests,
  products,
  users,
  paymentMethods,
  paymentGateways
} from '../db/schema';
import { handlePatchUpdate } from './utils/updateHandler';
import { eq, and, desc, sql, exists, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from './routes';

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
    const orderNumber = `ORD-${Math.random().toString(36).toUpperCase().slice(2, 8)}`;
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
    // Resolve missing seller IDs from products table so seller notifications still fire
    // even when the cart entry doesn't carry sellerId.
    const productIds = items.map((it: any) => it.productId || it.id).filter(Boolean);
    const productSellerMap = new Map<string, string>();
    if (productIds.length > 0) {
      const productRows = await db.select().from(products).where(inArray(products.id, productIds));
      for (const p of productRows) {
        if (p.sellerId) productSellerMap.set(p.id, p.sellerId);
      }
    }

    const itemsToInsert = items.map((item: any) => {
      const productId = item.productId || item.id;
      const resolvedSellerId = item.sellerId || productSellerMap.get(productId) || '00000000-0000-0000-0000-000000000000';
      return {
        id: uuidv4(),
        orderId: newOrder.id,
        productId,
        sellerId: resolvedSellerId,
        name: item.name,
        price: item.price.toString(),
        originalPrice: (item.originalPrice || item.price).toString(),
        quantity: item.quantity ?? item.qty ?? 1,
        shippedQuantity: 0,
        returnedQuantity: 0,
        size: item.size || item.variantId,
        color: item.color,
        status: 'pending'
      };
    });

    await db.insert(orderItems).values(itemsToInsert);

    // 3. Add Initial Status History
    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: newOrder.id,
      status: 'pending',
      comment: 'Order placed successfully'
    });

    // 4. Fire-and-forget notification emails (don't block the order response)
    void (async () => {
      try {
        const customerName = shippingAddress?.firstName
          ? `${shippingAddress.firstName} ${shippingAddress.lastName || ''}`.trim()
          : (customerEmail || 'Customer');

        if (customerEmail) {
          await sendEmail({
            to: customerEmail,
            templateName: 'order_confirmation',
            data: {
              customer_name: customerName,
              order_id: newOrder.orderNumber,
              total_amount: `${newOrder.currency || 'PKR'} ${Number(newOrder.totalAmount).toFixed(2)}`,
            },
          });
        }

        // Group items by seller and notify each unique seller
        const itemsBySeller = new Map<string, typeof itemsToInsert>();
        for (const it of itemsToInsert) {
          const list = itemsBySeller.get(it.sellerId) || [];
          list.push(it);
          itemsBySeller.set(it.sellerId, list);
        }

        const sellerIds = [...itemsBySeller.keys()].filter(
          id => id && id !== '00000000-0000-0000-0000-000000000000'
        );
        console.log(`[order ${newOrder.orderNumber}] resolved sellerIds:`, sellerIds);
        if (sellerIds.length === 0) {
          console.warn(`[order ${newOrder.orderNumber}] no real sellerIds — seller notification skipped`);
        }
        if (sellerIds.length > 0) {
          const sellerUsers = await db.select().from(users).where(inArray(users.id, sellerIds));
          const foundIds = new Set(sellerUsers.map(s => s.id));
          for (const sid of sellerIds) {
            if (!foundIds.has(sid)) {
              console.warn(`[order ${newOrder.orderNumber}] sellerId ${sid} has no matching users row — skipped`);
            }
          }
          for (const seller of sellerUsers) {
            if (!seller.email) {
              console.warn(`[order ${newOrder.orderNumber}] seller ${seller.id} has no email — skipped`);
              continue;
            }
            const sellerItems = itemsBySeller.get(seller.id) || [];
            const sellerTotal = sellerItems.reduce(
              (sum, it) => sum + Number(it.price) * Number(it.quantity),
              0
            );
            const itemsHtml = sellerItems
              .map(it => `<div>• ${it.name} × ${it.quantity} — ${Number(it.price).toFixed(2)}</div>`)
              .join('');

            console.log(`[order ${newOrder.orderNumber}] sending seller_new_order to ${seller.email}`);
            await sendEmail({
              to: seller.email,
              templateName: 'seller_new_order',
              data: {
                seller_name: seller.fullName || 'Seller',
                order_id: newOrder.orderNumber,
                items_html: itemsHtml,
                seller_total: sellerTotal.toFixed(2),
                currency: newOrder.currency || 'PKR',
              },
            });
          }
        }
      } catch (mailErr) {
        console.error('Order notification email error:', mailErr);
      }
    })();

    res.status(201).json(newOrder);
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error?.message });
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
    const orderReturns = await db.select().from(returns).where(eq(returns.orderId, order.id)).catch(() => []);
    const orderRefunds = await db.select().from(refundRequests).where(eq(refundRequests.orderId, order.id));

    let paymentMethodName: string | null = null;
if (order.paymentMethod) {
  if (order.paymentMethod.startsWith('pm_')) {
    const methodId = order.paymentMethod.slice(3);
    const [pm] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, methodId));
    paymentMethodName = pm?.name ?? order.paymentMethod;
  } else {
    const [gw] = await db.select().from(paymentGateways).where(eq(paymentGateways.code, order.paymentMethod));
    paymentMethodName = gw?.name ?? order.paymentMethod.toUpperCase();
  }
}

    res.json({
      ...order,
      paymentMethodName,
      items,
      history,
      shipments: orderShipments,
      returns: orderReturns,
      refundRequests: orderRefunds
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
      allowedFields: ['status', 'paymentStatus', 'paymentMethod', 'shippingAddress', 'billingAddress', 'notes', 'customerEmail', 'totalAmount', 'taxAmount', 'discountAmount'],
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

// Replace order items list (admin edit). Recomputes total from new items.
router.put('/orders/:id/items', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items must be an array' });

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Resolve missing seller IDs from products
    const productIds = items.map((it: any) => it.productId || it.id).filter(Boolean);
    const productSellerMap = new Map<string, string>();
    if (productIds.length > 0) {
      const productRows = await db.select().from(products).where(inArray(products.id, productIds));
      for (const p of productRows) {
        if (p.sellerId) productSellerMap.set(p.id, p.sellerId);
      }
    }

    const newItems = items.map((item: any) => {
      const productId = item.productId || item.id;
      return {
        id: uuidv4(),
        orderId,
        productId,
        sellerId: item.sellerId || productSellerMap.get(productId) || '00000000-0000-0000-0000-000000000000',
        name: item.name,
        price: Number(item.price).toString(),
        originalPrice: Number(item.originalPrice || item.price).toString(),
        quantity: item.quantity ?? item.qty ?? 1,
        shippedQuantity: 0,
        returnedQuantity: 0,
        size: item.size || item.variantId,
        color: item.color,
        status: 'pending'
      };
    });

    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    if (newItems.length > 0) await db.insert(orderItems).values(newItems);

    const newTotal = newItems.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0);
    await db.update(orders)
      .set({ totalAmount: newTotal.toString(), updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(orders.id, orderId));

    const [updatedOrder] = await db.select().from(orders).where(eq(orders.id, orderId));
    const refreshedItems = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    res.json({ ...updatedOrder, items: refreshedItems });
  } catch (error: any) {
    console.error('Error replacing order items:', error);
    res.status(500).json({ error: 'Failed to update order items', details: error?.message });
  }
});

// Delete order (admin)
router.delete('/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    await db.delete(orderStatusHistory).where(eq(orderStatusHistory.orderId, orderId));
    await db.delete(orders).where(eq(orders.id, orderId));
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// --- Update Order Status ---
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status, comment, changedBy, processedByRole, processedByName, processedById } = req.body;
    
    await db.update(orders)
      .set({ status, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(orders.id, req.params.id));

    const [updatedOrder] = await db.select().from(orders).where(eq(orders.id, req.params.id));

    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: req.params.id,
      status,
      comment,
      changedBy: changedBy || processedById,
      processedByRole,
      processedByName,
      processedById: processedById || changedBy
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
      .set({ status: 'shipped', updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(orders.id, req.params.id));

    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: req.params.id,
      status: 'shipped',
      comment: `Shipment created with tracking: ${trackingNumber}`,
      processedByRole: req.body.processedByRole || 'seller',
      processedByName: req.body.processedByName,
      processedById: sellerId
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
    const {
      order_item_id,
      proof_images,
      return_method,
      receipt_file,
      user_id,
    } = req.body;

    if (!order_item_id) {
      return res.status(400).json({ error: 'Please select an item to return.' });
    }
    if (!return_method) {
      return res.status(400).json({ error: 'Return method is required.' });
    }
    if (!receipt_file) {
      return res.status(400).json({ error: 'Receipt or proof of purchase is required.' });
    }

    const existingReturns = await db.select().from(returns).where(eq(returns.orderId, req.params.id)).catch(() => []);
    if (existingReturns.length > 0) {
      return res.status(409).json({ error: 'A return request already exists for this order.' });
    }

    const returnId = uuidv4();
    await db.insert(returns).values({
      id: returnId,
      orderId: req.params.id,
      orderItemId: order_item_id,
      userId: user_id || null,
      proofImages: proof_images || [],
      paymentProof: receipt_file,
      returnMethod: return_method,
      status: 'requested',
    });

    const [newReturn] = await db.select().from(returns).where(eq(returns.id, returnId));

    await db.update(orders)
      .set({ status: 'return_requested', updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(orders.id, req.params.id));

    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: req.params.id,
      status: 'return_requested',
      comment: `Return requested via ${return_method}.`,
      processedByRole: 'customer',
      processedByName: 'Customer',
      processedById: user_id || null,
    });

    res.status(201).json(newReturn);
  } catch (error) {
    console.error('Error initiating return:', error);
    res.status(500).json({ error: 'Failed to initiate return' });
  }
});

// --- Refund Requests (Step 3 & 4) ---
router.post('/orders/:id/refunds', async (req, res) => {
  try {
    const { reason, proofImages, paymentProof, refundMethod, userId, confirmationReceipt } = req.body;

    // --- STEP 5: Edge Cases ---
    
    // 1. Check if refund already requested or order is already refunded
    const [existingOrder]: any = await db.select().from(orders).where(eq(orders.id, req.params.id));
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (['refund_requested', 'refunded'].includes(existingOrder.status)) {
      return res.status(400).json({ error: 'Refund already requested or processed for this order.' });
    }

    // 2. Allow refund only within 30 days of delivery date
    if (existingOrder.status === 'delivered' && existingOrder.updatedAt) {
      const deliveryDate = new Date(existingOrder.updatedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (deliveryDate < thirtyDaysAgo) {
        return res.status(400).json({ error: 'Refund request period (30 days) has expired.' });
      }
    }

    // 1. Create Refund Request record
    const refundRequestId = uuidv4();
    await db.insert(refundRequests).values({
      id: refundRequestId,
      orderId: req.params.id,
      userId: userId,
      reason: reason,
      proofImages: JSON.stringify(proofImages || []),
      paymentProof: paymentProof,
      refundMethod: refundMethod,
      status: 'pending',
      adminNote: null,
      confirmationReceipt: confirmationReceipt ?? null
    });

    // 2. Update Order Status (Step 4 Requirement)
    await db.update(orders)
      .set({ status: 'refund_requested', updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(orders.id, req.params.id));

    // 3. Add to Order History
    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: req.params.id,
      status: 'refund_requested',
      comment: `Refund request submitted: ${reason}`,
      processedByRole: 'customer',
      processedByName: 'Customer',
      processedById: userId
    });

    res.status(201).json({ success: true, id: refundRequestId });
  } catch (error: any) {
    console.error('Refund submission error:', error);
    res.status(500).json({ error: 'Failed to submit refund request', message: error.message });
  }
});


// Withdraw Refund Request
router.delete('/orders/:id/refunds', async (req, res) => {
  try {
    const [existing] = await db.select().from(refundRequests)
      .where(eq(refundRequests.orderId, req.params.id));

    if (!existing) return res.status(404).json({ error: 'No refund request found' });
    if (existing.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending refund requests can be withdrawn' });
    }

    await db.delete(refundRequests).where(eq(refundRequests.orderId, req.params.id));
    await db.update(orders)
      .set({ status: 'delivered', updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(orders.id, req.params.id));

    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: req.params.id,
      status: 'delivered',
      comment: 'Refund request withdrawn by customer.',
      processedByRole: 'customer',
      processedByName: 'Customer',
    });

    res.json({ message: 'Refund request withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing refund:', error);
    res.status(500).json({ error: 'Failed to withdraw refund request' });
  }
});

// Get Refund Request by Order ID
router.get('/orders/:id/refund', async (req, res) => {
  try {
    const [refund] = await db.select()
      .from(refundRequests)
      .where(eq(refundRequests.orderId, req.params.id))
      .orderBy(sql`${refundRequests.createdAt} DESC`)
      .limit(1);

    if (!refund) return res.status(404).json({ error: 'Refund request not found' });
    res.json(refund);
  } catch (error) {
    console.error('Error fetching refund:', error);
    res.status(500).json({ error: 'Failed to fetch refund details' });
  }
});

router.get('/orders/:id/return', async (req, res) => {
  try {
    const [ret] = await db.select()
      .from(returns)
      .where(eq(returns.orderId, req.params.id))
      .orderBy(sql`${returns.createdAt} DESC`)
      .limit(1);

    if (!ret) return res.status(404).json({ error: 'Return request not found' });
    res.json(ret);
  } catch (error) {
    console.error('Error fetching return:', error);
    res.status(500).json({ error: 'Failed to fetch return details' });
  }
});

// Admin: Approve/Reject Refund (Step 3 & 4)
router.patch('/refund-requests/:id', async (req, res) => {
  try {
    const { status, adminNote, adminId } = req.body; // status: 'approved' or 'rejected'
    
    // 1. Update Refund Request
    const [refundReq] = await db.select().from(refundRequests).where(eq(refundRequests.id, req.params.id));
    if (!refundReq) return res.status(404).json({ error: 'Request not found' });

    await db.update(refundRequests)
      .set({ 
        status, 
        adminNote, 
        resolvedAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP` 
      })
      .where(eq(refundRequests.id, req.params.id));

    // 2. If approved, update Order status to 'refunded' (Step 4 Requirement)
    if (status === 'approved') {
      await db.update(orders)
        .set({ status: 'refunded', updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(orders.id, refundReq.orderId));
    } else {
      // If rejected, you might want to revert to 'delivered' or keep it 'refund_requested'
      // As per your rules: "no status change, notify customer only"
    }

    // 3. Add to History — log the explicit admin action
    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: refundReq.orderId,
      status: status === 'approved' ? 'refund_approved' : 'refund_rejected',
      comment: status === 'approved'
        ? `Refund request approved${adminNote ? ': ' + adminNote : ''}`
        : `Refund request rejected: ${adminNote}`,
      processedByRole: 'admin',
      processedById: adminId
    });

    // Fire-and-forget: notify customer
    void (async () => {
      try {
        const [order] = await db.select().from(orders).where(eq(orders.id, refundReq.orderId));
        if (order?.customerEmail) {
          const adminNoteHtml = adminNote
            ? `<p><strong>Admin Note:</strong> ${adminNote}</p>`
            : '';
          await sendEmail({
            to: order.customerEmail,
            templateName: status === 'approved' ? 'refund_approved' : 'refund_rejected',
            data: {
              customer_name: order.customerEmail,
              order_id: order.orderNumber,
              admin_note_html: adminNoteHtml,
            },
          });
        }
      } catch (mailErr) {
        console.error('Refund decision email error:', mailErr);
      }
    })();

    res.json({ success: true });
  } catch (error) {
    console.error('Admin refund update error:', error);
    res.status(500).json({ error: 'Failed to update refund request' });
  }
});



// Admin: Approve/Reject Return
router.patch('/returns/:id', async (req, res) => {
  try {
    const { status, adminNote, adminId } = req.body;

    const [retReq] = await db.select().from(returns).where(eq(returns.id, req.params.id));
    if (!retReq) return res.status(404).json({ error: 'Return request not found' });

    await db.update(returns)
      .set({
        status: status === 'approved' ? 'approved' : 'rejected',
        adminNote: adminNote,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(returns.id, req.params.id));

    if (status === 'approved') {
      await db.update(orders)
        .set({ status: 'return_approved', updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(orders.id, retReq.orderId as string));

      await db.insert(orderStatusHistory).values({
        id: uuidv4(),
        orderId: retReq.orderId as string,
        status: 'return_approved',
        comment: `Return request approved${adminNote ? ': ' + adminNote : ''}`,
        processedByRole: 'admin',
        processedById: adminId
      });
    } else {
      await db.update(orders)
        .set({ status: 'delivered', updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(orders.id, retReq.orderId as string));

      await db.insert(orderStatusHistory).values({
        id: uuidv4(),
        orderId: retReq.orderId as string,
        status: 'return_rejected',
        comment: `Return request rejected: ${adminNote}`,
        processedByRole: 'admin',
        processedById: adminId
      });
    }

    // Fire-and-forget: notify customer
    void (async () => {
      try {
        const [order] = await db.select().from(orders).where(eq(orders.id, retReq.orderId as string));
        if (order?.customerEmail) {
          const customerName = order.customerEmail;
          const adminNoteHtml = adminNote
            ? `<p><strong>Admin Note:</strong> ${adminNote}</p>`
            : '';
          await sendEmail({
            to: order.customerEmail,
            templateName: status === 'approved' ? 'return_approved' : 'return_rejected',
            data: {
              customer_name: customerName,
              order_id: order.orderNumber,
              admin_note_html: adminNoteHtml,
            },
          });
        }
      } catch (mailErr) {
        console.error('Return decision email error:', mailErr);
      }
    })();

    res.json({ success: true });
  } catch (error) {
    console.error('Return decision error:', error);
    res.status(500).json({ error: 'Failed to process return decision' });
  }
});

// Customer: Submit courier details after return is approved
router.patch('/returns/:id/courier', async (req, res) => {
  try {
    const { courierId, courierSlip, customerId } = req.body;

    if (!courierId) return res.status(400).json({ error: 'Courier tracking ID is required.' });
    if (!courierSlip) return res.status(400).json({ error: 'Courier slip upload is required.' });

    const [retReq] = await db.select().from(returns).where(eq(returns.id, req.params.id));
    if (!retReq) return res.status(404).json({ error: 'Return request not found' });
    if (retReq.status !== 'approved') {
      return res.status(400).json({ error: 'Courier details can only be submitted after approval.' });
    }
    if (retReq.courierId) {
      return res.status(409).json({ error: 'Courier details already submitted.' });
    }

    await db.update(returns)
      .set({ courierId, courierSlip, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(returns.id, req.params.id));

    await db.update(orders)
      .set({ status: 'courier_submitted', updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(orders.id, retReq.orderId as string));

    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: retReq.orderId as string,
      status: 'courier_submitted',
      comment: `Customer submitted courier details. Tracking ID: ${courierId}`,
      processedByRole: 'customer',
      processedById: customerId || null
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Courier submission error:', error);
    res.status(500).json({ error: 'Failed to submit courier details' });
  }
});

router.patch('/returns/:id/status', async (req, res) => {
  try {
    const { status, refundAmount, comment } = req.body;
    
    await db.update(returns)
      .set({ status, refundAmount: refundAmount?.toString(), updatedAt: sql`CURRENT_TIMESTAMP` })
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
        .set({ status: 'returned', paymentStatus: 'refunded', updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(orders.id, updatedReturn.orderId));
    }

    res.json(updatedReturn);
  } catch (error) {
    console.error('Error updating return status:', error);
    res.status(500).json({ error: 'Failed to update return status' });
  }
});

export default router;
