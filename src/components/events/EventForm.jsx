import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { isEqual } from "lodash-es"; // for deep comparison

// RTK query hook
import {
  useCreateEventMutation,
  useUpdateEventMutation,
} from "../../api/eventApiSlice.js";

// Event type options
const eventTypeOptions = [
  { value: "webinar", label: "Webinar" },
  { value: "hackathon", label: "Hackathon" },
  { value: "meetup", label: "Meetup" },
  { value: "other", label: "Other" },
];

// Helper to format Date object to 'YYYY-MM-DDTHH:mm' for datetime-local input
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    // Adjust for timezone offset to display correctly in local time input
    const timezoneOffset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localISOTime = new Date(date.getTime() - timezoneOffset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  } catch (e) {
    console.error("Error formatting date for input: ", e);
    return "";
  }
};

function EventForm({ eventToEdit = null }) {
  // To accept optional event data for editing later
  const isEditMode = Boolean(eventToEdit?._id); // check if eventToEdit has an id
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset, // To clear the form after submission
    formState: { errors, dirtyFields }, // dirtyFields to check specific changes
    setError,
    // setValue, // to set form values programmatically
    // watch
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

  // Populate form when eventToEdit is available or changes
  useEffect(() => {
    if (isEditMode && eventToEdit) {
      reset({
        title: eventToEdit.title || "",
        description: eventToEdit.description || "",
        eventType: eventToEdit.eventType || "webinar",
        startTime: formatDateForInput(eventToEdit.startTime),
        endTime: formatDateForInput(eventToEdit.endTime),
        maxAttendees: eventToEdit.maxAttendees || "",
        // speakers: eventToEdit.speakers || [], // Handle later
      });
    } else {
      // Reset to empty defaults if not in edit mode or no event data
      reset({
        title: "",
        description: "",
        eventType: "webinar",
        startTime: "",
        endTime: "",
        maxAttendees: "",
      });
    }
  }, [eventToEdit, isEditMode, reset]);

  // Mutation hook for creating events
  const [
    createEvent,
    {
      isLoading: isCreating,
      isSuccess: isCreateSuccess,
      data: createdEventData,
    },
  ] = useCreateEventMutation();

  const [
    updateEvent,
    {
      isLoading: isUpdating,
      isSuccess: isUpdateSuccess,
      data: updatedEventData,
    },
  ] = useUpdateEventMutation();

  const isLoading = isCreating || isUpdating; // Combined loading state

  const onSubmit = async (formData) => {
    // Only submit changed fields in edit mode (efficient)
    let changedData = {};
    if (isEditMode) {
      // Compare current form data with the original form data
      Object.keys(dirtyFields).forEach((key) => {
        // Special handling for dates as they need conversion
        if (key === "startTime" || key === "endTime") {
          const originalFormatted = formatDateForInput(eventToEdit[key]);
          if (formData[key] !== originalFormatted) {
            changedData[key] = formData[key]
              ? new Date(formData[key]).toISOString()
              : null;
          }
        } else if (key === "maxAttendees") {
          const originalValue = eventToEdit[key] || ""; // Handle null/undefined original
          const formValue = formData[key] || ""; // Handle empty string from form
          if (String(originalValue) !== String(formValue)) {
            // Compare as strings
            changedData[key] = formData[key]
              ? parseInt(formData[key], 10)
              : null;
          }
        } else if (!isEqual(formData[key], eventToEdit[key])) {
          changedData[key] = formData[key];
        }
      });

      // If nothing actually changed according to our check, inform user
      if (Object.keys(changedData).length === 0) {
        toast("No changes detected to save.");
        return;
      }
      console.log("Submitting changed data:", changedData);
    } else {
      // In create mode prepare all the data
      changedData = {
        ...formData,
        startTime: formData.startTime
          ? new Date(formData.startTime).toISOString()
          : null,
        endTime: formData.endTime
          ? new Date(formData.endTime).toISOString()
          : null,
        maxAttendees: formData.maxAttendees
          ? parseInt(formData.maxAttendees, 10)
          : null,
      };

      // Remove null maxAttendees if not present
      if (changedData.maxAttendees === null) {
        delete changedData.maxAttendees;
      }
    }

    try {
      if (isEditMode) {
        // Update event logic
        if (Object.keys(changedData).length > 0) {
          // Ensure there are changes to send
          await updateEvent({
            eventId: eventToEdit._id,
            updateData: changedData,
          }).unwrap();
        } else {
          // Should have been caught above, but as a fallback
          toast("No changes detected.");
          return;
        }
      } else {
        // Create event logic
        await createEvent(changedData).unwrap();
      }
    } catch (err) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} event:`,
        err
      );
      const errorMessage =
        err?.data?.message ||
        err?.error ||
        `Failed to ${isEditMode ? "update" : "create"} event.`;
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

  // handle redirection after successful creation/update
  useEffect(() => {
    // Handle Create Success
    if (isCreateSuccess && createdEventData?.data?._id) {
      toast.success(createdEventData.message || "Event created successfully!");
      reset(); // Clear the form
      navigate(`/events/${createdEventData.data._id}`);
    }
    // Handle Update Success
    if (isUpdateSuccess && updatedEventData?.data?._id) {
      toast.success(updatedEventData.message || "Event updated successfully!");
      // Optionally reset form to new values, or just navigate
      // reset(updatedEventData.data); // Reset with updated data
      navigate(`/events/${updatedEventData.data._id}`); // Navigate back to detail page
    }
  }, [
    isCreateSuccess,
    isUpdateSuccess,
    createdEventData,
    updatedEventData,
    navigate,
    reset,
  ]);

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
          <label htmlFor="endTime" className={labelClasses}>
            End Time
          </label>
          <input
            id="endTime"
            type="datetime-local"
            {...register("endTime", {
              required: "End time is required",
              validate: (value, formValues) => {
                if (
                  formValues.startTime &&
                  new Date(value) <= new Date(formValues.startTime)
                ) {
                  return "End time must be after start time";
                }
                return true;
              },
            })}
            className={`${inputBaseClasses} ${errors.endTime ? inputErrorClasses : inputNormalClasses}`}
            disabled={isLoading}
          />
          {errors.endTime && (
            <p className={errorMessageClasses}>{errors.endTime.message}</p>
          )}
        </div>
      </div>
      {/* Max Attendees (Optional) */}
      <div>
        <label htmlFor="maxAttendees" className={labelClasses}>
          Maximum Attendees (Optional)
        </label>
        <input
          id="maxAttendees"
          type="number"
          min="1" // Minimum value
          {...register("maxAttendees", {
            valueAsNumber: true, // Treat value as number
            min: { value: 1, message: "Must be at least 1 attendee" },
            validate: (value) =>
              !value || Number.isInteger(value) || "Must be a whole number", // Allow empty or integer
          })}
          placeholder="Leave blank for unlimited"
          className={`${inputBaseClasses} ${errors.maxAttendees ? inputErrorClasses : inputNormalClasses}`}
          disabled={isLoading}
        />
        {errors.maxAttendees && (
          <p className={errorMessageClasses}>{errors.maxAttendees.message}</p>
        )}
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
                     ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading
            ? isEditMode
              ? "Saving Changes..."
              : "Creating Event..."
            : isEditMode
              ? "Save Changes"
              : "Create Event"}
        </button>
      </div>
    </form>
  );
}

export default EventForm;
