# Notifications System - Integration Guide

## Quick Start

### Frontend - Already Integrated ✅

All 3 dashboards now have notification bells:
- **Admin Dashboard**: `/admin/*`
- **Doctor Dashboard**: `/doctor/*`
- **Patient Dashboard**: `/patient/*`

Notification bell appears in the header of each layout and shows:
- Unread count badge
- Dropdown with recent notifications
- "Mark all read" button
- Full notifications page at `/patient/notifications`, `/doctor/notifications`, `/admin/notifications`

### Use in Components

```jsx
import { useNotifications } from "../../hooks/useNotifications";

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications({
    role: "patient"
  });

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map(n => (
        <div key={n._id}>
          <h4>{n.title}</h4>
          <button onClick={() => markAsRead(n._id)}>Read</button>
        </div>
      ))}
    </div>
  );
}
```

## Backend Implementation

### 1. Create Notification Model

Create `services/notification-service/models/Notification.js`:

```javascript
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'appointment',
      'payment',
      'consultation',
      'verification',
      'prescription',
      'report',
      'system',
      'message',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  actionUrl: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
```

### 2. Create Notification Routes

Create `services/notification-service/routes/notifications.js`:

```javascript
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// Get notifications
router.get('/', auth, async (req, res) => {
  try {
    const { role, limit = 20, skip = 0, isRead } = req.query;
    const userId = req.user.id;

    const query = { userId };
    
    if (role) query.role = role;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.json({
      notifications,
      unreadCount,
      total: await Notification.countDocuments(query),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, updatedAt: new Date() },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all as read
router.put('/read-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, updatedAt: new Date() }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });
    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all notifications
router.delete('/delete-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.deleteMany({ userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 3. Create Notification Helper

Create `shared/utils/notificationHelper.js`:

```javascript
const axios = require('axios');

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5000/notifications';

/**
 * Send notification to user
 * @param {string} userId - User ID
 * @param {string} role - User role (patient, doctor, admin)
 * @param {string} type - Notification type
 * @param {object} notification - Notification data
 */
async function sendNotification(userId, role, type, notification) {
  try {
    const payload = {
      userId,
      role,
      type,
      title: notification.title,
      message: notification.message,
      data: notification.data || null,
      actionUrl: notification.actionUrl || null,
    };

    await axios.post(NOTIFICATION_SERVICE_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SERVICE_TOKEN}`,
      },
    });

    console.log(`Notification sent to user ${userId}`);
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Send appointment notification
 */
async function notifyAppointmentBooked(patientId, doctorId, appointmentData) {
  await sendNotification(patientId, 'patient', 'appointment', {
    title: 'Appointment Confirmed',
    message: `Your appointment with Dr. ${appointmentData.doctorName} is scheduled for ${appointmentData.date}`,
    data: { appointmentId: appointmentData._id },
    actionUrl: `/patient/appointments/${appointmentData._id}`,
  });

  await sendNotification(doctorId, 'doctor', 'appointment', {
    title: 'New Appointment Booked',
    message: `${appointmentData.patientName} booked an appointment for ${appointmentData.date}`,
    data: { appointmentId: appointmentData._id },
    actionUrl: `/doctor/appointments/${appointmentData._id}`,
  });
}

/**
 * Send payment notification
 */
async function notifyPaymentProcessed(userId, userRole, paymentData) {
  await sendNotification(userId, userRole, 'payment', {
    title: 'Payment Processed',
    message: `Your payment of ${paymentData.amount} has been ${paymentData.status}`,
    data: { paymentId: paymentData._id },
    actionUrl: `/${userRole}/payments/${paymentData._id}`,
  });
}

/**
 * Send doctor verification notification
 */
async function notifyDoctorVerification(doctorId, status) {
  const title = status === 'approved' 
    ? 'Doctor Verification Approved'
    : 'Doctor Verification Status Update';

  const message = status === 'approved'
    ? 'Your doctor profile has been approved. You can now accept appointments.'
    : 'Your doctor profile verification status has been updated.';

  await sendNotification(doctorId, 'doctor', 'verification', {
    title,
    message,
    data: { status },
    actionUrl: '/doctor/profile',
  });
}

/**
 * Send consultation notification
 */
async function notifyConsultationRequest(doctorId, patientName) {
  await sendNotification(doctorId, 'doctor', 'consultation', {
    title: 'Video Consultation Request',
    message: `${patientName} has requested a video consultation`,
    data: { type: 'new_request' },
    actionUrl: '/doctor/consultations',
  });
}

module.exports = {
  sendNotification,
  notifyAppointmentBooked,
  notifyPaymentProcessed,
  notifyDoctorVerification,
  notifyConsultationRequest,
};
```

### 4. Integrate with Services

**Example: In appointment-service**

```javascript
const { notifyAppointmentBooked } = require('../../shared/utils/notificationHelper');

// After creating appointment
app.post('/appointments', async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    
    // Send notifications
    await notifyAppointmentBooked(
      appointment.patientId,
      appointment.doctorId,
      appointment
    );

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 5. Set Up API Gateway Routes

In `api-gateway/index.js`:

```javascript
// Notification routes
app.use('/notifications', 
  require('./routes/notification-routes')
);
```

Create `api-gateway/routes/notification-routes.js`:

```javascript
const express = require('express');
const axios = require('axios');

const router = express.Router();
const NOTIFICATION_SERVICE_URL = 
  process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3001';

// Forward all notification requests to notification service
router.all('/:path*', async (req, res) => {
  try {
    const config = {
      method: req.method,
      url: `${NOTIFICATION_SERVICE_URL}/${req.params.path}`,
      params: req.query,
      headers: {
        Authorization: req.headers.authorization,
      },
    };

    if (req.body) {
      config.data = req.body;
    }

    const response = await axios(config);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
    });
  }
});

