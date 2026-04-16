# Smart Healthcare Platform - Frontend Documentation

## 📋 Overview

The frontend is a comprehensive React-based single-page application that provides seamless integration with all backend microservices. It includes features for patients, doctors, and administrators.

## 🎯 Key Features

### For Patients
- **Authentication**: Secure login, registration, and password recovery
- **Dashboard**: Quick overview of health metrics and upcoming appointments
- **Doctor Search**: Find and view doctor profiles by specialty
- **Appointment Booking**: Book appointments with preferred doctors
- **Symptom Checker**: AI-powered symptom analysis using Gemini API
- **Medical Records**: Access medical history, reports, and prescriptions
- **Consultations**: Join live video consultations
- **Payments**: Secure payment processing
- **Notifications**: Real-time appointment and health notifications

### For Doctors
- **Dashboard**: View appointment schedule and patient list
- **Profile Management**: Update credentials and specialization
- **Availability Management**: Set working hours and time slots
- **Appointments**: Manage patient appointments
- **Consultations**: Conduct video consultations with patients
- **Prescriptions**: Create and manage prescriptions
- **Reports Review**: Review patient reports and test results

### For Administrators
- **Dashboard**: System overview and analytics
- **Doctor Verification**: Approve and manage doctor registrations
- **User Management**: Manage patient and doctor accounts
- **Doctor Management**: Monitor and manage all doctors
- **Transaction Monitoring**: Track payments and refunds

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── api/                 # API integration files
│   │   ├── adminUserApi.js
│   │   └── doctorApi.js
│   ├── app/
│   │   └── router/
│   │       └── AppRouter.jsx    # Main routing configuration
│   ├── components/
│   │   ├── auth/               # Authentication components
│   │   ├── common/             # Reusable components
│   │   └── patient/            # Patient-specific components
│   ├── features/
│   │   └── auth/               # Authentication logic
│   ├── hooks/                  # Custom React hooks
│   ├── layouts/                # Layout components
│   │   ├── AdminLayout.jsx
│   │   ├── DoctorLayout.jsx
│   │   ├── PatientLayout.jsx
│   │   └── PublicLayout.jsx
│   ├── pages/
│   │   ├── admin/              # Admin pages
│   │   ├── doctor/             # Doctor pages
│   │   ├── patient/            # Patient pages
│   │   ├── public/             # Public pages
│   │   └── shared/             # Shared pages (accessible by multiple roles)
│   ├── services/               # API service functions
│   │   ├── appointmentApi.js
│   │   ├── authApi.js
│   │   ├── consultationApi.js  # NEW
│   │   ├── notificationApi.js  # NEW
│   │   ├── patientService.js
│   │   ├── paymentApi.js       # NEW
│   │   ├── symptomCheckerApi.js # NEW
│   │   └── apiClient.js
│   ├── constants/
│   │   └── theme.js            # Theme configuration
│   ├── App.jsx                 # Main app component
│   └── main.jsx                # Entry point
├── public/
├── index.html
├── package.json
└── vite.config.js
```

## 📡 API Service Layers

### 1. Auth Service (Port 5001)
**File**: `services/authApi.js`
- User login/registration
- OTP verification
- Password reset
- JWT token management

### 2. Patient Service (Port 5002)
**File**: `services/patientService.js`
- Patient profile management
- Medical history
- Health records

### 3. Appointment Service (Port 5003)
**File**: `services/appointmentApi.js`
- Appointment booking
- Appointment management
- Schedule management

### 4. Consultation Service (Port 5004)
**File**: `services/consultationApi.js` ✨ NEW
- Video consultation sessions
- Consultation notes
- Session management

### 5. Payment Service (Port 5005)
**File**: `services/paymentApi.js` ✨ NEW
- Payment processing
- Invoice generation
- Refund management
- Transaction history

### 6. Doctor Service (Port 5006)
**File**: `services/doctorApi.js`
- Doctor profiles
- Availability schedules
- Doctor search

### 7. Symptom Checker Service (Port 5007)
**File**: `services/symptomCheckerApi.js` ✨ NEW
- AI symptom analysis
- Condition prediction
- Specialty recommendation

### 8. Notification Service (Port 5008)
**File**: `services/notificationApi.js` ✨ NEW
- Push notifications
- Email notifications
- SMS alerts

## 🔌 Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Authentication
VITE_JWT_STORAGE_KEY=healthcareToken

# Third-party Services
VITE_JITSI_DOMAIN=meet.jit.si
VITE_PAYHERE_MERCHANT_ID=your_merchant_id
```

## 🎨 Pages Overview

### Public Pages
- **HomePage** (`/`) - Landing page with features overview
- **AboutPage** (`/about`) - Company information
- **LoginPage** (`/login`) - User authentication
- **RegisterPage** (`/register`) - New user registration
- **VerifyOtpPage** (`/verify-otp`) - OTP verification
- **ForgotPasswordPage** (`/forgot-password`) - Password recovery request
- **ResetPasswordPage** (`/reset-password`) - New password setup
- **DoctorListPage** (`/doctors`) - Browse all doctors
- **DoctorDetailsPage** (`/doctors/:id`) - View doctor profile
- **SymptomCheckerPage** (`/symptoms`) - AI symptom analysis ✨ NEW
- **BookAppointmentPage** (`/book-appointment`) - Appointment booking
- **PaymentPage** (`/payment`) - Payment processing

