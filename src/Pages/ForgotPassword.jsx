import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react'
import 'react-toastify/dist/ReactToastify.css';
import {  Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import img from "../assets/bee1.png";
import { auth } from '../FirebaseConfig';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isResetLinkSent, setIsResetLinkSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const handleSendResetLink = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            setIsResetLinkSent(true);
            toast.success('Password reset link sent to your email. Please check your email');
        } catch (error) {
            toast.error('Failed to send reset link. Please check your email.');
        }
    };

   
    return (
        <div>
             <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-10'>
            <div>
                <img src={img} alt="Bee" className='opacity-50' />
            </div>
            <div className='my-auto'>
                <form onSubmit={handleSendResetLink}>
                    <h1 className='font-bold text-2xl md:text-3xl mb-5'>Forgot Password</h1>
                    <p className="text-md mb-5">Enter your email address to receive a password reset link.</p>
                    <input
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='rounded-lg p-5 md:w-3/4 border-0 border-l-4 border-[#5a3a01] mt-3 focus:ring-0 focus:border-[#5a3a01] focus:outline-none'
                        required
                    />
                    <button
                        type="submit"
                        className='bg-[#5a3a01] rounded-lg w-full md:w-3/4 mt-5 h-10 text-white'
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                <div className='mt-3'>
                    <Link to='/login' className='text-yellow-800 underline text-xs text-center md:text-base md:text-left'>
                        Back to Login
                    </Link>
                </div>
            </div>
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
        
        </div>
    )
}

export default ForgotPassword