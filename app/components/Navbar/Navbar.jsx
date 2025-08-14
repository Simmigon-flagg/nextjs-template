'use client';

import { UsersContext } from '@/app/context/UserContext';
import Image from 'next/image';
import Link from 'next/link';
import { useContext, useEffect, useRef, useState } from 'react';

const Navbar = () => {
  const { user, signOutUser } = useContext(UsersContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const logout = async () => {
    closeMenu();
    setDropdownOpen(false);
    await signOutUser();
  };

  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileImage = user?.imagefileUrl || user?.image;

  return (
    <header className="bg-indigo-700 text-white shadow relative z-50">
      <nav className="h-20 max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          YourBrand
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium relative">
          <ul className="flex gap-6">
            {user ? (
              <>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/todos">Todos</Link>
                </li>
                <li>
                  <Link href="/profile">Profile</Link>
                </li>
                <li>
                  <button onClick={logout}>Sign out</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login">Login</Link>
                </li>
                <li>
                  <Link href="/createaccount">Create Account</Link>
                </li>
              </>
            )}
          </ul>

          {profileImage && (
            <div className="relative ml-4" ref={dropdownRef}>
              <button onClick={toggleDropdown}>
                <div className="w-11 h-11 relative rounded-full overflow-hidden border-2 border-white">
                  <Image
                    src={profileImage}
                    alt="Profile"
                    fill
                    sizes="44px"
                    className="object-cover"
                    priority
                  />
                </div>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow z-50">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded hover:bg-indigo-800 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-indigo-800 z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-6 text-sm font-medium">
          <button
            onClick={closeMenu}
            className="absolute top-4 right-4 text-white focus:outline-none"
          >
            ✕
          </button>

          {profileImage && (
            <>
              <Link href="/profile" onClick={closeMenu}>
                <div className="flex items-center gap-2 pb-4">
                  <div className="w-8 h-8 relative">
                    <Image
                      src={profileImage}
                      alt="Profile"
                      fill
                      sizes="32px"
                      className="rounded-full object-cover border-2 border-white"
                      priority
                    />
                  </div>
                  <span className="text-white">{user.name}</span>
                </div>
              </Link>
              <hr />
            </>
          )}

          {user ? (
            <>
              <Link
                href="/"
                onClick={closeMenu}
                className="block text-white hover:text-gray-300"
              >
                Home
              </Link>
              <Link
                href="/todos"
                onClick={closeMenu}
                className="block text-white hover:text-gray-300"
              >
                Todos
              </Link>
              <Link
                href="/profile"
                onClick={closeMenu}
                className="block text-white hover:text-gray-300"
              >
                Profile
              </Link>

              <button
                onClick={logout}
                className="block text-white hover:text-gray-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={closeMenu}
                className="block text-white hover:text-gray-300"
              >
                Login
              </Link>
              <Link
                href="/createaccount"
                onClick={closeMenu}
                className="block text-white hover:text-gray-300"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
