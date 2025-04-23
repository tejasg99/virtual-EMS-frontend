import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-slate-50 to-slate-200 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h5 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-3">EventMan</h5>
            <p className="text-sm">
              Your platform for hosting and attending engaging virtual events.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-lg font-semibold text-black mb-3">
              Quick Links
            </h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:underline transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="hover:underline transition-colors"
                >
                  Browse Events
                </Link>
              </li>
              {/* Add more links as needed */}
              <li>
                <Link
                  to="/privacy"
                  className="hover:underline transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:underline transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact/Social (Placeholder) */}
          <div>
            <h5 className="text-lg font-semibold text-black mb-3">Connect</h5>
            {/* Add social media icons or contact info here */}
            <p className="text-sm">Follow us on social media!</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
          &copy; {currentYear} EventMan all rights reserved
        </div>
      </div>
    </footer>
  );
}

export default Footer;