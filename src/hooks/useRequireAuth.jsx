import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { selectCurrentUser} from '../slices/authSlice.js';
import { toast } from 'react-hot-toast';

/**
 * A component that wraps routes requiring authentication.
 * Redirects to login if the user is not authenticated.
 * Optionally checks for required roles.
 *
 * Usage in router:
 * <Route element={<ProtectedRoute allowedRoles={['admin', 'organizer']} />}>
 * <Route path="create-event" element={<CreateEventPage />} />
 * </Route>
 *
 * Or for a single route:
 * <Route
 * path="profile"
 * element={
 * <ProtectedRoute>
 * <ProfilePage />
 * </ProtectedRoute>
 * }
 * />
 * (Using Outlet is generally preferred with nested routes in createBrowserRouter)
 */
function ProtectedRoute({allowedRoles}) {
    const currentUser = useSelector(selectCurrentUser);
    const location = useLocation(); // Get current location to redirect back after login

    // Check if the user is logged in
    if(!currentUser) {
        // Redirect them to the login page but save the current location they were trying to go in
        // Send them back to the location after successful login
        return <Navigate to={'/login'} state={{ from: location }} replace/>  // 'replace' avoids adding the login route to the history stack unnecessarily
    }

    // Check if specific roles are required and if the user has one of them
    if(allowedRoles && allowedRoles.length > 0) {
        const hasRequiredRole  = allowedRoles.includes(currentUser.role);
        if(!hasRequiredRole) {
            // TODO: Redirect to a separate unauthorized page
            // For now redirecting to home page
            console.warn(`User role '${currentUser.role}' does not have access to route requiring roles: ${allowedRoles.join(', ')}`);
            toast.error('Unauthorized! Redirecting to home page');
            return <Navigate to="/" replace />;
        }
    }

    // Logged in and authorized user
    // Outlet is used when this component wraps nested routes in createBrowserRouter
    return <Outlet />;
}

export default ProtectedRoute;