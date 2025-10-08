import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js'; // Add this import
import Product from '../models/productModel.js'; // Add this import for inventory management
import transporter from '../config/emailConfig.js';
import {
  sendOrderConfirmationEmail,
  sendOrderDeliveredEmail,
} from '../config/emailConfig.js';

// Helper function to reduce product inventory
const reduceProductInventory = async (
  orderItems,
  reason = 'payment confirmed'
) => {
  console.log(`🔄 Processing inventory reduction for ${reason}...`);
  try {
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const previousStock = product.countInStock;
        product.countInStock = Math.max(0, product.countInStock - item.qty);
        await product.save();

        console.log(
          `📦 Product "${product.name}": ${previousStock} → ${product.countInStock} (reduced by ${item.qty})`
        );

        // Log if product is now out of stock
        if (product.countInStock === 0) {
          console.log(`⚠️  Product "${product.name}" is now OUT OF STOCK`);
        }
      } else {
        console.log(`❌ Product not found for ID: ${item.product}`);
      }
    }
    console.log(`✅ Inventory reduction completed successfully for ${reason}`);
    return true;
  } catch (inventoryError) {
    console.error(`❌ Error reducing inventory for ${reason}:`, inventoryError);
    return false;
  }
};

// Helper function to restore product inventory (for cancelled orders)
const restoreProductInventory = async (
  orderItems,
  reason = 'order cancellation'
) => {
  console.log(`🔄 Processing inventory restoration for ${reason}...`);
  try {
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const previousStock = product.countInStock;
        product.countInStock = product.countInStock + item.qty;
        await product.save();

        console.log(
          `📦 Product "${product.name}": ${previousStock} → ${product.countInStock} (restored ${item.qty})`
        );

        // Log if product is back in stock
        if (previousStock === 0 && product.countInStock > 0) {
          console.log(`✅ Product "${product.name}" is now BACK IN STOCK`);
        }
      } else {
        console.log(`❌ Product not found for ID: ${item.product}`);
      }
    }
    console.log(
      `✅ Inventory restoration completed successfully for ${reason}`
    );
    return true;
  } catch (inventoryError) {
    console.error(
      `❌ Error restoring inventory for ${reason}:`,
      inventoryError
    );
    return false;
  }
};

// @description  Create new order
// @route        POST /api/orders
// @access       private
const addOrderItems = asyncHandler(async (req, res) => {
  try {
    console.log('=== Order Creation Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log(
      'Headers:',
      req.headers.authorization
        ? 'Authorization header present'
        : 'No authorization header'
    );
    console.log('User object:', req.user);

    // Check if user is authenticated
    if (!req.user) {
      console.log('❌ Authentication failed: req.user is null');
      res.status(401);
      throw new Error('User not authenticated. Please login first.');
    }

    console.log('User ID:', req.user._id);

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    } = req.body;

    // Validation
    if (!orderItems || orderItems.length === 0) {
      console.log('❌ Validation failed: No order items');
      res.status(400);
      throw new Error('No order items');
    }

    if (!shippingAddress) {
      console.log('❌ Validation failed: No shipping address');
      res.status(400);
      throw new Error('Shipping address is required');
    }

    if (!paymentMethod) {
      console.log('❌ Validation failed: No payment method');
      res.status(400);
      throw new Error('Payment method is required');
    }

    console.log('✅ Validation passed, checking inventory...');

    // Check inventory availability for all order items
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        console.log(`❌ Product not found: ${item.product}`);
        res.status(400);
        throw new Error(`Product not found: ${item.name}`);
      }

      if (product.countInStock < item.qty) {
        console.log(
          `❌ Insufficient stock for "${product.name}": requested ${item.qty}, available ${product.countInStock}`
        );
        res.status(400);
        throw new Error(
          `Insufficient stock for "${product.name}". Only ${product.countInStock} items available, but ${item.qty} requested.`
        );
      }
    }

    console.log('✅ Inventory check passed, creating order...');

    // Create the new order
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      currentStatus: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          updatedBy: req.user._id,
          notes: 'Order placed',
        },
      ],
    });

    console.log('💾 Saving order to database...');
    // Save the order to the database
    const createdOrder = await order.save();
    console.log('✅ Order saved successfully:', createdOrder._id);

    try {
      // Fetch the user details for the email
      const user = await User.findById(req.user._id);

      // Prepare the order object for email with user details
      const orderWithUser = {
        ...createdOrder._doc,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      };

      // Send confirmation email (non-blocking)
      sendOrderConfirmationEmail(orderWithUser)
        .then((sent) => {
          if (sent) {
            console.log(`📧 Order confirmation email sent to ${user.email}`);
          } else {
            console.log(
              `❌ Failed to send order confirmation email to ${user.email}`
            );
          }
        })
        .catch((emailError) => {
          console.log(`📧 Email error for ${user.email}:`, emailError.message);
        });
    } catch (emailError) {
      console.log(
        '📧 Email sending failed, but order was created successfully:',
        emailError.message
      );
    }

    console.log('🎉 Order creation completed successfully');
    // Return the created order
    res.status(201).json(createdOrder);
  } catch (error) {
    console.log('❌ Order creation failed:', error.message);
    console.log('Error stack:', error.stack);
    res.status(500);
    throw new Error(`Order creation failed: ${error.message}`);
  }
});

