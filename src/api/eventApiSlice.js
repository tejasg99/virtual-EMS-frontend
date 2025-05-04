import baseApi from "./baseApi.js";

// Helper function to create list tags
const providesList = (resultsWithIds, tagType) => {
    return resultsWithIds ? [
        { type: tagType, id: 'LIST'},
        ...resultsWithIds.map(({_id}) => ({ type: tagType, id: _id})),
    ]:[{type: tagType, id: 'LIST'}];
}

export const eventApiSlice = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Query to get multiple events with filtering/pagination
        getEvents: builder.query({
            query: (params) => ({ // params = { status, eventType, page, limit, sortBy, order }
                url: '/events',
                params: params, // passing directly
            }),
            // Provides a general 'Event' list tag and individual tags for each fetched event
            providesTags: (result) => providesList(result?.data?.events, 'Event').concat([{ type: 'Event', id: 'PUBLIC_LIST' }]), // Add specific tag for public list
        }),
        
        //Query to get a single event by id
        getEventById: builder.query({
            query: (eventId) => ({
                url: `/events/${eventId}`,
                method: 'GET',
            }),
            providesTags: (result, error, eventId) => [{ type: 'Event', id: eventId }], //provides a specific tag for this event
        }),

        // To get events organized by the current user
        getMyOrganizedEvents: builder.query({
            query: (params) => ({
                url: '/events/my-organized',
                method: 'GET',
                params: params,
            }),
            // Provides a specific list tag for organizer events and individual tags
            providesTags: (result) => providesList(result?.data?.events, 'Event').concat([{ type: 'Event', id: 'ORGANIZER_LIST' }]),
        }),

        getOrganizerStats: builder.query({
            query: () => ({
                url: '/events/my-organized/stats',
                method: 'GET',
            }),
            // Provide a specific tag for these stats
            providesTags: ['OrganizerStats'],
        }),

        // Mutation to create a new event
        createEvent: builder.mutation({
            query: (eventData) => ({
                url: '/events',
                method: 'POST',
                body: eventData,
            }),
            // Invalidate both the organizer and public lists
            invalidatesTags: [
                { type: 'Event', id: 'LIST' }, 
                { type: 'Event', id: 'ORGANIZER_LIST' }, 
                { type: 'Event', id: 'PUBLIC_LIST' }, 'OrganizerStats'
            ],
        }),

        // Mutation to update existing event
        updateEvent: builder.mutation({
            query: ({eventId, updateData}) => ({
                url: `/events/${eventId}`,
                method: 'PATCH',
                body: updateData,
            }),
            // Invalidates the specific event and list tag
            invalidatesTags: (result, error, {eventId}) => [
                { type: 'Event', id: eventId },
                { type: 'Event', id: 'LIST' }, // General list tag
                { type: 'Event', id: 'ORGANIZER_LIST' }, // Invalidate organizer list
                { type: 'Event', id: 'PUBLIC_LIST' }, // Invalidate public list
                'OrganizerStats',
            ],
        }),

        // Mutation to delete an existing event
        deleteEvent: builder.mutation({
            query: (eventId) => ({
                url: `/events/${eventId}`,
                method: 'DELETE',
            }),
            // Invalidate the tag and list
            invalidatesTags: (result, error, eventId) => [
                { type: 'Event', id: eventId },
                { type: 'Event', id: 'LIST' },
                { type: 'Event', id: 'ORGANIZER_LIST' },
                { type: 'Event', id: 'PUBLIC_LIST' },
                'OrganizerStats',
            ],
        }),
    }),
});

//export hooks
export const {
    useGetEventsQuery,
    useGetEventByIdQuery,
    useGetMyOrganizedEventsQuery,
    useGetOrganizerStatsQuery,    
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
} = eventApiSlice;