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

// Function to send restock notification email
export const sendRestockNotificationEmail = async (user, product) => {
  try {
    const productImageUrl = product.image?.startsWith('http')
      ? product.image
      : product.image?.startsWith('/uploads')
      ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}${product.image}`
      : `${process.env.FRONTEND_URL || 'http://localhost:3000'}/uploads/${
          product.image
        }`;

    const productUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:3000'
    }/product/${product._id}`;

    const mailOptions = {
      from: `"Medi-ghor" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🎉 Great News! "${product.name}" is Back in Stock!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Back in Stock!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">The item from your wishlist is now available</p>
          </div>
          
          <!-- Product Section -->
          <div style="padding: 30px 20px; background-color: white; border-left: 1px solid #e9ecef; border-right: 1px solid #e9ecef;">
            <div style="text-align: center; margin-bottom: 25px;">
              <img src="${productImageUrl}" alt="${
        product.name
      }" style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
            </div>
            
            <h2 style="color: #2c3e50; text-align: center; margin-bottom: 15px; font-size: 24px;">${
              product.name
            }</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span style="color: #6c757d; font-size: 16px;">Price:</span>
                <span style="color: #28a745; font-size: 24px; font-weight: bold;">৳${
                  product.price
                }</span>
              </div>
              
              ${
                product.brand
                  ? `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span style="color: #6c757d; font-size: 16px;">Brand:</span>
                <span style="color: #495057; font-size: 16px; font-weight: 500;">${product.brand}</span>
              </div>
              `
                  : ''
              }
              
              ${
                product.category
                  ? `
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #6c757d; font-size: 16px;">Category:</span>
                <span style="color: #495057; font-size: 16px; font-weight: 500;">${
                  typeof product.category === 'object'
                    ? product.category.name
                    : product.category
                }</span>
              </div>
              `
                  : ''
              }
            </div>
            
            <div style="text-align: center;">
              <a href="${productUrl}" style="display: inline-block; background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; margin-right: 10px; box-shadow: 0 4px 15px rgba(0,123,255,0.3);">
                🛒 Buy Now
              </a>
              <a href="${
                process.env.FRONTEND_URL || 'http://localhost:3000'
              }/wishlist" style="display: inline-block; background: linear-gradient(135deg, #6c757d, #495057); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(108,117,125,0.3);">
                💝 View Wishlist
              </a>
            </div>
          </div>
          
          <!-- Message Section -->
          <div style="padding: 25px 20px; background-color: white; border-left: 1px solid #e9ecef; border-right: 1px solid #e9ecef;">
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">Dear ${
              user.name
            },</p>
            
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
              Great news! The product "<strong>${
                product.name
              }</strong>" that you added to your wishlist is now back in stock and ready to order.
            </p>
            
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
              Don't wait too long - popular items tend to go out of stock quickly. Click the "Buy Now" button above to secure your order today!
            </p>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>💡 Pro Tip:</strong> Items are allocated on a first-come, first-served basis. Order now to avoid disappointment!
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #2c3e50; color: white; padding: 25px 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0 0 10px 0; font-size: 16px;">Thank you for choosing Medi-ghor!</p>
            <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 0.8;">Your trusted healthcare partner</p>
            
            <div style="border-top: 1px solid #495057; padding-top: 15px; margin-top: 15px;">
              <p style="margin: 0; font-size: 12px; opacity: 0.7;">
                © ${new Date().getFullYear()} Medi-ghor. All rights reserved.<br>
                This email was sent to ${
                  user.email
                } because you have this item in your wishlist.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Restock notification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending restock notification email:', error);
    return false;
  }
};

export default transporter;
