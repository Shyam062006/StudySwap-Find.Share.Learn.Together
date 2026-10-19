import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import StudentLayout from './layouts/StudentLayout';
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import NotFoundPage from './pages/public/NotFoundPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/student/DashboardPage';
import MaterialHubPage from './pages/student/MaterialHubPage';
import UploadMaterialPage from './pages/student/UploadMaterialPage';
import MyUploadsPage from './pages/student/MyUploadsPage';
import ResourceDetailsPage from './pages/student/ResourceDetailsPage';
import SavedMaterialsPage from './pages/student/SavedMaterialsPage';
import LeaderboardPage from './pages/student/LeaderboardPage';
import NotificationsPage from './pages/student/NotificationsPage';
import ProfilePage from './pages/student/ProfilePage';
import SettingsPage from './pages/student/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<StudentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="materials" element={<MaterialHubPage />} />
          <Route path="materials/:id" element={<ResourceDetailsPage />} />
          <Route path="upload" element={<UploadMaterialPage />} />
          <Route path="my-uploads" element={<MyUploadsPage />} />
          <Route path="saved" element={<SavedMaterialsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/admin/*" element={<Navigate to="/app/dashboard" replace />} />

      <Route element={<PublicLayout />}><Route path="*" element={<NotFoundPage />} /></Route>
    </Routes>
  );
}
