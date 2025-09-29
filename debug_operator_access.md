# Debug: Operator Access to Cash on Delivery Orders

## Problem
Operators cannot access cash on delivery orders.

## System Analysis

### Backend Access Control
✅ **Route Protection**: `/api/orders/:id/deliver` uses `adminOrHigher` middleware
✅ **Middleware Logic**: `adminOrHigher` includes operators (`operator` role)
✅ **Controller Logic**: `updateOrderToDelivered` handles COD orders correctly

### Frontend Access Control
✅ **Permission Check**: `hasAdminPrivileges()` includes operators
✅ **Order Deliverability**: `isOrderDeliverable()` allows COD orders
✅ **UI Rendering**: Admin actions show for operators

### User Model
✅ **Role Field**: Supports `operator` role
✅ **Token Generation**: Includes role in JWT

## Debugging Steps

### 1. Verify Operator User Role
Check if the operator user has the correct role in the database:
```javascript
// In MongoDB or through admin panel
db.users.findOne({email: "operator@example.com"}, {role: 1, isAdmin: 1})
```

### 2. Check Frontend Token
Verify the user token contains the correct role:
```javascript
// In browser console
console.log(JSON.parse(localStorage.getItem('userInfo')));
```

### 3. Test API Endpoint
Test the deliver endpoint directly:
```bash
curl -X PUT \
  http://localhost:5000/api/orders/{ORDER_ID}/deliver \
  -H "Authorization: Bearer {OPERATOR_TOKEN}"
```

### 4. Check Network Requests
Monitor browser network tab for:
- 403 Forbidden responses
- Missing Authorization headers
- Role validation errors

## Likely Issues

1. **Database Role**: Operator user might have `normal_user` role instead of `operator`
2. **Token Mismatch**: Frontend token might be stale or incorrect
3. **Session Issue**: User might need to log out and log back in
4. **Role Assignment**: User might need role updated in database

## Quick Fix

Update the operator user role in database:
```javascript
db.users.updateOne(
  {email: "operator@example.com"}, 
  {$set: {role: "operator"}}
)
```

Then have the operator log out and log back in to get a fresh token.