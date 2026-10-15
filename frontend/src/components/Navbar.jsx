import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AudioLines, Menu, X, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/changelog", label: "Changelog" },
];

const linkClass = ({ isActive }) =>
  `transition-colors ${isActive ? "text-indigo-600" : "hover:text-indigo-600"}`;

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, initializing, logout } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const close = () => setIsOpen(false);

  const handleLogout = async () => {
    await logout();
    close();
    setIsProfileOpen(false);
    navigate("/");
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user initial for profile avatar
  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <section className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to="/"
          onClick={close}
          className="group flex items-center gap-2 text-slate-900 transition-colors hover:text-indigo-600"
        >
          <AudioLines className="h-6 w-6 transition-transform group-hover:scale-110" />
          <div className="text-xl font-semibold tracking-tight">Vocalis</div>
        </Link>

        <ul className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {initializing ? null : isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Profile menu"
                aria-expanded={isProfileOpen}
              >
                {getUserInitial()}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">
                      {user?.name || "User"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-indigo-600"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="flex h-10 w-10 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-slate-100 hover:text-indigo-600 md:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </section>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-sm font-medium text-slate-600 sm:px-6">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "hover:bg-slate-100 hover:text-indigo-600"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}

            <li className="mt-2 border-t border-slate-200 pt-3">
              {initializing ? null : isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-md bg-slate-100 px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                      {getUserInitial()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {user?.name || "User"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={close}
                    className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={close}
                    className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={close}
                    className="block rounded-md px-3 py-2 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={close}
                    className="block rounded-md bg-indigo-600 px-3 py-2 text-center font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
