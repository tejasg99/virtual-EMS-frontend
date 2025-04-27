import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./axiosBaseQuery.js";

// Define the base API slice using createApi
export const baseApi = createApi({
    reducerPath: 'api', // key in redux store where api slice will be mounted
    baseQuery: axiosBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
    }), // Custom axios based query function
    tagTypes: ['User', 'Event', 'Registration'], // used for caching invalidation and automatic refetching
    endpoints: (builder) => ({}), // will be inject from other api slice files later
});

export default baseApi;