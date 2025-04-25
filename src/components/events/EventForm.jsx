import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// RTK query hook
import { useCreateEventMutation } from "../../api/eventApiSlice.js";

// Event type options
const eventTypeOptions = [
  { value: "webinar", label: "Webinar" },
  { value: "hackathon", label: "Hackathon" },
  { value: "meetup", label: "Meetup" },
  { value: "other", label: "Other" },
];

function EventForm({ eventToEdit = null }) {
  // To accept optional event data for editing later
  const isEditMode = Boolean(eventToEdit);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset, // To clear the form after submission
    formState: { errors, isDirty }, // isDirty - useful for edit mode
    setError,
    setValue, // to set form values programmatically
  } = useForm({
    // Set default values if in edit mode
    defaultValues: {
      title: eventToEdit?.title || "",
      description: eventToEdit?.description || "",
      eventType: eventToEdit?.eventType || "webinar",
      // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
      startTime: eventToEdit?.startTime
        ? new Date(eventToEdit.startTime).toISOString().slice(0, 16)
        : "",
      endTime: eventToEdit?.endTime
        ? new Date(eventToEdit.endTime).toISOString().slice(0, 16)
        : "",
      maxAttendees: eventToEdit?.maxAttendees || "",
      // speakers: eventToEdit?.speakers || [], // Speakers to be handled later
    },
  });

  // Mutation hook for creating events
  const [
    createEvent,
    { isLoading, isError, error: apiError, isSuccess, data: createdEventData },
  ] = useCreateEventMutation();
  // TODO: add useUpdateEventMutation for edit mode

  const onSubmit = async (data) => {
    // Convert datetime-local strings back to ISO strings or Date objects for backend
    const submissionData = {
      ...data,
      startTime: data.startTime ? new Date(data.startTime).toISOString() : null,
      endTime: data.endTime ? new Date(data.endTime).toISOString() : null,
      maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees, 10) : null, // Ensure number or null
    };

    // Remove null maxAttendees if not provided
    if (submissionData.maxAttendees === null) {
      delete submissionData.maxAttendees;
    }

    // Create event logic
    try {
      const result = await createEvent(submissionData).unwrap();
      const newEventId = result?.data?._id;
      // Handled in useEffect
    } catch (err) {
      console.error("Failed to create event:", err);
      const errorMessage =
        err?.data?.message ||
        err?.error ||
        "Failed to create event. Please check the details.";
      toast.error(errorMessage);

      // Set specific field errors if provided by backend
      if (err?.data?.errors) {
        err.data.errors.forEach((e) =>
          setError(e.field, { type: "manual", message: e.message })
        );
      } else {
        setError("root.serverError", { type: "manual", message: errorMessage });
      }
    }
  };

  // handle redirection after successful creation
  useEffect(() => {
    if (isSuccess && createdEventData?.data?._id) {
      toast.success(createdEventData.message || "Event created successfully");
      reset(); // Clear the form
      navigate(`/events/${createdEventData.data._id}`); // Redirect to event detail page
    }
    // TODO: Add success handling for edit mode
  }, [isSuccess, createdEventData, navigate, reset]);

  // Form field styling
  const inputBaseClasses =
    "w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const inputErrorClasses =
    "border-red-500 focus:ring-red-500 focus:border-red-500";
  const inputNormalClasses = "border-gray-300";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
  const errorMessageClasses = "mt-1 text-xs text-red-600";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Display general form error from server */}
      {errors?.root?.serverError && (
        <p className="text-sm text-red-600 text-center bg-red-100 p-2 rounded-md">
          {errors.root.serverError.message}
        </p>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className={labelClasses}>
          Event Title
        </label>
        <input
          id="title"
          type="text"
          {...register("title", {
            required: "Event title is required",
            trim: true,
          })}
          className={`${inputBaseClasses} ${errors.title ? inputErrorClasses : inputNormalClasses}`}
          disabled={isLoading}
        />
        {errors.title && (
          <p className={errorMessageClasses}>{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClasses}>
          Description
        </label>
        <textarea
          id="description"
          rows="4"
          {...register("description", {
            required: "Description is required",
            trim: true,
          })}
          className={`${inputBaseClasses} ${errors.description ? inputErrorClasses : inputNormalClasses}`}
          disabled={isLoading}
        />
        {errors.description && (
          <p className={errorMessageClasses}>{errors.description.message}</p>
        )}
      </div>

      {/* Event Type */}
      <div>
        <label htmlFor="eventType" className={labelClasses}>
          Event Type
        </label>
        <select
          id="eventType"
          {...register("eventType", {
            required: "Please select an event type",
          })}
          className={`${inputBaseClasses} ${errors.eventType ? inputErrorClasses : inputNormalClasses}`}
          disabled={isLoading}
        >
          {eventTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.eventType && (
          <p className={errorMessageClasses}>{errors.eventType.message}</p>
        )}
      </div>

      {/* Start Time & End Time (Grid Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
        <div>
          <label htmlFor="startTime" className={labelClasses}>
            Start Time
          </label>
          <input
            id="startTime"
            type="datetime-local"
            {...register("startTime", {
              required: "Start Time is required",
              validate: (value, formValues) => {
                // Start time should not be in the past
                if (new Date(value) < new Date(Date.now() - 60000)) {
                  // allow  a minute buffer
                  return "Start time cannot be in the past";
                }
                // Check if end time exists and start is before end
                if (
                  formValues.endTime &&
                  new Date(value) >= new Date(formValues.endTime)
                ) {
                  return "Start time must be before end time";
                }
                return true;
              },
            })}
            className={`${inputBaseClasses} ${errors.startTime ? inputErrorClasses : inputNormalClasses}`}
            disabled={isLoading}
          />
          {errors.startTime && (
            <p className={errorMessageClasses}>{errors.startTime.message}</p>
          )}
        </div>
        <div>
            <label htmlFor="endTime" className={labelClasses}>End Time</label>
            <input
            id="endTime"
            type="datetime-local"
            {...register('endTime', {
                required: 'End time is required',
                validate: (value, formValues) => {
                     if (formValues.startTime && new Date(value) <= new Date(formValues.startTime)) {
                         return 'End time must be after start time';
                     }
                     return true;
                 }
            })}
            className={`${inputBaseClasses} ${errors.endTime ? inputErrorClasses : inputNormalClasses}`}
            disabled={isLoading}
            />
            {errors.endTime && <p className={errorMessageClasses}>{errors.endTime.message}</p>}
        </div>
      </div>
      {/* Max Attendees (Optional) */}
      <div>
        <label htmlFor="maxAttendees" className={labelClasses}>Maximum Attendees (Optional)</label>
        <input
          id="maxAttendees"
          type="number"
          min="1" // Minimum value
          {...register('maxAttendees', {
            valueAsNumber: true, // Treat value as number
            min: { value: 1, message: 'Must be at least 1 attendee' },
            validate: value => !value || Number.isInteger(value) || 'Must be a whole number' // Allow empty or integer
          })}
          placeholder="Leave blank for unlimited"
          className={`${inputBaseClasses} ${errors.maxAttendees ? inputErrorClasses : inputNormalClasses}`}
          disabled={isLoading}
        />
        {errors.maxAttendees && <p className={errorMessageClasses}>{errors.maxAttendees.message}</p>}
      </div>

      {/* TODO: Add Speakers Input Field Later */}

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm
                     text-sm font-medium text-white
                     bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2
                     focus:ring-offset-2 focus:ring-indigo-500
                     ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (isEditMode ? 'Saving Changes...' : 'Creating Event...') : (isEditMode ? 'Save Changes' : 'Create Event')}
        </button>
      </div>
    </form>
  );
}

export default EventForm;
