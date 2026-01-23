import type { ReactNode } from 'react';
import Login from './pages/Login';
import PlanSelection from './pages/PlanSelection';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Properties from './pages/Properties';
import PropertyForm from './pages/PropertyForm';
import PropertyCSVUpload from './pages/PropertyCSVUpload';
import RoomCSVUpload from './pages/RoomCSVUpload';
import PropertyDetails from './pages/PropertyDetails';
import RoomManagement from './pages/RoomManagement';
import RoomBooking from './pages/RoomBooking';
import VacancyDashboard from './pages/VacancyDashboard';
import OccupancyDashboard from './pages/OccupancyDashboard';
import WhatsAppSettings from './pages/WhatsAppSettings';
import Tenants from './pages/Tenants';
import Payments from './pages/Payments';
import RentPayments from './pages/RentPaymentsEnhanced';
import Maintenance from './pages/Maintenance';
import Contracts from './pages/Contracts';
import Analytics from './pages/Analytics';
import PlanManagement from './pages/PlanManagement';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false,
  },
  {
    name: 'Plan Selection',
    path: '/plans',
    element: <PlanSelection />,
    visible: false,
  },
  {
    name: 'Dashboard',
    path: '/',
    element: <Dashboard />,
  },
  {
    name: 'Admin Dashboard',
    path: '/admin',
    element: <AdminDashboard />,
    visible: false,
  },
  {
    name: 'Plan Management',
    path: '/admin/plans',
    element: <PlanManagement />,
    visible: false,
  },
  {
    name: 'Properties',
    path: '/properties',
    element: <Properties />,
  },
  {
    name: 'Add Property',
    path: '/properties/new',
    element: <PropertyForm />,
    visible: false,
  },
  {
    name: 'Edit Property',
    path: '/properties/edit/:id',
    element: <PropertyForm />,
    visible: false,
  },
  {
    name: 'Property CSV Upload',
    path: '/properties/csv-upload',
    element: <PropertyCSVUpload />,
    visible: false,
  },
  {
    name: 'Room CSV Upload',
    path: '/rooms/csv-upload',
    element: <RoomCSVUpload />,
    visible: false,
  },
  {
    name: 'Property Details',
    path: '/properties/:id',
    element: <PropertyDetails />,
    visible: false,
  },
  {
    name: 'Room Management',
    path: '/properties/:id/rooms',
    element: <RoomManagement />,
    visible: false,
  },
  {
    name: 'Room Booking',
    path: '/properties/:id/booking',
    element: <RoomBooking />,
    visible: false,
  },
  {
    name: 'WhatsApp Settings',
    path: '/properties/:id/whatsapp',
    element: <WhatsAppSettings />,
    visible: false,
  },
  {
    name: 'Vacancy Dashboard',
    path: '/vacancy',
    element: <VacancyDashboard />,
  },
  {
    name: 'Occupancy Dashboard',
    path: '/occupancy',
    element: <OccupancyDashboard />,
  },
  {
    name: 'Tenants',
    path: '/tenants',
    element: <Tenants />,
  },
  {
    name: 'Payments',
    path: '/payments',
    element: <Payments />,
  },
  {
    name: 'Rent Payments',
    path: '/rent-payments',
    element: <RentPayments />,
  },
  {
    name: 'Maintenance',
    path: '/maintenance',
    element: <Maintenance />,
  },
  {
    name: 'Contracts',
    path: '/contracts',
    element: <Contracts />,
  },
  {
    name: 'Analytics',
    path: '/analytics',
    element: <Analytics />,
  },
];

export default routes;
