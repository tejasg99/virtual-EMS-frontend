import baseApi from "./baseApi.js";

// Helper function to create list tags
const providesList = (resultsWithIds, tagType) => {
    return resultsWithIds ? [
        { type: tagType, id: 'LIST'},
        ...resultsWithIds.map(({_id}) => ({ type: tagType, id: _id})),
    ]:[{type: tagType, id: 'LIST'}];
}

export const registrationApiSlice = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Mutation to register for an event
        registerForEvent: builder.mutation({
            query: (eventId) => ({
                url: `/events/${eventId}/register`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, eventId) => [
                { type: 'Registration', id: 'USER_ME' }, // Refetch user's registrations list
                { type: 'Registration', id: `${eventId}-STATUS` }, // Refetch specific event registration status
            ],
        }),

        // Mutation to unregister from an event
        unregisterFromEvent: builder.mutation({
            query: (eventId) => ({
                url: `/events/${eventId}/unregister`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, eventId) => [
                { type: 'Registration', id: 'USER_ME' },
                { type: 'Registration', id: `${eventId}-STATUS` },
            ],
        }),

        // Query to get registrations for a specific event
        getEventRegistrations: builder.query({
            query: ({eventId, params}) => ({
                url: `/events/${eventId}/registrations`,
                params: params,
            }),
            // provides a tag specific to this event's registration list
            providesTags: (result, error, { eventId }) => [{ type: 'Registration', id: `EVENT-${eventId}` }],
        }),

        // Query to get current user's registrations
        getUserRegistrations: builder.query({
            query: (params) => ({
                url: '/users/me/registrations',
                params: params,
            }),
            // Provides a tag specific to the current user's registration list
            providesTags: (result) => providesList(result?.data?.registrations, 'Registration').concat({ type: 'Registration', id: 'USER_ME' }),
        }),

        // Query to check registration status of a particular event
        checkRegistrationStatus: builder.query({
            query: (eventId) => ({
                url: `/events/${eventId}/registration-status`,
                method: 'GET'
            }),
            // Provides a tag specific to this user/event status check
            providesTags: (result, error, eventId) => [{ type: 'Registration', id: `${eventId}-STATUS` }],
        }),
    }),
});

export const {
    useRegisterForEventMutation,
    useUnregisterFromEventMutation,
    useGetEventRegistrationsQuery,
    useGetUserRegistrationsQuery,
    useCheckRegistrationStatusQuery,
} = registrationApiSlice;