module.exports = router;
```

## WebSocket Support (Optional but Recommended)

For real-time notifications, add WebSocket support:

```javascript
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  // User joins their notification room
  socket.on('join-notifications', ({ userId }) => {
    socket.join(`notifications-${userId}`);
    console.log(`User ${userId} joined notifications`);
  });

  // Broadcast notification to specific user
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// After creating notification
io.to(`notifications-${userId}`).emit('notification', notificationData);
```

Use in frontend:

```javascript
useEffect(() => {
  const socket = io(SOCKET_URL);
  socket.emit('join-notifications', { userId: user.id });

  socket.on('notification', (notification) => {
    // Update notifications in real-time
    setNotifications(prev => [notification, ...prev]);
  });

  return () => socket.disconnect();
}, [user.id]);
```

## Testing Notifications

### Manual Test

1. Create test endpoint in notification-service:

```javascript
router.post('/test', auth, async (req, res) => {
  const notification = await Notification.create({
    userId: req.user.id,
    role: req.user.role,
    type: 'system',
    title: 'Test Notification',
    message: 'This is a test notification',
  });
  res.json(notification);
});
```

2. Send test notification:

```bash
curl -X POST http://localhost:5000/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### E2E Test Flow

1. Book appointment → Notification appears
2. Process payment → Notification appears
3. Request consultation → Notification appears
4. Approve/reject doctor → Notification appears
5. Click notification → Mark as read
6. Click "Mark all read" → All marked as read
7. Refresh page → Notification count persists

## Environment Variables

Add to `.env` files:

**Backend services:**
```
NOTIFICATION_SERVICE_URL=http://localhost:5000/notifications
SERVICE_TOKEN=your_service_token
```

**API Gateway:**
```
NOTIFICATION_SERVICE_URL=http://notification-service:3001
```

**Frontend (.env.local):**
```
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

## Performance Optimization

1. **Polling Interval**: Default 30 seconds
   - Adjust in NotificationBell.jsx
   - Use shorter intervals for real-time apps

2. **Notification Retention**: 
   - Keep last 100 notifications per user
   - Archive old notifications

3. **Database Indexes**:
   - userId (fast user lookups)
   - isRead (fast unread counts)
   - createdAt (efficient sorting)

4. **Pagination**:
   - Load 20 notifications per request
   - Implement infinite scroll

## Troubleshooting

### Notifications not appearing
- Check API endpoint accessibility
- Verify authentication token
- Check browser console for errors
- Verify backend notification creation

### Incorrect counts
- Clear browser cache
- Refresh page
- Check database integrity

### Performance issues
- Increase polling interval
- Add database indexes
- Implement pagination
- Use WebSocket instead of polling

## Next Steps

1. ✅ Set up notification-service with models and routes
2. ✅ Add notificationHelper.js to shared utils
3. ✅ Integrate with all services (appointments, payments, doctor verification)
4. ✅ Test notification flows
5. Optional: Add WebSocket for real-time updates
6. Optional: Add push notifications
7. Optional: Add notification preferences
