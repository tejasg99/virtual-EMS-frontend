import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import baseApi from "../api/baseApi.js";
import authReducer from "../slices/authSlice.js";


export const store = configureStore({
    reducer: {
        auth: authReducer,
        // Add the generated reducer for the RTK Query API slice
        [baseApi.reducerPath]: baseApi.reducer,
    },
    // Adding the API middleware enables caching, invalidation, polling features of RTK query
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    devTools: process.env.NODE_ENV !== 'production',
});

// configure listeners for RTK Query refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);