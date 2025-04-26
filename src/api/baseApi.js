import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logOut } from "../slices/authSlice.js"; // Import actions

//Define the base query using fetchBaseQuery
const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    // Automatically attach the Authorization header from Redux state
    prepareHeaders: (headers, { getState }) => {
        //get token from auth slice
        const token = getState().auth?.token; //auth - slice name
        if(token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

// Wrapper around baseQuery to handle re-authentication
const baseQueryWithReauth = async (args, api, extraOptions) => {
    // Wait for the intial query to resolve
    let result  = await baseQuery(args, api, extraOptions);

    // Check if the query failed due to unauthorized (401) error
    if(result?.error?.status === 401) {
        console.log('Received 401 Unauthorized, attempting token refresh...');

        // Attempt to refresh the token
        try {
            // Use dispatch to trigger refresh token mutation
            // Access the refreshToken endpoint definition through the api object passed to the wrapper
            const refreshResult = await api.dispatch(
                api.endpoints.refreshToken.initiate()
            ).unwrap(); // using unwrap to get payload or throw error

            // Check if the refresh was successful and we got a new token 
            if(refreshResult?.data?.accessToken) {
                console.log('Token refresh successful');

                // Update credentials in redux store
                const currentUser = api.getState().auth.user;
                api.dispatch(setCredentials({ user: currentUser, accessToken: refreshResult.data.accessToken}));

                // Retry original query with new token
                console.log('Retrying the original request');
                result = await baseQuery(args, api, extraOptions);
            } else {
                // If refreshResult doesn't contain the token, treat as failure
                throw new Error('Refresh token endpoint did not return access token.');
            }
        } catch (refreshError) {
            console.error('Token refresh failed: ', refreshError);
            // Log the user out if refresh fails
            api.dispatch(logOut());
            // Redirect to login page
            window.location.href = '/login';
        }
    }
    return result;
};

// Define the base API slice using createApi using the wrapper
export const baseApi = createApi({
    reducerPath: 'api', //key in redux store where api slice will be mounted
    baseQuery: baseQueryWithReauth, // new wrapper
    tagTypes: ['User', 'Event', 'Registration'], //used for caching invalidation and automatic refetching
    endpoints: (builder) => ({
     // Add a placeholder endpoint for refreshToken that the wrapper can reference
     // This ensures api.endpoints.refreshToken exists when the wrapper runs.
     // The actual logic is in authApiSlice.js where it's injected.
     refreshToken: builder.mutation({
        queryFn: () => ({ data: null }), // No-op query function, actual logic is injected
     }),
    }),
});

export default baseApi;