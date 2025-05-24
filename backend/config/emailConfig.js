import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send order confirmation email
export const sendOrderConfirmationEmail = async (order) => {
  try {
    // Calculate order total for display in email
    const itemsTotal = order.orderItems
      .reduce((acc, item) => acc + item.price * item.qty, 0)
      .toFixed(2);

    // Format order items for the email
    const orderItemsList = order.orderItems
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.qty}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">$${item.price.toFixed(
              2
            )}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">$${(
              item.qty * item.price
            ).toFixed(2)}</td>
          </tr>`
      )
      .join('');

    // Setup email data
    const mailOptions = {
      from: `"Medi-ghor" <${process.env.EMAIL_USER}>`,
      to: order.user.email,
      subject: `Medi-ghor - Order Confirmation #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4a90e2; color: white; padding: 20px; text-align: center;">
            <h1>Thank you for your order!</h1>
            <p>Order #${order._id}</p>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
            <h2>Order Confirmation</h2>
            <p>Dear ${order.user.name},</p>
            <p>Your order has been received and is being processed. Here's a summary of your purchase:</p>
            
            <h3>Order Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Product</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Quantity</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Price</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsList}
              </tbody>
              <tfoot>
                <tr style="background-color: #f2f2f2;">
                  <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Items Total:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">$${itemsTotal}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Shipping:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">$${order.shippingPrice.toFixed(
                    2
                  )}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Tax:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">$${order.taxPrice.toFixed(
                    2
                  )}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                  <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Order Total:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>$${order.totalPrice.toFixed(
                    2
                  )}</strong></td>
                </tr>
              </tfoot>
            </table>
            
            <h3>Shipping Information:</h3>
            <p>
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city}, ${
        order.shippingAddress.postalCode
      }<br>
              ${order.shippingAddress.country}
            </p>
            
            <h3>Payment Method:</h3>
            <p>${order.paymentMethod}</p>
            
            <p>You can track your order status by visiting your account page on our website.</p>
            
            <p>If you have any questions about your order, please contact our customer service.</p>
            
            <p>Thank you for shopping with Medi-ghor!</p>
          </div>
          
          <div style="background-color: #f2f2f2; padding: 15px; text-align: center; margin-top: 20px;">
            <p>© ${new Date().getFullYear()} Medi-ghor. All rights reserved.</p>
            <p>This email was sent to ${order.user.email}</p>
          </div>
        </div>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    // Don't throw the error, just log it, so it doesn't break the order flow if email fails
    return false;
  }
};

// Function to send order delivered notification email
export const sendOrderDeliveredEmail = async (order) => {
  try {
    const mailOptions = {
      from: `"Medi-ghor" <${process.env.EMAIL_USER}>`,
      to: order.user.email,
      subject: `Medi-ghor - Your Order #${order._id} Has Been Delivered`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4a90e2; color: white; padding: 20px; text-align: center;">
            <h1>Your Order Has Been Delivered!</h1>
            <p>Order #${order._id}</p>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
            <h2>Delivery Confirmation</h2>
            <p>Dear ${order.user.name},</p>
            <p>We're pleased to inform you that your order has been delivered.</p>
            
            <p>Thank you for shopping with Medi-ghor! We hope you enjoy your products.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
          </div>
          
          <div style="background-color: #f2f2f2; padding: 15px; text-align: center; margin-top: 20px;">
            <p>© ${new Date().getFullYear()} Medi-ghor. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order delivered email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order delivered email:', error);
    return false;
  }
};

export default transporter;
