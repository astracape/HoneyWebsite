import React, { useState, useRef, useEffect } from 'react'
import { FaUser, FaEllipsisV, FaBars, FaTimes, FaChevronDown, FaTachometerAlt, FaSignOutAlt, FaHistory } from "react-icons/fa";
import { BsCart4 } from "react-icons/bs";
// import logo from "../assets/logo.png"
import { Link, useNavigate } from 'react-router-dom';
import { auth, database } from '../FirebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { get, onValue, ref } from 'firebase/database';
import { toast } from 'react-toastify';
import { FaEllipsisVertical } from 'react-icons/fa6';

function NavBar({ isAuth, setIsAuth, isAdmin, setIsAdmin }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState(""); 
  const toggleMobileDropdown = () => setIsMobileDropdownOpen(!isMobileDropdownOpen);
  const dropdownRef = useRef(null); // For dropdown
  const iconRef = useRef(null); // For icon

  const toggleMobileMenu1 = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogoutAndCloseMenu = async () => {
    await handleLogout(); // Perform logout
    toggleMobileMenu(); // Close the sidebar
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
        setIsDropdownOpen(false);
        setIsMobileDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const navigate = useNavigate()

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };
  const toggleAccountDropdown = () => {
    setAccountDropdownOpen(!isAccountDropdownOpen);
  };
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuth(true);
        setAccountDropdownOpen(false);
        localStorage.setItem("userId", user.uid);

        // Fetch user role
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        if (userData) {
          setIsAdmin(userData?.role === 'admin');
          setUserName(userData.name || "User"); // Fallback if name is missing
        }
       

        // Fetch cart count from Firebase
        const cartRef = ref(database, `users/${user.uid}/cart`);
        onValue(cartRef, (snapshot) => {
          if (snapshot.exists()) {
            setCartCount(Object.keys(snapshot.val()).length);
          } else {
            setCartCount(0);
          }
        });
      } else {
        setIsAuth(false);
        setIsAdmin(false);
        localStorage.removeItem("userId");

        // Fetch cart count from session storage for unlogged users
        const sessionCart = JSON.parse(sessionStorage.getItem("cart")) || [];
        setCartCount(sessionCart.length);
      }
    });

    return () => unsubscribe();
  }, []);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuth(false);
      setIsAdmin(false);
      navigate('/login')
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
      console.error(error);
    }
  };

  return (
    <div>
      <header className="bg-gradient-to-r from-white to-yellow-600 py-2 px-3 relative">
        <div className="mx-auto flex justify-between items-center">

          <div className='flex md:ml-5'>
            <img src="/logo123.png" className="h-16 mt-1" alt="Logo" />
            <img src="/122.png" className="h-16 mt-1" alt="Logo" />

          </div>
          <nav className="hidden md:flex justify-end w-full items-end mr-10 space-x-6">
            <div className="flex space-x-6">
              <Link to="/" className="text-black hover:text-yellow-700">
                Home
              </Link>
              <Link to="/productpage" className="text-black hover:text-yellow-700">
                Products
              </Link>
              <Link to="/blog" className="text-black hover:text-yellow-700">
                Blog
              </Link>
              <Link to="/aboutus" className="text-black hover:text-yellow-700">
                About Us
              </Link>
            </div>
            {!isAdmin && (
              <Link to="/cart" className="text-black hover:text-yellow-700 mb-1 relative">
                <BsCart4 />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-3.5 bg-white text-black text-xs  rounded-full px-1.5">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuth ? (
              <div className="dropdown-container">
                <div
                  ref={iconRef}
                  onClick={toggleAccountDropdown}
                  className="text-black cursor-pointer flex items-center hover:text-yellow-700"
                >
                  <FaUser className='hover:text-yellow-700' />
                  <span className="ml-2 hover:text-yellow-700">{userName}</span>
                  <FaChevronDown className={`ml-1 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                {isAccountDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-7 w-48  bg-white border border-white rounded-lg shadow-lg z-50"
                  >
                    {isAdmin ? (
                      <>
                        <Link
                          to="/dashboard"
                          className="dropdown-item"
                          onClick={() => setAccountDropdownOpen(false)}
                        ><FaTachometerAlt />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="dropdown-item"
                        ><FaSignOutAlt />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/oh"
                          className="dropdown-item"
                        > <FaHistory />
                          Order History
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="dropdown-item"
                        >  <FaSignOutAlt />
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="text-black hover:text-yellow-700"
              >
                Login
              </button>
            )}
          </nav>
          <div className="md:hidden block z-50">
            <button onClick={toggleMobileMenu} className="text-white text-xl">
              {isMobileMenuOpen ? (
                <FaTimes className="text-white text-4xl p-2" />
              ) : (
                <FaBars className="text-black text-xl" />
              )}
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
          className={`fixed top-0 left-0 w-3/4 h-full bg-yellow-600 text-white z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex flex-col items-start p-4 space-y-4 mt-10">
            <Link to="/" className="text-white hover:text-yellow-400" onClick={toggleMobileMenu1}>
              Home
            </Link>
            <Link to="/productpage" className="text-white hover:text-yellow-400" onClick={toggleMobileMenu1}>
              Products
            </Link>
            <Link to="/blog" className="text-white hover:text-yellow-400" onClick={toggleMobileMenu1}>
              Blog
            </Link>
            <Link to="/aboutus" className="text-white hover:text-yellow-400" onClick={toggleMobileMenu1}>
              About Us
            </Link>
            {!isAdmin && (
              <Link to="/cart" className="text-white hover:text-yellow-400 relative" onClick={toggleMobileMenu1}>
              <BsCart4 />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-xs  rounded-full px-1">
                  {cartCount}
                </span>
              )}
            </Link>
            )}
            
            {isAuth ? (
              <div className="w-full">
                <div
                  onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                  className="flex cursor-pointer"
                >
                  <FaUser />
                  <span className="ml-2">My Account</span>

                  <FaChevronDown
                    className={`ml-1 transform ${isMobileDropdownOpen ? "rotate-180" : "rotate-0"
                      }`}
                  />
                </div>
                {isMobileDropdownOpen && (
                  <div className="mt-2 pl-4 space-y-2">
                    {isAdmin ? (
                      <Link
                        to="/dashboard"
                        className="block text-white hover:text-yellow-400"
                        onClick={toggleMobileMenu1}
                      >
                        Dashboard
                      </Link>

                    ) : (
                      <Link
                        to="/oh"
                        className="block text-white hover:text-yellow-400" onClick={toggleMobileMenu1}
                      >
                        Order History
                      </Link>
                    )}
                    <button
                      onClick={handleLogoutAndCloseMenu}
                      className="block text-left w-full text-white hover:text-yellow-400"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="text-white hover:text-yellow-400"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  )
}

export default NavBar