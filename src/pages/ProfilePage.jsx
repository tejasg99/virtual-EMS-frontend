import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { HiOutlineUserCircle, HiOutlineMail, HiOutlineShieldCheck, HiOutlinePencil } from 'react-icons/hi';

// RTK query hook
import { useGetCurrentUserQuery } from "../api/userApiSlice.js";
import { selectCurrentUser } from "../slices/authSlice.js";

// Reusable Loading/Error components
const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {message || 'Could not load profile data.'}</span>
    </div>
);

function ProfilePage() {
  // Attempt to get user from auth slice (might be slightly stale after refresh until query finishes)
  const cachedUser = useSelector(selectCurrentUser);

  // RTK query hook for fresh data
  const { data: userData, isLoading, isError, error, isSuccess } = useGetCurrentUserQuery();

  // User data display
  const user = userData?.data?.user || cachedUser;

  if(isLoading) {
    return <LoadingSpinner />;
  }

  if(isError || !user) {
    return <ErrorDisplay message={error?.data?.message || 'Failed to load user profile'}/>
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md p-6 md:p-8 rounded-lg">
        <div className="">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 border-b border-gray-400 pb-4">
                Your profile
            </h1>
        </div>
        <div className="space-y-5">
            {/* Name */}
            <div className="flex items-center">
                <HiOutlineUserCircle className="w-6 h-6 mr-3 text-gray-500 flex-shrink-0"/>
                <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-lg text-gray-900">{user.name}</p>
                </div>
            </div>

            {/* Email */}
            <div className="flex items-center">
                <HiOutlineMail className="w-6 h-6 mr-3 text-gray-500 flex-shrink-0" />
                <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg text-gray-900">{user.email}</p>
                </div>
            </div>

            {/* Role */}
            <div className="flex items-center">
                <HiOutlineShieldCheck className="w-6 h-6 mr-3 text-gray-500 flex-shrink-0" />
                <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="text-lg text-gray-900 capitalize">{user.role}</p>
                </div>
            </div>

            {/* Edit Profile Button/Link (Placeholder) */}
            <div className="pt-5 border-t border-gray-400 mt-6">
                {/* TODO: Create an EditProfilePage and link to it */}
                <button
                // onClick={() => navigate('/profile/edit')}
                disabled // Disable for now
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                <HiOutlinePencil className="w-5 h-5 mr-2" />
                Edit Profile (Coming Soon)
                </button>
            </div>
        </div>
    </div>
  )
}

export default ProfilePage