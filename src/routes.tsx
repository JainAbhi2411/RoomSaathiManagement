import type { ReactNode } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyForm from './pages/PropertyForm';
import PropertyDetails from './pages/PropertyDetails';
import RoomBooking from './pages/RoomBooking';
import VacancyDashboard from './pages/VacancyDashboard';
import Tenants from './pages/Tenants';
import Payments from './pages/Payments';
import Maintenance from './pages/Maintenance';
import Contracts from './pages/Contracts';
import Analytics from './pages/Analytics';

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
    name: 'Dashboard',
    path: '/',
    element: <Dashboard />,
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
    name: 'Property Details',
    path: '/properties/:id',
    element: <PropertyDetails />,
    visible: false,
  },
  {
    name: 'Room Booking',
    path: '/properties/:id/booking',
    element: <RoomBooking />,
    visible: false,
  },
  {
    name: 'Vacancy Dashboard',
    path: '/vacancy',
    element: <VacancyDashboard />,
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
