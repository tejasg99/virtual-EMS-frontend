import { createSlice } from "@reduxjs/toolkit";
import { authApiSlice } from "../api/authApiSlice.js";

const initialState = {
    user: null, // Store user info 
    token: null, // Store access token
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // reducer to manually set credentials
        setCredentials: (state, action) => {
            const { user, accessToken } = action.payload;
            state.user = user;
            state.token = accessToken;
        },
        // reducer to clear credentials on logout
        logOut: (state) => {
            state.user = null;
            state.token = null;
        },
    },
    // extra reducers to handle actions dispatched by RTK query endpoints
    extraReducers: (builder) => {
        // automatically set credentials when login mutation is fulfiled
        builder.addMatcher(
            authApiSlice.endpoints.login.matchFulfilled,
            (state, {payload}) => {
                if(payload?.data) {
                    state.user = payload.data.user;
                    state.token = payload.data.accessToken;
                }
            }
        );
        // credentials when register mutation is fulfilled
        builder.addMatcher(
            authApiSlice.endpoints.register.matchFulfilled,
            (state, {payload}) => {
                if(payload?.data) {
                    state.user = payload.data.user;
                }
            }
        );
        // Automatically clear state when logout mutation is fulfilled
        builder.addMatcher(
            authApiSlice.endpoints.logout.matchFulfilled,
            (state, action) => {
                // clear state directly
                state.user = null;
                state.token = null;
                console.log("Logout fulfiled, state cleared");
            }
        );
        // Handle potential logout errors if needed
        builder.addMatcher(
            authApiSlice.endpoints.logout.matchRejected,
            (state, action) => {
                console.error("Logout rejected:", action);
                // still clear state as the user intention was to log out.
                state.user = null;
                state.token = null;
            }
        );
    },
});

// actions
export const { setCredentials, logOut } = authSlice.actions;

// reducer
export default authSlice.reducer;

// selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;