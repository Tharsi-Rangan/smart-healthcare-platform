# Notification System Setup Guide

## Overview

The notification system has been integrated into all 3 dashboards (Admin, Doctor, Patient) with a reusable bell icon component that displays notifications in real-time.

## Architecture

### Components

1. **NotificationBell Component** (`src/components/common/NotificationBell.jsx`)
   - Reusable bell icon with dropdown menu
   - Displays unread notification count
   - Real-time polling every 30 seconds
   - Mark notifications as read
   - Mark all notifications as read

### Layouts Updated

1. **AdminLayout** - Bell icon in header (admin role)
2. **DoctorLayout** - Bell icon in header (doctor role)
3. **PatientLayout** - Replaced static bell with functional NotificationBell (patient role)

### API Services

**notificationApi.js** provides:
- `getNotifications(filters)` - Fetch notifications with optional filters
- `markNotificationAsRead(notificationId)` - Mark single notification as read
- `markAllNotificationsAsRead()` - Mark all notifications as read
- `deleteNotification(notificationId)` - Delete specific notification
- `deleteAllNotifications()` - Clear all notifications
- `getUnreadCount()` - Get unread notification count

## Features

### 1. Bell Icon Display
- Shows unread notification count badge
- Red pulsing dot when notifications available
- Click to open dropdown menu

### 2. Notification Dropdown
- **Header**: Shows notification count with "Mark all read" button
- **Notifications List**: 
  - Displays up to 10 recent notifications
  - Shows notification type, title, message, and time
  - Color-coded by type (appointment, payment, etc.)
  - Click to mark as read
- **Footer**: Link to view all notifications page

### 3. Notification Types
Supported types with emoji indicators:
- 📅 **Appointment** - Doctor appointments and scheduling
- 💳 **Payment** - Payment confirmations and invoices
- 🎥 **Consultation** - Video consultation requests/updates
- ✓ **Verification** - Doctor verification status
- 💊 **Prescription** - Prescription updates
- 📄 **Report** - Medical reports available
- ⚙️ **System** - System notifications
- 💬 **Message** - Messages from other users

### 4. Color Coding
Each notification type has a unique background color:
- Appointment: Blue
- Payment: Green
- Consultation: Purple
- Verification: Amber
- Prescription: Pink
- Report: Cyan
- System: Gray
- Message: Indigo

## Usage

### In Layouts
```jsx
import NotificationBell from "../components/common/NotificationBell";

// In header section
<NotificationBell role="admin" />  // or "doctor" or "patient"
```

### Component Props
- `role` (string): User role - "admin", "doctor", or "patient"
  - Used to filter notifications by role
  - Matches backend role-based notification filtering

## Backend Integration

### Expected API Endpoint
```
GET /api/notifications
  - Query params: { role, limit, skip, isRead, type }
  - Returns: { notifications: Array, unreadCount: number }

PUT /api/notifications/:id/read
  - Marks single notification as read
  - Returns: { notification: Object }

PUT /api/notifications/read-all
  - Marks all notifications as read
  - Returns: { success: boolean }

GET /api/notifications/unread-count
  - Returns: { unreadCount: number }

DELETE /api/notifications/:id
  - Deletes notification
  - Returns: { success: boolean }

DELETE /api/notifications/delete-all
  - Clears all notifications
  - Returns: { success: boolean }
```

### Notification Object Structure
```javascript
{
  _id: "notification_id",
  userId: "user_id",
  role: "admin|doctor|patient",
  type: "appointment|payment|consultation|...",
  title: "Notification Title",
  message: "Notification message content",
  isRead: false,
  data: {
    // Additional data based on notification type
    appointmentId: "...",
    paymentId: "...",
    consultationId: "...",
  },
  createdAt: "2024-04-17T10:30:00Z",
  updatedAt: "2024-04-17T10:30:00Z"
}
```

## Real-Time Updates (Optional)

For real-time notifications without polling, implement WebSocket support:

### Setup WebSocket Handler
```javascript
// services/notificationSocket.js
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

export const connectNotifications = (userId) => {
  socket.emit('join-notifications', { userId });
};

export const onNotificationReceived = (callback) => {
  socket.on('notification', callback);
};

export const disconnectNotifications = () => {
  socket.disconnect();
};
```

### Use in NotificationBell
```javascript
useEffect(() => {
  const userId = user?.id; // from auth context
  connectNotifications(userId);

  onNotificationReceived((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  });

  return () => disconnectNotifications();
}, [user]);
```

## Polling Configuration

Current polling interval: **30 seconds**

To adjust, modify in `NotificationBell.jsx`:
```javascript
const interval = setInterval(fetchNotifications, 30000); // Change 30000 to desired ms
```

## Testing

### Test Notification Types
1. **Appointment**: Schedule/cancel appointment → notification appears
2. **Payment**: Process payment → notification appears
3. **Consultation**: Request consultation → notification appears
4. **Verification** (Admin): Approve/reject doctor → notification appears

### Test Bell Functionality
1. ✅ Bell shows unread count badge
2. ✅ Click bell to open/close dropdown
3. ✅ Click notification to mark as read
4. ✅ "Mark all read" button clears count
5. ✅ New notifications appear in real-time

## Future Enhancements

1. **Push Notifications** - Browser push notifications for real-time alerts
2. **Email Notifications** - Send emails for critical updates
3. **SMS Alerts** - Text notifications for urgent matters
4. **Notification Preferences** - User-configurable notification settings
5. **Sound Alerts** - Audio notification for critical events
6. **Persistent Dropdown** - Option to pin notification menu
7. **Notification Filtering** - Filter by type in dropdown
8. **Bulk Actions** - Select multiple notifications for bulk actions

## Troubleshooting

### Notifications not appearing
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Confirm authorization token is valid
4. Check backend is returning notification data

### Incorrect notification counts
1. Refresh browser to reload data
2. Check for race conditions in mark as read
3. Verify backend isRead field is updating correctly

### Performance issues
1. Increase polling interval if server is slow
2. Limit number of notifications fetched
3. Implement pagination for large notification lists
4. Consider WebSocket for better performance

## API Gateway Routes

Ensure API Gateway at port 5000 routes to notification service:

```javascript
// api-gateway/routes
app.use('/notifications', require('./notification-routes'));
```

## References

- **NotificationBell Component**: `frontend/src/components/common/NotificationBell.jsx`
- **Notification API**: `frontend/src/services/notificationApi.js`
- **Layouts**: 
  - `frontend/src/layouts/AdminLayout.jsx`
  - `frontend/src/layouts/DoctorLayout.jsx`
  - `frontend/src/layouts/PatientLayout.jsx`
