import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Shell } from '../components/layout/Shell';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { ChannelsPage } from '../features/channels/pages/ChannelsPage';
import { StudioPage } from '../features/studio/pages/StudioPage';
import { GenresPage } from '../features/genres/pages/GenresPage';
import { SchedulePage } from '../features/schedule/pages/SchedulePage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Shell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'channels',
        element: <ChannelsPage />,
      },
      {
        path: 'studio',
        element: <StudioPage />,
      },
      {
        path: 'genres',
        element: <GenresPage />,
      },
      {
        path: 'schedule',
        element: <SchedulePage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

