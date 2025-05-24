// Email template generator

export const getOrderConfirmationTemplate = (order, user) => {
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

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4a90e2; color: white; padding: 20px; text-align: center;">
        <h1>Thank you for your order!</h1>
        <p>Order #${order._id}</p>
      </div>
      
      <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
        <h2>Order Confirmation</h2>
        <p>Dear ${user.name},</p>
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
              <td style="padding: 8px; border: 1px solid #ddd;">$${order.itemsPrice.toFixed(
                2
              )}</td>
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
          ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
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
        <p>This email was sent to ${user.email}</p>
      </div>
    </div>
  `;
};

// Add more email templates as needed
