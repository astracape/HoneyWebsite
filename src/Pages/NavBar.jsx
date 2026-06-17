import React, { useState, useRef, useContext, useEffect } from 'react'
import { FaUser, FaEllipsisV, FaBars, FaTimes, FaChevronDown, FaTachometerAlt, FaSignOutAlt, FaHistory } from "react-icons/fa";
import { BsCart4 } from "react-icons/bs";
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import { auth, database } from '../FirebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { CartContext } from '../context/CartContext';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

function NavBar({ isAuth, setIsAuth, isAdmin, setIsAdmin, userName, profileImage }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const { cart } = useContext(CartContext);
  const navigate = useNavigate();
  const iconRef = useRef(null);
  const dropdownRef = useRef(null);

  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);
  const toggleAccountDropdown = () => setAccountDropdownOpen(!isAccountDropdownOpen);
  const toggleMobileDropdown = () => setIsMobileDropdownOpen(!isMobileDropdownOpen);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuth(false);
      setIsAdmin(false);
      toast.success('Logged out successfully');
      navigate('/reg');
    } catch (error) {
      toast.error('Logout failed');
      console.error(error);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        iconRef.current &&
        !iconRef.current.contains(e.target)
      ) {
        setAccountDropdownOpen(false);
        setIsMobileDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);
  const handleLogoutAndCloseMenu = async () => {
    await handleLogout();
    toggleMobileMenu();
  };

  return (
    <div className='fixed top-4 left-0 w-screen z-40 transition-all duration-300'>
      <header className="bg-gradient-to-r from-white to-brandyellow py-2 px-4 lg:px-8 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src="/logo123.png" className="h-10 sm:h-12 md:h-16" alt="Logo 1" />
              <img src="/122.png" className="h-10 sm:h-12 md:h-16 ml-2" alt="Logo 2" />
            </Link>
          </div>
          <nav className="hidden md:flex flex-1 justify-end items-center gap-4 mr-10 lg:gap-6 ml-6">
            <div className="flex space-x-3 lg:space-x-6">
              <Link to="/" className="text-black hover:text-yellow-700">Home</Link>
              <Link to="/productpage" className="text-black hover:text-yellow-700">Products</Link>
              <Link to="/gifting" className="text-black hover:text-yellow-700">Gifting</Link>
              <Link to="/blog" className="text-black hover:text-yellow-700">Blog</Link>
              <Link to="/reviews" className="text-black hover:text-yellow-700">Reviews</Link>
              <Link to="/aboutus" className="text-black hover:text-yellow-700">About Us</Link>
            </div>
            {!isAdmin && (
              <Link to="/cart" className="text-black hover:text-yellow-700 mb-1 relative">
                <BsCart4 />
                {cart.length > 0 && (
                  <span className="absolute -top-2.5 -right-3.5 bg-white text-black text-xs rounded-full px-1.5">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}

            {isAuth ? (
              <div className="dropdown-container relative">
                <div
                  ref={iconRef}
                  onClick={toggleAccountDropdown}
                  className="text-black cursor-pointer flex items-center hover:text-yellow-700"
                >
                  {/* <FaUser />
                  <span className="ml-2 bg-white bg-opacity-50 px-2 rounded-full">
                    {userName?.charAt(0) || "U"}
                  </span> */}
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border border-gray-300 object-cover ml-2"
                    />
                  ) : (
                    <div className="ml-2 bg-white text-white font-semibold w-8 h-8 flex items-center justify-center rounded-full text-sm">
                      {userName ? userName.charAt(0).toUpperCase() : <FaUser />}
                    </div>
                  )}

                  <FaChevronDown
                    className={`ml-1 transition-transform size-2 ${isAccountDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>
                {isAccountDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-7 w-48 bg-white border border-white rounded-lg shadow-lg z-50"
                  >
                    {isAdmin ? (
                      <>
                        <Link to="/dashboard" className="dropdown-item" onClick={() => setAccountDropdownOpen(false)}>
                          <FaTachometerAlt /> Dashboard
                        </Link>
                         <Link to="/profile" className="dropdown-item" onClick={() => setAccountDropdownOpen(false)}>
                          <FaUser /> Profile
                        </Link>
                        <Link onClick={handleLogout} className="dropdown-item">
                          <FaSignOutAlt /> Logout
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/oh" className="dropdown-item" onClick={() => setAccountDropdownOpen(false)}>
                          <FaHistory /> Order History
                        </Link>
                        <Link to="/profile" className="dropdown-item" onClick={() => setAccountDropdownOpen(false)}>
                          <FaUser /> Profile
                        </Link>
                        <Link onClick={handleLogout} className="dropdown-item">
                          <FaSignOutAlt /> Logout
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => navigate("/reg")} className="text-black hover:text-yellow-700">
                Login
              </button>
            )}
          </nav>
          <div className="md:hidden block z-50">
            <button onClick={toggleMobileMenu} className="text-black text-xl">
              {isMobileMenuOpen ? <FaTimes className="text-4xl p-2" /> : <FaBars />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleMobileMenu}
          ></div>
        )}

        <div
          className={`fixed top-0 left-0 w-3/4  h-full bg-yellow-600 text-white z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}>
          <div className="flex flex-col p-4 space-y-4 mt-10  items-start">
            <Link to="/" className="text-white hover:text-yellow-200 text-lg font-medium w-full" onClick={toggleMobileMenu}>Home</Link>
            <Link to="/productpage" className="text-white hover:text-yellow-200 text-lg font-medium w-full " onClick={toggleMobileMenu}>Products</Link>
            <Link to="/gifting" className="text-white hover:text-yellow-200 text-lg font-medium w-full " onClick={toggleMobileMenu}>Gifting</Link>
            <Link to="/blog" className="text-white hover:text-yellow-200 text-lg font-medium w-full " onClick={toggleMobileMenu}>Blog</Link>
            <Link to="/reviews" className="text-white hover:text-yellow-200 text-lg font-medium w-full " onClick={toggleMobileMenu}>Reviews</Link>
            <Link to="/aboutus" className="text-white hover:text-yellow-200 text-lg font-medium w-full  " onClick={toggleMobileMenu}>About Us</Link>

            {!isAdmin && (
              <Link to="/cart" className="text-white hover:text-yellow-200 text-lg font-medium w-full " onClick={toggleMobileMenu}>
                <BsCart4 />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full px-1">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}

            {isAuth ? (
              <div className="w-full">
                <div onClick={toggleMobileDropdown} className="flex cursor-pointer">
                  <FaUser />
                  <span className="ml-2">{userName}</span>
                  <FaChevronDown
                    className={`ml-1 transform ${isMobileDropdownOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </div>
                {isMobileDropdownOpen && (
                  <div className="mt-2 pl-4 space-y-2">
                    {isAdmin ? (
                      <Link to="/dashboard" className="block hover:text-yellow-400" onClick={toggleMobileMenu}>
                        Dashboard
                      </Link>
                      
                    ) : (
                      <>
                        <Link to="/oh" className="block hover:text-yellow-400" onClick={toggleMobileMenu}>
                          Order History
                        </Link>
                        <Link to="/profile" className="block hover:text-yellow-400" onClick={toggleMobileMenu}>
                          Profile
                        </Link>
                      </>
                    )}
                    <button onClick={handleLogoutAndCloseMenu} className="block text-left w-full hover:text-yellow-400">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => { toggleMobileMenu(); navigate("/reg"); }} className="hover:text-yellow-400">
                Login
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default NavBar;