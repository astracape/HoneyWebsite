import React, { useState } from 'react'
import { auth, database } from '../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import img from "../assets/bee1.png"

function RegisterationPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

 

    const handleRegister = async (e) => {
        e.preventDefault();

        // firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

           
    
            const isAdminEmail = email === "admin123@gmail.com"; 
            const role = isAdminEmail ? "admin" : "user";
    
            await set(ref(database, `users/${user.uid}`), {
                name: name,
                email: email,
                role: role
            });
    
            toast.success('Registration successful! Redirecting to login.');
            setTimeout(() => {
                        navigate('/');
                    }, 3000);
            
        } catch (error) {
            console.log('Registration error:', error);
            toast.error('Failed to register. Please check your details.');
        }
    };
    
    return (
        <div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-10'>
            <div>
                    <img src={img}></img>
                </div>
                <div className="register-page my-auto">
                    <form onSubmit={handleRegister}>
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
                        <button type="submit" className='bg-[#5a3a01] rounded-lg w-full md:w-3/4 mt-5 h-10 text-white'>Register</button>
                        <div className=' mt-3'>
                        <a href='/login' className='text-yellow-800 underline text-xs text-center md:text-base md:text-left'>already have an account?Signin</a></div>
                
                    </form>
                    
                    <ToastContainer />
                </div>
            </div>
        </div >
    )
}

export default RegisterationPage