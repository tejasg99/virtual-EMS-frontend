import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// RTK query hook
import { useRegisterMutation } from "../../api/authApiSlice.js";

function RegisterForm() {
  const {
    register,
    handleSubmit,
    watch, // to watch password field for validation
    formState: { errors },
    setError,
  } = useForm();

  const navigate = useNavigate();

  // Mutation hook
  const [registerUser, { isLoading, isError, error: apiError, isSuccess }] =
    useRegisterMutation();

  // watch to compare passwords
  const password = watch("password");

  const onSubmit = async (data) => {
    // Destructure to remove confirmPassword before sending to backend
    const { confirmPassword, ...userData } = data;
    try {
        // call register mutation trigger
        const result = await registerUser(userData).unwrap();

    } catch (err) {
        console.error('Registration failed', err);
        const errorMessage = err?.data?.message || err?.error || 'Registration failed. Please try again.';
        toast.error(errorMessage);

        // Set specific field errors if available from backend
        if (err?.data?.errors) {
            err.data.errors.forEach(e => setError(e.field, { type: 'manual', message: e.message }));
        } else if (err?.data?.message && err?.data?.message.toLowerCase().includes('email already exists')) {
            // Handle specific common errors like duplicate email
            setError('email', { type: 'manual', message: 'This email address is already registered.' });
        } else {
            setError('root.serverError', { type: 'manual', message: errorMessage });
        }
    }
  };

  // Effect to handle redirection after successful registration
  useEffect(() => {
    if(isSuccess) {
        toast.success('Registration successful! Please log in to continue');
        navigate('/login'); // redirection to login page
    }
  }, [isSuccess, navigate]);
  

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Display general form error from server */}
      {errors?.root?.serverError && (
        <p className="text-sm text-red-600 text-center bg-red-100 p-2 rounded-md">
          {errors.root.serverError.message}
        </p>
      )}

      {/* Name input */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name
        </label>
        <input
          id="name"
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
          className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
            sm:text-sm ${errors.name ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}`}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>
      {/* Email input */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Entered value does not match email format",
            },
          })}
          className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
            sm:text-sm ${errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}`}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password input*/}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long",
            },
          })}
          className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
            sm:text-sm ${errors.password ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}`}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Input */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) =>
              value === password || "The passwords do not match", // Validate against watched password
          })}
          className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
            sm:text-sm ${errors.confirmPassword ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}`}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm
                     text-sm font-medium text-white
                     bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2
                     focus:ring-offset-2 focus:ring-indigo-500
                     ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </div>
    </form>
  );
}

export default RegisterForm;
