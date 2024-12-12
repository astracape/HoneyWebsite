import React, { useState, useRef, useEffect } from 'react'
import { FaUser, FaEllipsisV, FaBars, FaTimes } from "react-icons/fa";
import { BsCart4 } from "react-icons/bs";
// import logo from "../assets/logo.png"
import { Link, useNavigate } from 'react-router-dom';
import logo from "../assets/Group73.png"
import { auth, database } from '../FirebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { get, ref } from 'firebase/database';
import { toast } from 'react-toastify';

function NavBar({ isAuth, setIsAuth, isAdmin, setIsAdmin }) {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

    const toggleMobileDropdown = () => setIsMobileDropdownOpen(!isMobileDropdownOpen);
    const dropdownRef = useRef(null); // For dropdown
    const iconRef = useRef(null); // For icon

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                iconRef.current &&
                !iconRef.current.contains(e.target)
            ) {
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

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Logout failed');
            console.error(error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("User is logged in:", user);
                setIsAuth(true);

                // Fetch user role from Firebase Database
                const userRef = ref(database, `users/${user.uid}`);
                const snapshot = await get(userRef);
                const userData = snapshot.val();
                console.log("User role data:", userData);
                setIsAdmin(userData?.role === 'admin');
            } else {
                console.log("User is logged out");
                setIsAuth(false);
                setIsAdmin(false);
            }

        });
        return () => unsubscribe();
    }, []);
    return (
        <div>

            <header className="bg-gradient-to-r from-[#f2d275] to-[#8B4513] py-2 px-4  h-20 relative">
                <div className=" mx-auto flex justify-between items-center">
                    <div>
                        <img src={logo} className="h-16"></img>
                    </div>
                    <nav className="hidden md:flex justify-end w-full items-end space-x-6">
                        <div className='flex space-x-6'>
                            <Link to="/" className="text-black hover:text-yellow-400">Home</Link>
                            <Link to="/productpage" className="text-black hover:text-yellow-400"
                            // ref={productsRef} onClick={toggleProductPopup}
                            >
                                Products</Link>
                            <Link to="/blog" className="text-black hover:text-yellow-400">Blog</Link>
                            <Link to="/aboutus" className="text-black hover:text-yellow-400">About Us</Link>

                        </div>
                        {isAuth ? (
                            <button onClick={handleLogout} className="text-black hover:text-yellow-400">Logout</button>
                        ) : (
                            <button onClick={() => navigate('/login')} className="text-black hover:text-yellow-400">Login</button>
                        )}
                        <Link to="/cart" className="text-black hover:text-yellow-400 mb-1"><BsCart4 /></Link>

                        {isAdmin && (
                            <div className="relative mb-1">
                                <div
                                    ref={iconRef}
                                    onClick={toggleDropdown}
                                    className="text-white cursor-pointer"
                                >
                                    <FaUser onClick={toggleDropdown} className="text-black cursor-pointer" /></div>
                                {isDropdownOpen && (
                                    <div ref={dropdownRef} className="absolute right-0 w-48 bg-white border rounded-lg mt-8 shadow-lg z-50">
                                        <Link to="/dashboard" className="block px-4 py-2 text-black hover:bg-gray-200">Dashboard</Link>

                                    </div>
                                )}
                            </div>
                        )}

                    </nav>

                    <div className="md:hidden block z-50">
                        <button onClick={toggleMobileMenu} className='text-white text-xl'>
                            {isMobileMenuOpen ? <FaTimes className="text-white text-4xl p-2" /> : <FaBars className="text-white text-xl" />}
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (

                    <div className="absolute left-0 w-full  md:hidden bg-gradient-to-r from-[#FFA500] to-[#8B4513] p-4">
                        <a href="/" className="block text-white hover:text-yellow-400 mb-2 w-1/2">Home</a>

                        <a href='/productpage' className="block text-white hover:text-yellow-400 mb-2">Products</a>
                        <a href="/blog" className="block text-white hover:text-yellow-400 mb-2">Blog</a>
                        <Link to="/aboutus" className="block text-white hover:text-yellow-400 mb-2">About Us</Link>
                        {isAuth ? (
                            <button onClick={handleLogout} className="text-white hover:text-yellow-400 mb-2">Logout</button>
                        ) : (
                            <button onClick={() => navigate('/login')} className="text-white hover:text-yellow-400 mb-2">Login</button>
                        )}
                        <Link to="/cart" className="text-white hover:text-yellow-400 mb-2 p-2"><BsCart4 /></Link>

                        {isAdmin && (
                            <div className="relative">
                                <div
                                    ref={iconRef}
                                    onClick={toggleMobileDropdown}
                                    className="text-white cursor-pointer"
                                >
                                    <FaUser />
                                </div>

                                {isMobileDropdownOpen && (
                                    <div
                                        ref={dropdownRef}
                                        className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50"
                                    >
                                        <Link to="/addproduct" className="block px-4 py-2 text-black hover:bg-gray-200">
                                            Dashboard
                                        </Link>

                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                )}



            </header>
            <div style={{ marginTop: isMobileMenuOpen ? '250px' : '0', transition: 'margin-top 0.3s ease' }}>

                <div>

                </div>
            </div>
        </div>
    )
}

export default NavBar