import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUserRole, canAccessSuperAdmin, logout } from "../utils/roleUtils";

function Header({ hideAuthLinks, isHomepage, showHomeOnQuestions }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location
  const currentPath = location.pathname;

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    navigate("/signin");
  };

  let sessionLinks = [];

  if (hideAuthLinks && showHomeOnQuestions) {
    sessionLinks.push(
      <Link key="home" to="/" className="text-blue-600 font-semibold hover:underline">
        {/* Home */}
      </Link>
    );
  } else if (!hideAuthLinks) {
    if (isLoggedIn) {
      // Add user role display
      const userRole = getCurrentUserRole();
      if (userRole) {
        sessionLinks.push(
          // <span key="role" className="text-gray-600 font-medium">
          //   Role: {userRole}
          // </span>
        );
      }
      
      sessionLinks.push(
        <button
          key="logout"
          onClick={handleLogout}
          className="text-red-600 font-semibold hover:underline"
        >
          Logout
        </button>
      );

      // Add role-based navigation links
      // Note: Approval dashboard is now accessed through admin dashboard for ROLE_DEFAULT users
      
      
      if (canAccessSuperAdmin()) {
        sessionLinks.unshift(
          <Link key="super-admin" to="/super-admin-approval" className="text-blue-600 font-semibold hover:underline">
            Super Admin
          </Link>
        );
      }
      
      // Always add home link (role-based)
      const dashTarget = userRole === 'ROLE_DEFAULT' ? '/approval' : (userRole === 'admin' ? '/approval' : '/');
      if (currentPath !== dashTarget) {
        sessionLinks.unshift(
          <Link key="dashboard" to={dashTarget} className="text-blue-600 font-semibold hover:underline">
            Dashboard
          </Link>
        );
      }
      const homeTarget = '/';
      if (currentPath !== homeTarget) {
        sessionLinks.unshift(
          <Link key="home-link" to={homeTarget} className="text-blue-600 font-semibold hover:underline">
            Home
          </Link>
        );
      }
    } else {
      if (!isHomepage) {
        sessionLinks.push(
          <Link key="home" to="/" className="text-blue-600 font-semibold hover:underline">
            {/* Home */}
          </Link>
        );
      }
      // Add Admin Dashboard link when not logged in and not on signin/signup pages
      if (currentPath !== '/signin' && currentPath !== '/signup') {
        sessionLinks.push(
          <Link key="admin-dashboard-unauth" to="/admin" className="text-blue-600 font-semibold hover:underline">
            {/* Admin */}
          </Link>
        );
      }
      sessionLinks.push(
        <Link key="signin" to="/signin" className="text-purple-700 font-medium hover:underline">
          Sign In
        </Link>,
        <Link key="signup" to="/signup" className="text-purple-700 font-medium hover:underline">
          {/* Sign Up */}
        </Link>
      );
    }
  }

  return (
    <div className="relative min-h-[150px] bg-white py-4 overflow-hidden">


      {/* Content */}
      <div className="relative z-10">
        {/* Session Links */}
        <div className="flex justify-end px-6 ">
          <div className="space-x-4">{sessionLinks}</div>
        </div>

        {/* Top Logos (visible only on md and larger) */}
        <div className="hidden md:flex justify-between items-center px-6">
          {/* Yi Logo */}
          <a
            href="https://youngindians.net/"
            className="cursor-pointer"
          >
            <img
              src="/assets/Yi.png"
              alt="Yi Logo"
              className="h-20 object-contain"
            />
          </a>
          {/* CII Logo */}
          <a
            href="https://www.cii.in/"
            className="cursor-pointer"
          >
            <img
              src="/assets/Yi-CII.png"
              alt="CII Logo"
              className="h-16 object-contain"
            />
          </a>
        </div>

        {/* Center Road Safety Logo - Desktop */}
        <div className="hidden md:flex justify-center -mt-20">
          <a
            href="https://youngindians.net/road-safety/"
            className="cursor-pointer"
          >
            <img
              src="/assets/Yi-RoadSafety.png"
              alt="Road Safety Logo"
              className="h-24 object-contain"
            />
          </a>
        </div>

        {/* Center Road Safety Logo - Mobile */}
        <div className="md:hidden flex justify-center mt-4">
          <a
            href="https://youngindians.net/road-safety/"
            className="cursor-pointer"
          >
            <img
              src="/assets/Yi-RoadSafety.png"
              alt="Road Safety Logo"
              className="h-20 object-contain"
            />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Header;
