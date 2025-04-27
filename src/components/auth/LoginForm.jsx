import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";

// Import RTK query hook and redux action
import { useLoginMutation } from "../../api/authApiSlice.js";
import { setCredentials } from "../../slices/authSlice.js";

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Mutation hook
  const [login, { isLoading, isError, error: apiError, isSuccess }] =
    useLoginMutation();

  // form submission
  const onSubmit = async (data) => {
    // Ensure data is not empty before proceeding
    if (!data || !data.email || !data.password) {
        console.error("Form data is missing email or password before sending.");
        toast.error("Please enter both email and password.");
        return; // Prevent sending empty data
    }

    try {
        //call login mutation with email and password
        const result = await login(data).unwrap(); //unwrap will throw an error if mutation fails
        
        if(result?.data) {
            dispatch(setCredentials(result.data)); // to set credentials(state)
        } else {
            throw new Error('Unexpected login response');
        }
    } catch (err) {
        console.error('Login Failed: ', err);
        const errorMessage = err?.data?.message || err?.error || 'Login failed. Please check your credentials.';
        toast.error(errorMessage);
    }
  };

  // To handle redirection after successful login and state update
  useEffect(() => {
    if(isSuccess) {
        toast.success('Login successful');
        navigate('/'); 
    }
  }, [isSuccess, navigate]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Display general form error from server */}
      {errors?.root?.serverError && (
        <p className="text-sm text-red-600 text-center bg-red-100 p-2 rounded-md">
          {errors.root.serverError.message}
        </p>
      )}

      {/* Email Input */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email address
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
          className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}`}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password Input */}
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
          autoComplete="current-password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
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

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm 
                     text-sm font-medium text-white 
                     bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-indigo-500 
                     ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
