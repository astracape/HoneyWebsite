import {  signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth, database } from '../FirebaseConfig';
import { get, ref } from 'firebase/database';
import img from "../assets/bee1.png"


function Loginpage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
       
    
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

           

        
            const userRoleRef = ref(database, `users/${user.uid}`);
            const snapshot = await get(userRoleRef);
            const userData= snapshot.val();

            if (userData && userData.role === "admin") {
                toast.success("Welcome Admin!");
                console.log("success",email)
                console.log(userData.role)
                navigate("/dashboard"); 
            } else if (userData && userData.role === "user") {
                toast.success("Welcome User!");
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                toast.error("Role not assigned. Please contact support.");
                console.log("error")
            }
        } catch (error) {
            console.log(error)
            toast.error("Login failed. Please check your email and password.");
        }
    };


  return (
    <div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-10'>
                <div>
                    <img src={img} className='opacity-50'></img>
                </div>
                <div className=' my-auto'>
                    <form onSubmit={handleLogin}>
                        <h1 className='font-bold text-2xl md:text-3xl mb-5'>Login your account</h1>
                        <input
                         type='email' 
                         name='email' 
                         placeholder='Email'
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className='rounded-lg p-5 md:w-3/4 border-0 border-l-4 border-[#5a3a01] mt-3 focus:ring-0  focus:border-[#5a3a01] focus:outline-none' />
                        {/* <input type='password' name='password' placeholder='Password' className='rounded-lg bg-gray-200 w-full border-0 shadow-xl mt-3' /> */}
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
                    <div className=' mt-3'>
                        <a href='/reg' className='text-yellow-800 underline text-xs text-center md:text-base md:text-left'>Don't have an account?Signup</a></div>
                </div>
            </div>
            {/* <ToastContainer/> */}
            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
    </div>
  )
}

export default Loginpage