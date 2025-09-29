// Utility functions for order-related operations

/**
 * Format order ID for consistent display across the application
 * @param {string} orderId - The full MongoDB ObjectId
 * @returns {string} - Formatted order ID (e.g., "#68DAB28B")
 */
export const formatOrderId = (orderId) => {
  if (!orderId) return '';
  return `#${orderId.substring(0, 8).toUpperCase()}`;
};

/**
 * Get order status information with color and icon
 * @param {Object} order - The order object
 * @returns {Object} - Status information object
 */
export const getOrderStatusInfo = (order) => {
  if (!order) return null;

  if (order.isDelivered) {
    return {
      status: 'delivered',
      label: 'Delivered',
      color: 'success',
      variant: 'success',
      icon: 'fas fa-check-circle',
    };
  } else if (order.isPaid) {
    return {
      status: 'processing',
      label: 'Processing',
      color: 'warning',
      variant: 'warning',
      icon: 'fas fa-box',
    };
  } else {
    return {
      status: 'pending',
      label: 'Payment Pending',
      color: 'danger',
      variant: 'danger',
      icon: 'fas fa-clock',
    };
  }
};

/**
 * Validate order ID format
 * @param {string} id - The order ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
export const validateOrderId = (id) => {
  if (!id) return false;
  const cleanId = id.replace(/[^a-zA-Z0-9]/g, '');
  return cleanId.length >= 4;
};

/**
 * Clean order ID input (remove special characters)
 * @param {string} id - The raw order ID input
 * @returns {string} - Cleaned order ID
 */
export const cleanOrderId = (id) => {
  if (!id) return '';
  return id.replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Check if user has admin privileges (admin, operator, or super_admin)
 * @param {Object} userInfo - The user info object
 * @returns {boolean} - Whether the user has admin privileges
 */
export const hasAdminPrivileges = (userInfo) => {
  if (!userInfo) return false;
  return (
    userInfo.isAdmin ||
    userInfo.role === 'operator' ||
    userInfo.role === 'super_admin'
  );
};

/**
 * Check if user can mark orders as delivered
 * @param {Object} userInfo - The user info object
 * @returns {boolean} - Whether the user can mark orders as delivered
 */
export const canMarkAsDelivered = (userInfo) => {
  return hasAdminPrivileges(userInfo);
};

/**
 * Check if order can be marked as delivered (considering COD orders)
 * @param {Object} order - The order object
 * @returns {boolean} - Whether the order can be marked as delivered
 */
export const isOrderDeliverable = (order) => {
  if (!order || order.isDelivered) return false;

  // Regular paid orders
  if (order.isPaid && !order.isDelivered) return true;

  // Cash on Delivery orders (even if not marked as paid)
  if (order.paymentMethod === 'CashOnDelivery' && !order.isDelivered)
    return true;

  return false;
};
