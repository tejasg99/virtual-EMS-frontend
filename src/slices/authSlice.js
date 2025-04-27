import { createSlice } from "@reduxjs/toolkit";

// --- Helper functions to interact with localStorage ---
const getUserFromStorage = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user'); // Clear corrupted data
      return null;
    }
};
  
const getTokenFromStorage = () => {
    return localStorage.getItem('accessToken');
};

// Read the initial state from local storage
const initialState = {
    // user: null, // Store user info 
    // token: null, // Store access token
    user: getUserFromStorage(),
    token: getTokenFromStorage(),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // reducer to manually set credentials
        setCredentials: (state, action) => {
            // Ensure payload exists and has expected structure
            if (!action.payload) {
                console.error("setCredentials called with undefined payload");
                return;
            }
            const { user, accessToken } = action.payload;

            // Basic check for essential parts
            if (!user || typeof accessToken === 'undefined') {
                console.error("setCredentials payload missing user or accessToken", action.payload);
                // Optionally clear state if payload is invalid? Or just return?
                // Let's clear state for safety if payload is malformed
                state.user = null;
                state.token = null;
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                return;
            }

            state.user = user;
            state.token = accessToken;
            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', accessToken);
        },
        // reducer to clear credentials on logout
        logOut: (state) => {
            state.user = null;
            state.token = null;
            // Remove from localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
        },
    },
    // extra reducers to handle actions dispatched by RTK query endpoints
    // extraReducers: (builder) => {
    //     // automatically set credentials when login mutation is fulfiled
    //     builder.addMatcher(
    //         authApiSlice.endpoints.login.matchFulfilled,
    //         (state, {payload}) => {
    //             if(payload?.data) {
    //                 state.user = payload.data.user;
    //                 state.token = payload.data.accessToken;
    //                 localStorage.setItem('user', JSON.stringify(payload.data.user));
    //                 localStorage.setItem('accessToken', payload.data.accessToken);
    //             }
    //         }
    //     );
    //     // credentials when register mutation is fulfilled
    //     builder.addMatcher(
    //         authApiSlice.endpoints.register.matchFulfilled,
    //         (state, {payload}) => {
    //             if(payload?.data) {
    //                 state.user = payload.data.user;
    //             }
    //         }
    //     );
    //     // Automatically clear state when logout mutation is fulfilled
    //     builder.addMatcher(
    //         authApiSlice.endpoints.logout.matchFulfilled,
    //         (state, action) => {
    //             // clear state directly
    //             state.user = null;
    //             state.token = null;
    //             localStorage.removeItem('user');
    //             localStorage.removeItem('accessToken');
    //             console.log("Logout fulfiled, state and localStorage cleared");
    //         }
    //     );
    //     // Handle potential logout errors if needed
    //     builder.addMatcher(
    //         authApiSlice.endpoints.logout.matchRejected,
    //         (state, action) => {
    //             console.error("Logout rejected:", action);
    //             // still clear state as the user intention was to log out.
    //             state.user = null;
    //             state.token = null;
    //             localStorage.removeItem('user');
    //             localStorage.removeItem('accessToken');
    //         }
    //     );
    // },
});

// actions
export const { setCredentials, logOut } = authSlice.actions;

// reducer
export default authSlice.reducer;

// selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;