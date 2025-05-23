import React, { useState } from 'react'
import { auth, database } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import img from "../assets/bee1.png"
import { doc, Firestore, setDoc } from 'firebase/firestore';

function RegisterationPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        // firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await sendEmailVerification(user);
            toast.info("Verification email sent. Please check your inbox.");

            console.log("User registered:", user);

            const isAdminEmail = email === "honeycapz25@gmail.com";
            const role = isAdminEmail ? "admin" : "user";

            await setDoc(doc(database, "users",user.uid), {
                name: name,
                email: email,
                phone:phone,
                role: role,
                timestamp: Date.now() ,
               
            });
            await signOut(auth);
        // toast.warning("Please verify your email before logging in.");
        navigate("/login");


        } catch (error) {
            console.log('Registration error:', error.code,error.message);
            toast.error('Failed to register. Please check your details.');
        }
    };

    return (
        <div>
           
            {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-10'>
                <div>
                 
                </div>
                
                <div className="register-page my-auto">
                    <form onSubmit={handleRegister} className='flex flex-col justify-start'>
                        <h2 className='font-bold text-2xl md:text-3xl mb-5'>Create an Account</h2>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className='rounded-lg p-5 md:w-3/4 border-0 border-l-4 border-[#5a3a01] mt-3 focus:ring-0  focus:border-[#5a3a01] focus:outline-none'

                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className='rounded-lg p-5 md:w-3/4 border-0 border-l-4 border-[#5a3a01] mt-3 focus:ring-0  focus:border-[#5a3a01] focus:outline-none'

                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className='rounded-lg p-5 md:w-3/4 border-0 border-l-4 border-[#5a3a01] mt-3 focus:ring-0  focus:border-[#5a3a01] focus:outline-none'

                        />
                        <input type="tel" id="phone" name="phone" pattern="\[0-9\s\-\(\)]*" maxLength={10} minLength={10} className='rounded-lg p-5 md:w-3/4 border-0 border-l-4 border-[#5a3a01] mt-3 focus:ring-0  focus:border-[#5a3a01] focus:outline-none'
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         required placeholder="Enter your Phone Number"/>

                            <button type="submit" className='bg-[#5a3a01] rounded-lg w-full md:w-3/4 mt-5 h-10 text-white'>Register</button>
                            <div className=' mt-3'>
                                <Link to='/login' className='text-yellow-800 underline text-xs text-center md:text-base md:text-left'>already have an account?Signin</Link></div>

                    </form>

                    <ToastContainer autoClose={5000}/>
                </div>
            </div> */}
            <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0] p-4">
  <div className="w-full max-w-4xl">
    <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-100">
      {/* Left Side - Image/Decoration */}
      <div className="hidden md:block bg-gradient-to-b from-amber-100 to-amber-50 relative">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-amber-800 mb-3">Welcome to CapeNaturals</h2>
            <p className="text-amber-700">Join our community of honey and spice lovers</p>
          </div>
        </div>
      </div>
      
      {/* Right Side - Registration Form */}
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Create Your Account</h1>
          <p className="text-gray-600 text-sm">Join CapeNaturals today</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white placeholder-gray-400 text-gray-700 transition duration-200"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </div>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white placeholder-gray-400 text-gray-700 transition duration-200"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white placeholder-gray-400 text-gray-700 transition duration-200"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <input
                type="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                minLength={10}
                placeholder="1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white placeholder-gray-400 text-gray-700 transition duration-200"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200 mt-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Register
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-amber-600 hover:text-amber-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
    <ToastContainer autoClose={5000} />
  </div>
</div>
        </div >
    )
}

export default RegisterationPage