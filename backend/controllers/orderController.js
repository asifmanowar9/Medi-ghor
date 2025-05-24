import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js'; // Add this import
import transporter from '../config/emailConfig.js';
import {
  sendOrderConfirmationEmail,
  sendOrderDeliveredEmail,
} from '../config/emailConfig.js';

// @description  Create new order
// @route        POST /api/orders
// @access       private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
    return;
  } else {
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
    });

    // Save the order to the database
    const createdOrder = await order.save();

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
    sendOrderConfirmationEmail(orderWithUser).then((sent) => {
      if (sent) {
        console.log(`Order confirmation email sent to ${user.email}`);
      } else {
        console.log(`Failed to send order confirmation email to ${user.email}`);
      }
    });

    // Return the created order
    res.status(201).json(createdOrder);
  }
});

// @description  get order by ID
// @route        Get /api/orders/:id
//@access        private;

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
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
  const orders = await Order.find({}).populate('user', 'id name');
  if (orders) {
    res.json(orders);
  } else {
    res.status(404);
    throw new Error('Orders not found');
  }
});

// @description  Update order to delivered
// @route        PUT /api/orders/:id/deliver
// @access       private/admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

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

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
};
