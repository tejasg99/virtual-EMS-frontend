import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm.jsx";

function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 md:p-10 shadow-lg rounded-lg border border-gray-200">
        {/* Header */}
        <div>
          {/* Logo here */}
          <h2 className="mt-6 text-center text-xl md:text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
