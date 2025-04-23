import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm.jsx';

function RegisterPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-white p-8 md:p-10 shadow-lg rounded-lg border border-gray-200">
            {/* Header */}
            <div>
            {/* Logo here */}
            <h2 className="mt-6 text-center text-xl md:text-3xl font-bold tracking-tight text-gray-900">
                Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
                Or{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                sign in if you already have an account
                </Link>
            </p>
            </div>
            { /* Register Form */}
            <RegisterForm />
        </div>
    </div>
  )
}

export default RegisterPage