// @description  get order by ID
// @route        Get /api/orders/:id
//@access        private;

const getOrderById = asyncHandler(async (req, res) => {
  const searchId = req.params.id;
  let order = null;

  try {
    // First, try to find by exact ObjectId
    if (searchId.length === 24) {
      order = await Order.findById(searchId).populate('user', 'name email');
    }

    // If not found or invalid ObjectId format, search by partial match
    if (!order) {
      order = await Order.findOne({
        _id: { $regex: new RegExp('^' + searchId, 'i') },
      }).populate('user', 'name email');
    }

    // If still not found, check if user is looking for their own orders
    if (!order) {
      order = await Order.findOne({
        $or: [
          { _id: { $regex: new RegExp(searchId, 'i') } },
          { user: req.user._id },
        ],
      }).populate('user', 'name email');
    }
  } catch (error) {
    // Handle invalid ObjectId error
    console.log('Invalid ObjectId format, trying partial search...');
    order = await Order.findOne({
      _id: { $regex: new RegExp('^' + searchId, 'i') },
    }).populate('user', 'name email');
  }

  if (order) {
    // Check if user owns this order or has admin privileges
    if (
      order.user._id.toString() === req.user._id.toString() ||
      req.user.role === 'super_admin' ||
      req.user.role === 'operator' ||
      req.user.isAdmin
    ) {
      // Sync legacy orders with new status system
      if (
        !order.currentStatus ||
        !order.statusHistory ||
        order.statusHistory.length === 0
      ) {
        console.log('Syncing legacy order status...');

        // Initialize status history if not exists
        if (!order.statusHistory) {
          order.statusHistory = [];
        }

        // Determine current status based on legacy fields
        let syncedStatus = 'pending';
        if (order.isDelivered) {
          syncedStatus = 'delivered';
        } else if (order.isPaid) {
          syncedStatus = 'processing';
        }

        // Set current status
        order.currentStatus = syncedStatus;

        // Build status history based on legacy data
        const statusHistory = [];

        // Order placed
        statusHistory.push({
          status: 'pending',
          timestamp: order.createdAt,
          updatedBy: order.user._id,
          notes: 'Order placed (legacy sync)',
        });

        // Payment confirmed
        if (order.isPaid) {
          statusHistory.push({
            status: 'payment_confirmed',
            timestamp: order.paidAt || order.createdAt,
            updatedBy: order.user._id,
            notes: `Payment confirmed via ${order.paymentMethod} (legacy sync)`,
          });

          // Processing
          statusHistory.push({
            status: 'processing',
            timestamp: order.paidAt || order.createdAt,
            updatedBy: order.user._id,
            notes: 'Order processing (legacy sync)',
          });
        }

        // Delivered
        if (order.isDelivered) {
          statusHistory.push({
            status: 'delivered',
            timestamp: order.deliveredAt || order.updatedAt,
            updatedBy: order.user._id,
            notes: 'Order delivered (legacy sync)',
          });
        }

        // Update the order with synced status
        order.statusHistory = statusHistory;
        await order.save();
      }

      res.json(order);
    } else {
      res.status(403);
      throw new Error('Not authorized to access this order');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @description  Update order to paid
// @route        PUT /api/orders/:id/pay
//@access        private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
      // Add this to track payment source
      payment_source: req.body.payment_source || 'PayPal',
    };

    const updatedOrder = await order.save();

    // Reduce product inventory when payment is confirmed (only if not already reduced)
    if (!order.inventoryReduced) {
      const inventoryReduced = await reduceProductInventory(
        order.orderItems,
        'payment confirmed'
      );
      if (inventoryReduced) {
        order.inventoryReduced = true;
        await order.save();
      }
    } else {
      console.log('📦 Inventory already reduced for this order, skipping...');
    }

    // Send payment confirmation email
    const emailConfig = {
      subject: `Medi-ghor - Payment Confirmed for Order #${order._id}`,
      heading: 'Payment Confirmed',
      message: `Your payment for order #${order._id} has been confirmed. We'll process your order shortly.`,
    };

    // Create a HTML email template for payment confirmation
    const mailOptions = {
      from: `"Medi-ghor" <${process.env.EMAIL_USER}>`,
      to: order.user.email,
      subject: emailConfig.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4a90e2; color: white; padding: 20px; text-align: center;">
            <h1>${emailConfig.heading}</h1>
            <p>Order #${order._id}</p>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
            <h2>Payment Confirmation</h2>
            <p>Dear ${order.user.name},</p>
            <p>${emailConfig.message}</p>
            
            <p>Payment Details:</p>
            <ul>
              <li>Amount: $${order.totalPrice.toFixed(2)}</li>
              <li>Payment Method: ${order.paymentMethod}</li>
              <li>Transaction ID: ${order.paymentResult.id}</li>
              <li>Date: ${new Date(order.paidAt).toLocaleString()}</li>
            </ul>
            
            <p>Your order will be processed and shipped soon. You'll receive another email when your order is on its way.</p>
            
            <p>Thank you for shopping with Medi-ghor!</p>
          </div>
          
          <div style="background-color: #f2f2f2; padding: 15px; text-align: center; margin-top: 20px;">
            <p>© ${new Date().getFullYear()} Medi-ghor. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Send the email using the transporter

    transporter
      .sendMail(mailOptions)
      .then((info) =>
        console.log('Payment confirmation email sent:', info.messageId)
      )
      .catch((err) =>
        console.error('Error sending payment confirmation email:', err)
      );

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @description  Get logged in user orders
// @route        GET /api/orders/myorders
//@access        private

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  if (orders) {
    res.json(orders);
  } else {
    res.status(404);
    throw new Error('Orders not found');
  }
});

// @description  Get all orders
// @route        GET /api/orders
//@access        private/admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name email');
  if (orders) {
    res.json(orders);
  } else {
    res.status(404);
    throw new Error('Orders not found');
  }
});

