import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import UserListItem from '../components/admin/UserListItem.jsx';
import { useGetAllUsersQuery } from '../api/userApiSlice.js';
import { selectCurrentUser } from '../slices/authSlice.js';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {message || 'Could not load user data.'}</span>
    </div>
);

// Pagination component
const PaginationControls = ({ currentPage, totalPages, onPageChange, isFetching }) => {
    const handlePrevious = () => {
        if(currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if(currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    if (!totalPages || totalPages <= 1) {
        return null; // Don't render if only one page or no pages
    }

    return (
        <div className="mt-6 flex items-center justify-center space-x-3">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1 || isFetching}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <HiChevronLeft className="w-5 h-5 mr-1" />
                Previous
            </button>
            <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages || isFetching}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
                <HiChevronRight className="w-5 h-5 ml-1" />
            </button>
        </div>
    );
};

function AdminUserManagementPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    // TODO: Add state for search term, sorting

    const currentUser = useSelector(selectCurrentUser);

    const {
        data: usersData,
        isLoading,
        isFetching,
        isError,
        error,
        isSuccess,
    } = useGetAllUsersQuery({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'createdAt',
        order: 'asc',
    }, {
        // Keep previous data while fetching new page for smoother UX
        // keepUnusedDataFor: 60,
    });

    const users = usersData?.data?.users || [];
    const pagination = usersData?.data?.pagination || {};
    const totalPages = pagination?.totalPages || 0;

    // Handler for changing the page
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        // RTK Query automatically refetches when the 'page' parameter changes
    }

    // Render logic
    let content;
    if(isLoading) {
        content = <div className="text-center py-10"><LoadingSpinner /></div>;
    } else if (isError) {
        content = <ErrorDisplay message={error?.data?.message || 'Failed to fetch users'} />
    } else if (isSuccess && users.length === 0) {
        content = <p className="text-center text-gray-600 py-10">No users found.</p>;
    } else if (isSuccess && users.length > 0) {
        content = (
            <div className="overflow-x-auto shadow border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                            <th scope="col" className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <UserListItem
                                key={Math.random()} // using random keys
                                user={user}
                                currentAdminId={currentUser?._id} // To prevent self-action 
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        );
    } else {
        content = <p className="text-center text-gray-600 py-10">Could not load users.</p>;
    }

  return (
    <div className="space-y-6 h-screen mx-5 md:mx-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            User Management
        </h1>

        {/* TODO: Add Search/Filter Controls */}

        {/* isFetching for refetch indicator */}
        {isFetching && <p className="text-center text-indigo-600 text-sm my-2">Loading...</p>}
        {content}

        {/* Pagination Controls */}
        {isSuccess && users.length > 0 && (
            <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isFetching={isFetching} // disable buttons while refetching
            />
        )}
    </div>
  );
}

export default AdminUserManagementPage;