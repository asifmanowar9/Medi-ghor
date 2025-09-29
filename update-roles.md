# Role System Update Instructions

## Changes Made:

1. **Updated Users Data** (`backend/data/users.js`):
   - `admin@example.com` is now the **Super Admin** (password: `123456`)
   - All other users are **Normal Users** with `role: 'normal_user'`
   - Added example legacy user without role field

2. **Frontend Updates**:
   - Legacy users (without role field) are treated as normal users
   - Updated role display to show "User (Legacy)" for users without role field
   - Updated permissions to allow operators to manage legacy users
   - Added "Legacy User (No Role)" filter option

3. **Backend Updates**:
   - `canModifyUser()` function now treats legacy users as normal users
   - Operators can manage legacy users (those without role field)

## To Apply Changes:

### 1. Update Database (Run Seeder):
```bash
cd backend
npm run data:destroy  # Clear existing data
npm run data:import   # Import new data with updated roles
```

### 2. Test the System:

#### Login Credentials:
- **Super Admin**: `admin@example.com` / `123456`
- **Operator**: `operator@medighor.com` / `Operator@123`
- **Normal User**: `asif@example.com` / `123456`
- **Legacy User**: `legacy@example.com` / `123456` (no role field)

#### Expected Behavior:
- **Super Admin** can manage all users and assign any role
- **Operator** can only manage normal users and legacy users
- **Legacy Users** appear as "User (Legacy)" and are treated as normal users
- **Role filtering** includes option for "Legacy User (No Role)"

## Migration Strategy for Existing Users:

If you have existing users in production, you can run this script to update them:

```javascript
// In MongoDB shell or Node.js script:
// Update all users without role field to be normal_user
db.users.updateMany(
  { role: { $exists: false } },
  { 
    $set: { 
      role: "normal_user",
      isAdmin: false 
    } 
  }
)

// Set admin@example.com as super admin
db.users.updateOne(
  { email: "admin@example.com" },
  { 
    $set: { 
      role: "super_admin",
      isAdmin: true 
    } 
  }
)
```

## Notes:
- Legacy users without role field are automatically treated as normal users
- The system maintains backward compatibility
- All existing functionality continues to work
- Admin interface clearly shows role distinctions with icons and colors