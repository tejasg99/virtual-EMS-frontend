import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store.js';
import './index.css';

//components 
import MainLayout from './components/layout/MainLayout.jsx';
import ProtectedRoute from './hooks/useRequireAuth.jsx';

//pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import EventDetailPage from './pages/EventDetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import CreateEventPage from './pages/CreateEventPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import EditEventPage from './pages/EditEventPage.jsx';
import AdminUserManagementPage from './pages/AdminUserManagementPage.jsx';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage.jsx';
import EventLivePage from './pages/EventLivePage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // Public routes
      {
        index: true, //Matches the parent path '/'
        element: <HomePage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        path: 'events',
        element: <EventsPage />
      },
      {
        path: 'events/:eventId',
        element: <EventDetailPage />,
      },
      // Protected routes
      {
        element: <ProtectedRoute />, // required login
        children: [
          { path: 'profile', element: <ProfilePage /> },
          { path: 'events/:eventId/live', element: <EventLivePage /> },
          { path: 'create-event',  element: <CreateEventPage /> },
        ]
      },
      // Organizer
      {
        element: <ProtectedRoute allowedRoles={['organizer', 'admin']}/>,
        children: [
          { path: 'edit-event/:eventId', element: <EditEventPage /> },
          { path: 'organizer-dashboard', element: <OrganizerDashboardPage /> },
        ]
      },
      // Admin routes
      {
        element: <ProtectedRoute allowedRoles={['admin']}/>,
        children: [
          { path: 'admin/users', element: <AdminUserManagementPage /> },
        ]
      },
      // Catch 404 Not found errors
      { path: '*', element: <NotFoundPage />}
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
  </StrictMode>,
)
