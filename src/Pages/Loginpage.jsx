import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth, database } from '../FirebaseConfig';

import img from "../assets/bee1.png"
import { doc, getDoc } from 'firebase/firestore';


function Loginpage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // Sign in the user
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            let user = userCredential.user; // Extract the user from userCredential

            // Force reload to get the latest email verification status
            await user.reload();
            user = auth.currentUser;

            // If email is not verified, prevent login
            if (!user.emailVerified) {
                toast.error("Please verify your email before logging in.");
                await signOut(auth);
                localStorage.clear();
                sessionStorage.clear();
                return;
            }

            // Fetch user role from Firestore
            const userRoleRef = doc(database, "users", user.uid);
            const snapshot = await getDoc(userRoleRef);

            if (!snapshot.exists()) {
                toast.error("User data not found. Please contact support.");
                await signOut(auth);
                localStorage.clear();
                sessionStorage.clear();
                return;
            }

            const userData = snapshot.data();

            // Redirect based on role
            if (userData.role === "admin") {
                setTimeout(() => {
                    navigate("/dashboard");
                }, 1000);
            } else if (userData.role === "user") {
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } else {
                toast.error("Role not assigned. Please contact support.");
                await signOut(auth);
                localStorage.clear();
                sessionStorage.clear();
            }

        } catch (error) {
            console.error("Login Error:", error);
            toast.error("Login failed. Please check your email and password.");
        }
    };

    return (
        <div>
            {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-10'>
                <div>
                  
                </div>
                <div className=' my-auto lg:border-l-2 lg:p-5'>
                    <form onSubmit={handleLogin}>
                        <h1 className='font-bold text-2xl md:text-3xl mb-5'>Login your account</h1>
                        <input
                         type='email' 
                         name='email' 
                         placeholder='Email'
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className='rounded-lg p-5 md:w-3/4 border-0 w-full border-l-4 border-[#5a3a01] mt-3 focus:ring-0  focus:border-[#5a3a01] focus:outline-none' />
                        <div className="relative mt-5 gap-6">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name='password'
                                placeholder='Password'
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                className='p-5 rounded-lg md:w-3/4 border-0 border-l-4 border-[#5a3a01] focus:ring-0  focus:border-[#5a3a01] focus:outline-none pr-10'
                            />

                            <span
                                className="absolute left-2/3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#5a3a01]"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <button className='bg-[#5a3a01] rounded-lg w-full md:w-3/4 mt-5 h-10 text-white'>Submit</button>
                    </form>
                    <div className=' mt-3 flex flex-col'>
                        <Link to='/reg' className='text-yellow-800 underline text-xs md:text-base md:text-left mt-5 self-start'>Don't have an account?Signup</Link>
                        <Link to='/forgotpwd' className='text-yellow-800 underline text-xs md:text-base mt-3 self-start'>Forgot Password?</Link>

                        </div>
                        
                </div>
            </div> */}
           <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
  <div className="w-full max-w-md">
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Decorative header */}
      <div className="bg-amber-100 py-4 px-8">
        <h2 className="text-xl font-bold text-amber-800">Capenaturals</h2>
        <p className="text-amber-800 text-sm mt-1">Pure Honey & Organic Spices</p>
      </div>
      
      <div className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition duration-200"
              required
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition duration-200 pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5" />
                ) : (
                  <FaEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
           
            
            <Link 
              to="/forgotpwd" 
              className="text-sm font-medium text-amber-800 hover:text-amber-500"
            >
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Don't have an account?
              </span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link
              to="/reg"
              className="font-medium text-amber-800 hover:text-amber-500"
            >
              Create new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
            {/* <ToastContainer/> */}
            <ToastContainer
                position="bottom-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                limit={1}
            />
        </div>
    )
}

export default Loginpage