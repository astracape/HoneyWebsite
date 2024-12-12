import React from 'react'
import img1 from '../assets/Polygon 4.png'
import img2 from '../assets/Polygon 5.png'
import img3 from '../assets/Polygon 6.png'
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa6";


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
                            <p>Location: Western Ghats, India</p>
                            <p>Phone: +91 9089786756</p>
                            <p>Email: honey@gmail.com</p>
                        </div>
                    </div>


                    <div>
                        <h2 className="font-semibold text-lg mb-3 underline">Quick Links</h2>
                        <ul className="space-y-2">
                            <li><a href="/" className="hover:text-yellow-400">Home</a></li>
                            <li><a href="/productpage" className="hover:text-yellow-400">Our products</a></li>
                            <li><a href="/aboutus" className="hover:text-yellow-400">About us</a></li>
                            <li><a href="/blog" className="hover:text-yellow-400">Blogs</a></li>
                        </ul>
                    </div>


                    <div>
                        <h2 className="font-semibold text-lg mb-3 underline">Our Products</h2>
                        <ul className="space-y-2">
                            <li><a href="" className="hover:text-yellow-400">Wild Honey</a></li>
                            <li><a href="" className="hover:text-yellow-400">Western Ghats Spices</a></li>
                            <li><a href="" className="hover:text-yellow-400">Oils</a></li>
                            <li><a href="" className="hover:text-yellow-400">Coconut</a></li>


                        </ul>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="font-semibold text-lg mb-3 underline">Follow Us</h2>
                        <div className="flex justify-center lg:justify-start gap-4">
                            <FaInstagram className="w-6 h-6 hover:text-yellow-400" />
                            <FaTwitter className="w-6 h-6 hover:text-yellow-400" />
                            <FaFacebook className="w-6 h-6 hover:text-yellow-400" />
                        </div>
                    </div>
                </div>


                <div className="container mx-auto mt-10 px-5 flex flex-col md:flex-row items-center justify-between">
                    <p>&copy; 2024 Honey Business. All Rights Reserved.</p>
                    <div className="flex mt-5 md:mt-0 gap-4">
                        <img src={img1} alt="Decorative Shape" className="w-12 h-12" />
                        <img src={img2} alt="Decorative Shape" className="w-12 h-12" />
                        <img src={img3} alt="Decorative Shape" className="w-12 h-12" />
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Footer