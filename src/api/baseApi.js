import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

//Define the base query using fetchBaseQuery
const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        //get token from auth slice
        const token = getState().auth?.token; //auth - slice name
        if(token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

// Define the base API slice using createApi
export const baseApi = createApi({
    reducerPath: 'api', //key in redux store where api slice will be mounted
    baseQuery: baseQuery,
    tagTypes: ['User', 'Event', 'Registration'], //used for caching invalidation and automatic refetching
    endpoints: (builder) => ({}), //will be inject from other api slice files later
});

export default baseApi;