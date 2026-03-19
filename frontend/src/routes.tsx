import type { ReactNode } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DoctorRegisterPage from './pages/DoctorRegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import AssessmentPage from './pages/AssessmentPage';
import DietPage from './pages/DietPage';
import ExercisePage from './pages/ExercisePage';
import ChatPage from './pages/ChatPage';
import DoctorDashboardPage from './pages/doctor/DoctorDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminDoctorsPage from './pages/admin/AdminDoctorsPage';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Landing',
    path: '/',
    element: <LandingPage />,
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
  },
  {
    name: 'Signup',
    path: '/signup',
    element: <SignupPage />,
  },
  {
    name: 'Doctor Register',
    path: '/doctor-register',
    element: <DoctorRegisterPage />,
  },
  {
    name: 'Onboarding',
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    name: 'Assessment',
    path: '/assessment',
    element: <AssessmentPage />,
  },
  {
    name: 'Diet Plan',
    path: '/diet',
    element: <DietPage />,
  },
  {
    name: 'Exercise',
    path: '/exercise',
    element: <ExercisePage />,
  },
  {
    name: 'Chat',
    path: '/chat',
    element: <ChatPage />,
  },
  {
    name: 'Doctor Dashboard',
    path: '/doctor/dashboard',
    element: <DoctorDashboardPage />,
  },
  {
    name: 'Admin Dashboard',
    path: '/admin/dashboard',
    element: <AdminDashboardPage />,
  },
  {
    name: 'Admin Doctors',
    path: '/admin/doctors',
    element: <AdminDoctorsPage />,
  },
];

export default routes;
