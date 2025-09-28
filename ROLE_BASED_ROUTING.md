# Role-Based Routing Implementation

## Overview

This document describes the role-based routing system implemented for the Yi Farishtey application. The system ensures that only users with appropriate roles can access specific pages and functionality.

## Role Structure

### Available Roles

- **`ROLE_DEFAULT`** - Default user role with access to approval dashboard
- **`user`** - Regular user with basic access
- **`trainer`** - Training instructor with extended access
- **`admin`** - Administrator with full access
- **`super_admin`** - Super administrator with complete system access

### Role Hierarchy

```
super_admin > admin > ROLE_DEFAULT > trainer > user
```

## Protected Routes

### `/admin-dash` - Admin Dashboard
- **Access**: Only `ROLE_DEFAULT` users
- **Purpose**: Main dashboard for ROLE_DEFAULT users with access to approval functionality
- **Component**: `AdminDash`

### `/approval` - Approval Dashboard
- **Access**: Only `ROLE_DEFAULT` users
- **Purpose**: Training session approval and management
- **Component**: `AdminApprovalDashboard`

### `/book-training` - Book Training
- **Access**: All authenticated users
- **Purpose**: Training enrollment
- **Component**: `BookTraining`

### `/add-institution` - Add Institution
- **Access**: `ROLE_DEFAULT`, `admin`, `super_admin`
- **Purpose**: Institution management
- **Component**: `AddInstitution`

### `/add-trainer` - Add Trainer
- **Access**: `ROLE_DEFAULT`, `admin`, `super_admin`
- **Purpose**: Trainer management
- **Component**: `AddTrainer`

### `/admin-ins-tra` - Admin Institution/Trainer
- **Access**: `ROLE_DEFAULT`, `admin`, `super_admin`
- **Purpose**: Combined institution and trainer management
- **Component**: `AdminApprovalPage`

### `/request-status` - Request Status
- **Access**: All authenticated users
- **Purpose**: View training request status
- **Component**: `RequestStatus`

### `/super-admin-approval` - Super Admin Dashboard
- **Access**: Only `super_admin`
- **Purpose**: System-wide administration
- **Component**: `SuperAdminApprovalDashboard`

## Implementation Details

### Components

#### ProtectedRoute
- **Location**: `src/components/ProtectedRoute.jsx`
- **Purpose**: Wraps routes to enforce role-based access control
- **Usage**: 
```jsx
<ProtectedRoute allowedRoles={['ROLE_DEFAULT']}>
  <Component />
</ProtectedRoute>
```

#### Unauthorized
- **Location**: `src/components/Unauthorized.jsx`
- **Purpose**: Displays when users don't have access to a page
- **Route**: `/unauthorized`

### Utilities

#### roleUtils.js
- **Location**: `src/utils/roleUtils.js`
- **Functions**:
  - `getCurrentUserRole()` - Get current user's role
  - `hasRole(role)` - Check if user has specific role
  - `hasAnyRole(roles)` - Check if user has any of the specified roles
  - `canAccessApproval()` - Check approval page access
  - `canAccessAdmin()` - Check admin function access
  - `canAccessSuperAdmin()` - Check super admin access

### Navigation

The Header component automatically shows navigation links based on user roles:
- **Admin Dashboard**: Only for `ROLE_DEFAULT` users (accessed via direct URL)
- **Add Institution/Trainer**: For `ROLE_DEFAULT`, `admin`, `super_admin`
- **Super Admin**: Only for `super_admin` users

**Note**: The Approval Dashboard is now accessed through the Admin Dashboard for `ROLE_DEFAULT` users, not directly from the header.

## Usage Examples

### Protecting a New Route

```jsx
import ProtectedRoute from './components/ProtectedRoute';

// In App.jsx
<Route 
  path="/new-admin-page" 
  element={
    <ProtectedRoute allowedRoles={['ROLE_DEFAULT', 'admin']}>
      <NewAdminPage />
    </ProtectedRoute>
  } 
/>
```

### Checking Roles in Components

```jsx
import { hasRole, canAccessApproval } from '../utils/roleUtils';

function MyComponent() {
  if (hasRole('ROLE_DEFAULT')) {
    // Show approval-specific content
  }
  
  if (canAccessApproval()) {
    // Show approval functionality
  }
}
```

### Adding Role-Based Navigation

```jsx
import { canAccessAdmin } from '../utils/roleUtils';

// In Header component
{canAccessAdmin() && (
  <Link to="/admin-page">Admin Page</Link>
)}
```

## Testing

### Testing Role Access

1. **Set Role in localStorage**:
   ```javascript
   localStorage.setItem('role', 'ROLE_DEFAULT');
   ```

2. **Test Different Roles**:
   - `ROLE_DEFAULT` - Should access `/approval`
   - `user` - Should NOT access `/approval`
   - `admin` - Should access most admin functions
   - `super_admin` - Should access everything

3. **Test Unauthorized Access**:
   - Users without proper roles should be redirected to `/unauthorized`

### Common Test Scenarios

- **Unauthenticated User**: Redirected to `/signin`
- **Wrong Role**: Redirected to `/unauthorized`
- **Correct Role**: Access granted to protected page
- **Super Admin**: Access to all pages

## Security Notes

- Role checking is done on the client side for UX purposes
- Server-side validation should also be implemented for production
- Roles are stored in localStorage and should be validated on each request
- Consider implementing JWT tokens with role claims for better security

## Future Enhancements

- Add role-based UI elements (buttons, forms, etc.)
- Implement dynamic route generation based on user roles
- Add role change functionality for administrators
- Implement role-based API endpoint protection
- Add audit logging for role-based access

## Troubleshooting

### Common Issues

1. **Route Not Protected**: Ensure `ProtectedRoute` is wrapping the component
2. **Role Not Recognized**: Check localStorage for correct role value
3. **Infinite Redirects**: Verify role checking logic in `ProtectedRoute`
4. **Navigation Not Showing**: Check role utility functions and Header component

### Debug Steps

1. Check browser console for errors
2. Verify localStorage role value
3. Test role utility functions directly
4. Check component props and routing configuration