// @description  Update order to delivered
// @route        PUT /api/orders/:id/deliver
// @access       private/adminOrHigher
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    // For Cash on Delivery orders, mark as paid when delivered
    if (order.paymentMethod === 'CashOnDelivery' && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: `COD_${order._id}`,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        payment_source: 'Cash on Delivery',
      };

      // Reduce inventory for COD orders when delivered (payment confirmed)
      if (!order.inventoryReduced) {
        const inventoryReduced = await reduceProductInventory(
          order.orderItems,
          'COD delivery/payment'
        );
        if (inventoryReduced) {
          order.inventoryReduced = true;
        }
      } else {
        console.log(
          '📦 Inventory already reduced for this COD order, skipping...'
        );
      }
    }

    const updatedOrder = await order.save();

    // Send delivery confirmation email
    sendOrderDeliveredEmail(updatedOrder).then((sent) => {
      if (sent) {
        console.log(
          `Order delivery confirmation email sent to ${order.user.email}`
        );
      } else {
        console.log(
          `Failed to send order delivery email to ${order.user.email}`
        );
      }
    });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @description  Track order by ID (public access)
// @route        GET /api/orders/track/:id
// @access       public
const trackOrderById = asyncHandler(async (req, res) => {
  const searchId = req.params.id.trim().toLowerCase();
  let order = null;

  try {
    // First, try to find by exact ObjectId if it's 24 characters
    if (searchId.length === 24 && /^[0-9a-fA-F]{24}$/i.test(searchId)) {
      order = await Order.findById(searchId).populate('user', 'name email');
    }

    // If not found, search using aggregation pipeline to convert ObjectId to string
    if (!order && searchId.length >= 4) {
      const orders = await Order.aggregate([
        {
          $addFields: {
            idString: { $toString: '$_id' },
          },
        },
        {
          $match: {
            idString: { $regex: new RegExp('^' + searchId, 'i') },
          },
        },
        {
          $limit: 1,
        },
      ]);

      if (orders.length > 0) {
        // Populate the user field manually since aggregation doesn't support populate
        order = await Order.findById(orders[0]._id).populate(
          'user',
          'name email'
        );
      }
    }

    // If still not found, try broader search
    if (!order && searchId.length >= 6) {
      const orders = await Order.aggregate([
        {
          $addFields: {
            idString: { $toString: '$_id' },
          },
        },
        {
          $match: {
            idString: { $regex: new RegExp(searchId, 'i') },
          },
        },
        {
          $limit: 1,
        },
      ]);

      if (orders.length > 0) {
        order = await Order.findById(orders[0]._id).populate(
          'user',
          'name email'
        );
      }
    }
  } catch (error) {
    console.log('Error in order search:', error.message);
  }

  if (order) {
    // Sync legacy orders with new status system
    if (
      !order.currentStatus ||
      !order.statusHistory ||
      order.statusHistory.length === 0
    ) {
      console.log('Syncing legacy order status for tracking...');

      // Initialize status history if not exists
      if (!order.statusHistory) {
        order.statusHistory = [];
      }

      // Determine current status based on legacy fields
      let syncedStatus = 'pending';
      if (order.isDelivered) {
        syncedStatus = 'delivered';
      } else if (order.isPaid) {
        syncedStatus = 'processing';
      }

      // Set current status
      order.currentStatus = syncedStatus;

      // Build status history based on legacy data
      const statusHistory = [];

      // Order placed
      statusHistory.push({
        status: 'pending',
        timestamp: order.createdAt,
        updatedBy: order.user._id,
        notes: 'Order placed (legacy sync)',
      });

      // Payment confirmed
      if (order.isPaid) {
        statusHistory.push({
          status: 'payment_confirmed',
          timestamp: order.paidAt || order.createdAt,
          updatedBy: order.user._id,
          notes: `Payment confirmed via ${order.paymentMethod} (legacy sync)`,
        });

        // Processing
        statusHistory.push({
          status: 'processing',
          timestamp: order.paidAt || order.createdAt,
          updatedBy: order.user._id,
          notes: 'Order processing (legacy sync)',
        });
      }

      // Delivered
      if (order.isDelivered) {
        statusHistory.push({
          status: 'delivered',
          timestamp: order.deliveredAt || order.updatedAt,
          updatedBy: order.user._id,
          notes: 'Order delivered (legacy sync)',
        });
      }

      // Update the order with synced status
      order.statusHistory = statusHistory;
      await order.save();
    }

    // Return limited order information for public tracking
    res.json({
      _id: order._id,
      orderItems: order.orderItems,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      itemsPrice: order.itemsPrice,
      taxPrice: order.taxPrice,
      shippingPrice: order.shippingPrice,
      totalPrice: order.totalPrice,
      isPaid: order.isPaid,
      paidAt: order.paidAt,
      isDelivered: order.isDelivered,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      currentStatus: order.currentStatus,
      statusHistory: order.statusHistory,
      // Hide sensitive user information for public access
      user: {
        name: order.user.name,
      },
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @description  Update order status
// @route        PUT /api/orders/:id/status
// @access       private/adminOrHigher
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const validStatuses = [
    'pending',
    'payment_confirmed',
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    // Add new status to history
    const statusUpdate = {
      status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      notes: notes || '',
    };

    order.statusHistory.push(statusUpdate);
    order.currentStatus = status;

    // Update legacy fields for backward compatibility
    if (
      status === 'payment_confirmed' ||
      status === 'processing' ||
      status === 'shipped' ||
      status === 'out_for_delivery' ||
      status === 'delivered'
    ) {
      if (!order.isPaid && status !== 'pending') {
        order.isPaid = true;
        order.paidAt = new Date();
        if (
          order.paymentMethod === 'CashOnDelivery' &&
          status === 'delivered'
        ) {
          order.paymentResult = {
            id: `COD_${order._id}`,
            status: 'COMPLETED',
            update_time: new Date().toISOString(),
            payment_source: 'Cash on Delivery',
          };
        }
      }
    }

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    // Restore inventory if order is cancelled and payment was already processed
    if (status === 'cancelled' && order.isPaid && order.inventoryReduced) {
      const inventoryRestored = await restoreProductInventory(
        order.orderItems,
        'order cancellation'
      );
      if (inventoryRestored) {
        order.inventoryReduced = false;
      }
    }

    const updatedOrder = await order.save();

    // Send status update email if needed
    if (status === 'delivered') {
      sendOrderDeliveredEmail(updatedOrder).then((sent) => {
        if (sent) {
          console.log(
            `Order delivery confirmation email sent to ${order.user.email}`
          );
        } else {
          console.log(
            `Failed to send order delivery email to ${order.user.email}`
          );
        }
      });
    }

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
  trackOrderById,
  updateOrderStatus,
};
