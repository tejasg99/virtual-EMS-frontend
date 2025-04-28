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
            providesTags: (result) => providesList(result?.data?.events, 'Event')
        }),
        
        //Query to get a single event by id
        getEventById: builder.query({
            query: (eventId) => ({
                url: `/events/${eventId}`,
                method: 'GET',
            }),
            providesTags: (result, error, eventId) => [{ type: 'Event', id: eventId }], //provides a specific tag for this event
        }),

        // Mutation to create a new event
        createEvent: builder.mutation({
            query: (eventData) => ({
                url: '/events',
                method: 'POST',
                body: eventData,
            }),
            // Invalidates the 'Event' list tag to refetch the event list after creation
            invalidatesTags: [{ type: 'Event', id: 'LIST' }],
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
                {type: 'Event', id: eventId},
                {type: 'Event', id: 'LIST'}, // Invalidate as status/time might change
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
                { type: 'Event', id: 'LIST' }
            ],
        }),
    }),
});

//export hooks
export const {
    useGetEventsQuery,
    useGetEventByIdQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation
} = eventApiSlice;