import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { HiMenu, HiX } from "react-icons/hi";

// Redux state selector, logout action and Api hook
import { selectCurrentUser, logOut } from "../../slices/authSlice.js";
import { useLogoutMutation } from "../../api/authApiSlice.js";

// Utility function to get initials
import { getInitials } from "../../lib/utils";

function Navbar() {
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall, { isLoading: isLoggingOut }] = useLogoutMutation();

  // desktop dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // ref for detecting outside clicks

  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap(); // logout api call
      dispatch(logOut()); // clear redux state
      toast.success("Logged out successfully");
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed: ", err);
      toast.error(err?.data?.message || "Logout failed. Please try again.");
      // Force clear state even if API fails, as user intended to log out
      dispatch(logOut());
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      navigate("/login");
    }
  };

  const userInitials = getInitials(currentUser?.name);

  // close dropdown by clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Function to close mobile menu (useful for links)
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  return (
    <nav className="bg-gradient-to-b from-white to-slate-50 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
            >
              EventMan
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              to="/events"
              className="text-black hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md  text-sm font-medium transition-colors"
            >
              Browse events
            </Link>
            {/* Conditionally show Create Event based on role */}
            {currentUser && (
                <Link
                  to="/create-event"
                  className="text-black hover:bg-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Create Event
                </Link>
              )}
          </div>

          {/* Right side: Auth buttons or Profile Dropdown */}
          <div className="flex items-center">
            {currentUser ? (
              // --- Logged In: Profile Dropdown ---
              <div className="relative ml-3" ref={dropdownRef}>
                <div>
                  <button
                    type="button"
                    className="flex items-center justify-center bg-indigo-600 rounded-full h-9 w-9 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-100 focus:ring-white hover:bg-indigo-800 cursor-pointer transition-colors"
                    id="user-menu-button"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    {userInitials || "?"} {/* Show initials or fallback */}
                  </button>
                </div>

                {/* Dropdown Panel */}
                {isDropdownOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-gray-500 ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex="-1"
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      Signed in as <br />
                      <span className="font-medium truncate">
                        {currentUser.name || "User"}
                      </span>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      tabIndex="-1"
                      id="user-menu-item-0"
                      onClick={() => setIsDropdownOpen(false)} // Close on click
                    >
                      Your Profile
                    </Link>
                    {/* Add other links like 'My Registrations' here */}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={`block w-full text-left px-4 py-2 text-sm ${isLoggingOut ? "text-gray-400" : "text-red-600 hover:bg-red-50"}`}
                      role="menuitem"
                      tabIndex="-1"
                      id="user-menu-item-2"
                    >
                      {isLoggingOut ? "Logging out..." : "Sign out"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // --- Logged Out: Login/Register Buttons ---
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className=" text-slate-700 hover:bg-green-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center ml-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <HiX className="block h-6 w-6 text-black" aria-hidden="true" /> // Close Icon
                ) : (
                  <HiMenu className="block h-6 w-6 text-black" aria-hidden="true" /> // Menu Icon
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu Panel */}
      <div
        className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"} transition-all duration-300 ease-in-out`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-r from-slate-50 to-slate-200 border-t border-slate-400">
          {/* Mobile Links */}
          <Link
            to="/events"
            className="text-black hover:bg-slate-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
            onClick={closeMobileMenu}
          >
            Browse events
          </Link>
          {currentUser && (
            <Link
              to="/create-event"
              className="text-black hover:bg-slate-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={closeMobileMenu}
            >
              Create Event
            </Link>
          )}

          {/* Mobile Auth/Profile Section */}
          <div className="pt-4 pb-3 border-t border-slate-400">
            {currentUser ? (
              // --- Logged In (Mobile) ---
              <>
                <div className="flex items-center px-5 border-b border-slate-400">
                  <div className="flex-shrink-0">
                    {/* You could show initials here too if desired */}
                    <div className="flex items-center justify-center bg-indigo-600 rounded-full h-9 w-9 text-sm text-white font-semibold">
                      {userInitials || "?"}
                    </div>
                  </div>
                  <div className="ml-3 mb-4">
                    <div className="text-base font-medium leading-none text-black mb-1">
                      {currentUser.name || "User"}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    to="/profile"
                    className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-slate-500 hover:text-white transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`block w-full text-left rounded-md px-3 py-2 text-base font-medium ${isLoggingOut ? "text-slate-500" : "text-red-400 hover:bg-gray-700 hover:text-red-300"} transition-colors`}
                  >
                    {isLoggingOut ? "Logging out..." : "Sign out"}
                  </button>
                </div>
              </>
            ) : (
              // --- Logged Out (Mobile) ---
              <div className="px-2 space-y-1">
                <Link
                  to="/login"
                  className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-slate-500 hover:text-white transition-colors"
                  onClick={closeMobileMenu}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-slate-500 hover:text-white transition-colors"
                  onClick={closeMobileMenu}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
