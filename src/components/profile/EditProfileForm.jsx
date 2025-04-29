import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

// RTK query hook
import { useUpdateUserProfileMutation } from "../../api/userApiSlice.js";

function EditProfileForm({ currentUser, onClose }) {
  // CurrentUser: object containing the current user data
  // onClose: function to call when editing is done/cancelled

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }, // isDirty helps enable/disable save button
    setError,
  } = useForm({
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
    },
  });

  // Mutation hook
  const [updateProfile, { isLoading, isError, error: apiError, isSuccess }] =
    useUpdateUserProfileMutation();

  // handle form submission
  const onSubmit = async (data) => {
    // Check if data actually changed
    if (!isDirty) {
      toast("No changes detected.");
      onClose(); // Close the form if nothing changed
      return;
    }

    try {
      // mutation trigger
      const result = await updateProfile(data).unwrap();
    } catch (err) {
      console.error("Failed to update profile: ", err);
      const errorMessage =
        err?.data?.message || err?.error || "Failed to update profile";
      toast.error(errorMessage);

      // Set specific field errors if provided (e.g., email already taken)
      if (err?.data?.errors) {
        err.data.errors.forEach((e) =>
          setError(e.field, { type: "manual", message: e.message })
        );
      } else if (
        err?.status === 409 ||
        err?.data?.message?.toLowerCase().includes("email")
      ) {
        // Example: Conflict status for email
        setError("email", {
          type: "manual",
          message: "This email address might already be in use.",
        });
      } else {
        setError("root.serverError", { type: "manual", message: errorMessage });
      }
    }
  };

  // to handle form closing on successful update
  useEffect(() => {
    if (isSuccess) {
      toast.success("Profile updated successfully");
      onClose();
    }
  }, [isSuccess, onClose]);

  // Reset form if currentUser prop changes
  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser, reset]);

  // --- Form Field Styling ---
  const inputBaseClasses =
    "w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const inputErrorClasses =
    "border-red-500 focus:ring-red-500 focus:border-red-500";
  const inputNormalClasses = "border-gray-300";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
  const errorMessageClasses = "mt-1 text-xs text-red-600";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 border-b border-gray-400 pb-4">Edit Profile</h2>        
      </div>

      {/* Form error from server */}
      {errors?.root?.serverError && (
        <p className="text-sm text-red-600 text-center bg-red-100 p-2 rounded-md">
          {errors.root.serverError.message}
        </p>
      )}

      {/* Name input */}
      <div>
        <label htmlFor="edit-name" className={labelClasses}>
          Name
        </label>
        <input
          id="edit-name"
          type="text"
          autoComplete="name"
          {...register("name", {
            required: "Name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
            trim: true,
          })}
          className={`${inputBaseClasses} ${errors.name ? inputErrorClasses : inputNormalClasses}`}
          disabled={isLoading}
        />
        {errors.name && (
          <p className={errorMessageClasses}>{errors.name.message}</p>
        )}
      </div>

      {/* Email input */}
      <div>
        <label htmlFor="edit-email" className={labelClasses}>
          Email address
        </label>
        <input
          id="edit-email"
          type="email"
          autoComplete="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Entered value does not match email format",
            },
          })}
          className={`${inputBaseClasses} ${errors.email ? inputErrorClasses : inputNormalClasses}`}
          disabled={isLoading}
        />
        {errors.email && (
          <p className={errorMessageClasses}>{errors.email.message}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button" // type button prevents form submission
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !isDirty} // disable if loading or no changes made
          className={`inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading || !isDirty ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default EditProfileForm;
