import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "../../layouts/PublicLayout";
import PatientLayout from "../../layouts/PatientLayout";
import DoctorLayout from "../../layouts/DoctorLayout";
import AdminLayout from "../../layouts/AdminLayout";


import HomePage from "../../pages/public/HomePage";
import AboutPage from "../../pages/public/AboutPage";
import LoginPage from "../../pages/public/LoginPage";
import RegisterPage from "../../pages/public/RegisterPage";
import VerifyOtpPage from "../../pages/public/VerifyOtpPage";
import ForgotPasswordPage from "../../pages/public/ForgotPasswordPage";
import ResetPasswordPage from "../../pages/public/ResetPasswordPage";

import DashboardPage from "../../pages/patient/DashboardPage";
import ProfilePage from "../../pages/patient/ProfilePage";
import MedicalHistoryPage from "../../pages/patient/MedicalHistoryPage";
import ReportsPage from "../../pages/patient/ReportsPage";
import PrescriptionsPage from "../../pages/patient/PrescriptionsPage";
import MyAppointmentsPage from "../../pages/patient/MyAppointmentsPage";
import NotificationsPage from "../../pages/patient/NotificationsPage";

import DoctorDashboardPage from "../../pages/doctor/DashboardPage";
import DoctorProfilePage from "../../pages/doctor/ProfilePage";
import AvailabilityPage from "../../pages/doctor/AvailabilityPage";
import DoctorAppointmentsPage from "../../pages/doctor/AppointmentsPage";
import ReportsReviewPage from "../../pages/doctor/ReportsReviewPage";
import PrescriptionPage from "../../pages/doctor/PrescriptionPage";

import AdminDashboardPage from "../../pages/admin/DashboardPage";
import VerifyDoctorsPage from "../../pages/admin/VerifyDoctorsPage";
import ManageUsersPage from "../../pages/admin/ManageUsersPage";
import ManageDoctorsPage from "../../pages/admin/ManageDoctorsPage";
import TransactionsPage from "../../pages/admin/TransactionsPage";

import DoctorListPage from "../../pages/shared/DoctorListPage";
import DoctorDetailsPage from "../../pages/shared/DoctorDetailsPage";
import BookAppointmentPage from "../../pages/shared/BookAppointmentPage";
import PaymentPage from "../../pages/shared/PaymentPage";
import ConsultationPage from "../../pages/shared/ConsultationPage";

import ProtectedRoute from "../../components/auth/ProtectedRoute";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/doctors" element={<DoctorListPage />} />
          <Route path="/doctors/:id" element={<DoctorDetailsPage />} />
          <Route path="/book-appointment" element={<BookAppointmentPage />} />
          <Route path="/payment" element={<PaymentPage />} />
         
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
          <Route path="/patient" element={<PatientLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="medical-history" element={<MedicalHistoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="prescriptions" element={<PrescriptionsPage />} />
            <Route path="appointments" element={<MyAppointmentsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route path="dashboard" element={<DoctorDashboardPage />} />
            <Route path="profile" element={<DoctorProfilePage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="appointments" element={<DoctorAppointmentsPage />} />
            <Route path="reports" element={<ReportsReviewPage />} />
            <Route path="prescriptions" element={<PrescriptionPage />} />
            <Route path="consultation" element={<ConsultationPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="verify-doctors" element={<VerifyDoctorsPage />} />
            <Route path="manage-users" element={<ManageUsersPage />} />
            <Route path="manage-doctors" element={<ManageDoctorsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;