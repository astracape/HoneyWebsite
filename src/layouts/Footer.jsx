import React from 'react'
import img1 from '../assets/Polygon 4.png'
import img2 from '../assets/Polygon 5.png'
import img3 from '../assets/Polygon 6.png'
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa6";
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <div>
            <footer className="bg-black text-white py-10">
                <div className='flex justify-center'>
                    <h2 className="font-semibold text-xl underline lg:text-3xl p-5 text-gradient-to-r from-[#f3d275] to-[#8B4513]">Sourced from the finest Western Ghats</h2>
                </div>
                <div className="container mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-4 px-5">

                    <div>
                        <h2 className="font-semibold text-lg mb-3 underline">Contact Us</h2>

                        <div className=" space-y-2 mt-5">
                            <p>Location: 26/57E ,  Palliyadi, Kanyakumari District. TN 629169</p>
                            <p>Phone: +918015396203</p>
                            <p>Email: info.capztone@gmail.com</p>
                        </div>
                    </div>


                    <div>
                        <h2 className="font-semibold text-lg mb-3 underline">Quick Links</h2>
                        <ul className="space-y-2">
                            <li><Link to="/" className="hover:text-yellow-400">Home</Link></li>
                            <li><Link to="/productpage" className="hover:text-yellow-400">Our products</Link></li>
                            <li><Link to="/aboutus" className="hover:text-yellow-400">About us</Link></li>
                            <li><Link to="/blog" className="hover:text-yellow-400">Blogs</Link></li>
                            <li><Link to="/oh" className="hover:text-yellow-400">Order History</Link></li>

                        </ul>
                    </div>


                    <div>
                        <h2 className="font-semibold text-lg mb-3 underline">Our Products</h2>
                        <ul className="space-y-2">
                            <li><Link to="/productpage" className="hover:text-yellow-400">Wild Honey</Link></li>
                            <li><Link to="/productpage" className="hover:text-yellow-400">Western Ghats Spices</Link></li>
                            <li><Link to="/productpage" className="hover:text-yellow-400">Oils</Link></li>
                            <li><Link to="/productpage" className="hover:text-yellow-400">Coconut</Link></li>


                        </ul>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="font-semibold text-lg mb-3 underline">Follow Us</h2>
                        <div className="flex justify-center lg:justify-start gap-4">
                            <Link to='https://www.instagram.com/cape_naturals/'><FaInstagram className="w-6 h-6 hover:text-yellow-400" /></Link>
                            <FaTwitter className="w-6 h-6 hover:text-yellow-400" />
                            <FaFacebook className="w-6 h-6 hover:text-yellow-400" />
                        </div>
                        <div className="mt-5 flex gap-4 justify-center lg:justify-start">

                            <Link to="https://www.instagram.com/p/DFkN530ISpo/" target="_blank" rel="noopener noreferrer">
                                <img src="https://firebasestorage.googleapis.com/v0/b/honey-8e04f.appspot.com/o/toolzin.com-DFkN530ISpo-1.jpg?alt=media&token=128f5236-96be-4350-b031-5c2c199d28ff" alt="Instagram Reel" className="rounded-lg w-20 h-24 object-cover hover:scale-105 transition-transform" />
                            </Link>
                            <Link to="https://www.instagram.com/p/DFnKw8by0OI/" target="_blank" rel="noopener noreferrer">
                                <img src="https://firebasestorage.googleapis.com/v0/b/honey-8e04f.appspot.com/o/toolzin.com-DFnKw8by0OI-1.jpg?alt=media&token=0f7ff118-b56a-4f91-b191-d1ca0a9cf5b1" alt="Instagram Reel" className="rounded-lg w-20 h-24 object-cover hover:scale-105 transition-transform" />
                            </Link>
                        </div>

                    </div>
                </div>


                <div className="container mx-auto mt-10 px-5 text-center text-xs md:text-base md:text-right">
                    <p>&copy; 2024 Honey Business. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    )
}

export default Footer