### Patient Pages
- **DashboardPage** (`/patient/dashboard`) - Overview & quick actions
- **ProfilePage** (`/patient/profile`) - Edit patient profile
- **MedicalHistoryPage** (`/patient/medical-history`) - Medical records
- **ReportsPage** (`/patient/reports`) - Lab reports & test results
- **PrescriptionsPage** (`/patient/prescriptions`) - Medications
- **MyAppointmentsPage** (`/patient/appointments`) - Upcoming appointments
- **AppointmentHistoryPage** (`/patient/appointment-history`) - Past appointments ✨ NEW
- **NotificationsPage** (`/patient/notifications`) - Alerts & messages

### Doctor Pages
- **DashboardPage** (`/doctor/dashboard`) - Schedule & statistics
- **ProfilePage** (`/doctor/profile`) - Doctor profile
- **AvailabilityPage** (`/doctor/availability`) - Manage time slots
- **AppointmentsPage** (`/doctor/appointments`) - View appointments
- **ConsultationPage** (`/doctor/consultation`) - Video consultation interface
- **ReportsReviewPage** (`/doctor/reports`) - Patient test results
- **PrescriptionPage** (`/doctor/prescriptions`) - Create prescriptions

### Admin Pages
- **DashboardPage** (`/admin/dashboard`) - System overview
- **VerifyDoctorsPage** (`/admin/verify-doctors`) - Approve doctors
- **ManageDoctorsPage** (`/admin/manage-doctors`) - Doctor management
- **ManageUsersPage** (`/admin/manage-users`) - User management
- **TransactionsPage** (`/admin/transactions`) - Payment tracking

## 🔐 Authentication & Authorization

### Auth Context
**File**: `features/auth/AuthContext.jsx`

Provides:
- `useAuth()` hook for accessing authentication state
- User role-based access control
- Token management
- Login/logout functionality

### Protected Routes
**File**: `components/auth/ProtectedRoute.jsx`

- Validates user authentication
- Checks user role permissions
- Redirects unauthorized users

## 🎣 Custom Hooks

### usePatientProfile
Access and manage patient profile data

### useMedicalHistory
Fetch and filter medical records

### usePatientReports
Retrieve lab reports and test results

## 🎯 Routing Configuration

All routes are defined in `src/app/router/AppRouter.jsx` with role-based access control:

```jsx
// Public routes - no authentication required
<Route path="/" element={<PublicLayout />}>
  {/* public pages */}
</Route>

// Patient routes - require patient role
<Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
  <Route path="/patient" element={<PatientLayout />}>
    {/* patient pages */}
  </Route>
</Route>

// Doctor routes - require doctor role
<Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
  <Route path="/doctor" element={<DoctorLayout />}>
    {/* doctor pages */}
  </Route>
</Route>

// Admin routes - require admin role
<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
  <Route path="/admin" element={<AdminLayout />}>
    {/* admin pages */}
  </Route>
</Route>
```

## 🚀 Starting the Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173`

## 🌐 API Integration Pattern

All API calls follow this pattern:

```javascript
// services/symptomCheckerApi.js
export const analyzeSymptoms = async (symptomsData) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/symptom-checker/analyze`,
      symptomsData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

## 💳 Payment Integration

**Service**: PayHere (Sandbox)
**File**: `pages/shared/PaymentPage.jsx`

Features:
- Secure payment gateway
- Invoice generation
- Refund processing
- Payment history tracking

## 📹 Video Consultation

**Technology**: Jitsi Meet
**File**: `pages/shared/ConsultationPage.jsx`

Features:
- Real-time video/audio
- Screen sharing
- Recording capability
- Patient & doctor interaction

## 🤖 Symptom Checker AI

**Technology**: Google Gemini API
**Service**: Symptom Checker Service (Port 5007)
**File**: `pages/shared/SymptomCheckerPage.jsx`

Features:
- Symptom analysis
- Condition prediction
- Specialty recommendation
- Medical advice

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

## 🎨 Theme & Styling

**Theme File**: `constants/theme.js`

Primary Colors:
- Primary Purple: `#667eea`
- Secondary Purple: `#764ba2`
- Success: `#4caf50`
- Error: `#d32f2f`
- Warning: `#ff9800`

All pages use Tailwind CSS classes combined with custom CSS for styling.

## 📊 State Management

- React Context API for authentication
- React Hooks for local component state
- Local Storage for token persistence

## 🔄 Data Flow

1. User interacts with UI component
2. Component calls API service function
3. Service makes HTTP request to backend (via API Gateway)
4. Response is handled and state is updated
5. Component re-renders with new data

## 🐛 Error Handling

All API calls include error handling:
```javascript
try {
  // API call
} catch (error) {
  // Display error message to user
  setError(error?.response?.data?.message || "An error occurred");
}
```

## 📝 Developer Notes

1. **API Gateway**: All requests go through API Gateway at port 5000
2. **Authentication**: JWT token stored in localStorage
3. **Role-Based Access**: Three roles - patient, doctor, admin
4. **Notifications**: Real-time updates via notification service
5. **Consultation**: Video calls powered by Jitsi Meet

## 🔗 Service Port Mapping

| Service | Port | Frontend Path |
|---------|------|---------------|
| API Gateway | 5000 | All requests |
| Auth | 5001 | /api/auth |
| Patient | 5002 | /api/patients |
| Appointment | 5003 | /api/appointments |
| Consultation | 5004 | /api/consultations |
| Payment | 5005 | /api/payments |
| Doctor | 5006 | /api/doctors |
| Symptom Checker | 5007 | /api/symptom-checker |
| Notification | 5008 | /api/notifications |

## 📚 Additional Resources

- React Documentation: https://react.dev
- React Router: https://reactrouter.com
- Vite: https://vitejs.dev
- Axios: https://axios-http.com

---

**Last Updated**: April 2026
**Version**: 1.0.0
