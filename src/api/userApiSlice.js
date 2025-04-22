import baseApi from "./baseApi.js";

// Helper function to create list tags
const providesList = (resultsWithIds, tagType) => {
    return resultsWithIds ? [
        { type: tagType, id: 'LIST'},
        ...resultsWithIds.map(({_id}) => ({ type: tagType, id: _id})),
    ]:[{type: tagType, id: 'LIST'}];
}

export const userApiSlice = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Query to get current user profile
        getCurrentUser: builder.query({
            query: () => '/users/me',
            // Provides a specific tag for the current user's data
            providesTags: [{ type: 'User', id: 'ME' }],
        }),

        // Mutation to update current user's profile
        updateUserProfile: builder.mutation({
            query: (updateData) => ({
                url: '/users/me/update',
                method: 'PATCH',
                body: updateData,
            }),
            // Invalidates the 'ME' user tag to refetch profile after update
            invalidatesTags: [{ type: 'User', id: 'ME' }],
        }),

        // Admin user endpoints
        // Query to get all users(filtering/pagination to be implemented later)
        getAllUsers: builder.query({
            query: () => '/users/',
            providesTags: (result) => providesList(result?.data?.users, 'User'),
        }),

        // Query to get user by Id
        getUserById: builder.query({
            query: (userId) => `/users/${userId}`,
            providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
        }),

        // Mutation to update user role
        updateUserRole: builder.mutation({
            query: ({userId, role}) => ({
                url: `/users/${userId}/role`,
                method: 'PATCH',
                body: role,                
            }),
            invalidatesTags: (result, error, userId) => [
                {type: 'User', id: userId},
                {type: 'User', id: 'LIST'}, // Invalidate as role has been changed
            ],
        }),

        // Mutation to delete an user
        deleteUser: builder.mutation({
            query: (userId) => ({
                url: `/users/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, userId) => [
                {type: 'User', id: userId},
                {type: 'User', id: 'LIST'},
            ],
        }),
    }),
});

export const {
    useGetCurrentUserQuery,
    useUpdateUserProfileMutation,
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useUpdateUserRoleMutation,
    useDeleteUserMutation,
} = userApiSlice;