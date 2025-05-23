import baseApi from "./baseApi.js";

export const authApiSlice = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Mutation for user login
        login: builder.mutation({
            query: (credentials) => ({
              url: '/auth/login', // Endpoint path relative to baseUrl
              method: 'POST',
              body: credentials, // e.g., { email, password }
            }),
        }),
        // Mutation for user registration
        register: builder.mutation({
        query: (userData) => ({
            url: '/auth/register',
            method: 'POST',
            body: userData, // e.g., { name, email, password }
        }),
        }),
        // Mutation for user logout (sends request to backend endpoint)
        logout: builder.mutation({
        query: () => ({
            url: '/auth/logout',
            method: 'POST',
            // No body needed, relies on token in header (added by prepareHeaders)
        }),
        }),
    }),
});

// autogenerated hooks for use in components
export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
} = authApiSlice;