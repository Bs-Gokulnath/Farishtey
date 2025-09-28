# Alert Component Usage Guide

This project now uses a custom Alert component instead of the browser's default `alert()` function. The Alert component provides a much better user experience with styled popups that appear in the center of the screen.

## Components

### Alert.jsx
A reusable alert component that displays as a centered popup with different types and auto-dismiss functionality.

### useAlert.js
A custom hook that provides easy-to-use functions for managing alert state.

## Usage

### Basic Setup

1. Import the components in your file:
```jsx
import Alert from "../components/Alert";
import useAlert from "../components/useAlert";
```

2. Use the hook in your component:
```jsx
const { alert, showSuccess, showError, showWarning, showInfo, hideAlert } = useAlert();
```

3. Add the Alert component to your JSX:
```jsx
return (
  <div>
    {/* Alert Component */}
    <Alert
      isVisible={alert.isVisible}
      message={alert.message}
      type={alert.type}
      onClose={hideAlert}
      duration={alert.duration}
      position={alert.position}
    />
    
    {/* Your other components */}
  </div>
);
```

### Available Functions

- `showSuccess(message, duration, position)` - Shows a green success alert
- `showError(message, duration, position)` - Shows a red error alert  
- `showWarning(message, duration, position)` - Shows a yellow warning alert
- `showInfo(message, duration, position)` - Shows a blue info alert
- `showAlert(message, type, duration, position)` - Generic function for custom types
- `hideAlert()` - Manually hide the alert

### Parameters

- `message` (string): The text to display
- `type` (string): One of "success", "error", "warning", "info"
- `duration` (number): Auto-dismiss time in milliseconds (default: 4000ms)
- `position` (string): Position on screen (default: "center")
  - Options: "center", "top", "bottom", "top-right", "top-left", "bottom-right", "bottom-left"

### Examples

```jsx
// Success message
showSuccess("Operation completed successfully!");

// Error message with custom duration
showError("Something went wrong!", 6000);

// Warning message in top-right corner
showWarning("Please check your input", 3000, "top-right");

// Info message
showInfo("Processing your request...");
```

## Features

- **Auto-dismiss**: Alerts automatically disappear after the specified duration
- **Manual close**: Users can click the X button or backdrop to close
- **Progress bar**: Visual indicator showing time until auto-dismiss
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Smooth animations**: Fade in/out with scale effects
- **Backdrop blur**: Modern glassmorphism effect

## Migration from alert()

### Before (Old way):
```jsx
alert("Success message");
alert("Error message");
```

### After (New way):
```jsx
showSuccess("Success message");
showError("Error message");
```

## Files Updated

The following files have been updated to use the new Alert component:

- `src/auth/signin.jsx`
- `src/auth/signup.jsx`
- `src/pages/add_inst.jsx`
- `src/pages/add_train.jsx`
- `src/pages/approval_dashboard.jsx`
- `src/pages/SuperAdminApprovalDashboard.jsx`

All `alert()` function calls have been replaced with appropriate alert types from the useAlert hook.
