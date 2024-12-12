import React from 'react'
import img from "../assets/bg2.png"
import bee from "../assets/image5.png"
import bee1 from "../assets/—Pngtree—flying bee beautiful image of_15763549.png"
import img2 from "../assets/Untitled.png"
import honeyspice from "../assets/image6.png"
import img1 from "../assets/—Pngtree—yellow honey dripping decorative border_4120014.png"

import { GiCogLock } from "react-icons/gi";
function AboutUs() {
    return (
        <div>





            <div className="">
                <section className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}>
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="relative flex items-center justify-center h-full">
                        <h1 className="text-white text-5xl font-bold">About Us</h1>
                    </div>
                </section>
                <section className="relative p-10 lg:py-20  bg-gray-100 text-center">
                    <div className="absolute inset-0 bg-cover bg-center opacity-25 " style={{ backgroundImage: `url(${img2})` }}></div>
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold mb-6 text-yellow-700">Our Story</h2>
                        <p className="text-lg mb-4">
                            Our story began with a hobby hive in our family garden. We have grown to share pure, raw, and natural Western Ghats honey with the world.
                            Harvested from the vast rubber farms and forest regions of Kanyakumari, our honey is unprocessed, cold-spun, and coarsely filtered to maintain the pure taste and natural benefits.
                        </p>
                        <p className="text-lg mb-4">We are passionate about producing and promoting farm-fresh honey and spices.</p>
                        <p className="text-lg mb-4 italic">"From my home in the Western Ghats, India, I arrange for the delivery of quality multifloral and rubber honey to customers all over the world."</p>
                    </div>
                </section>

                <section className="py-16 bg-white text-center">
                    <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 p-6">
                        <div className="flex items-center justify-center">
                            <img src={bee} alt="Bee" className="md:w-3/4 md:h-full object-cover rounded-lg border-b-4 border-green-700" />
                        </div>
                        <div className="flex flex-col justify-center items-center space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Quality Products</h3>
                                <p>We believe in offering honey and spices that are as pure as nature intended, free from additives and preservatives.</p>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Sustainability</h3>
                                <p>Our products are sourced responsibly, ensuring that our practices help protect the planet.</p>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Customer Trust</h3>
                                <p>We work hard to earn the trust of our customers by offering transparency and maintaining high standards.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16 bg-yellow-100">
                    <div className="container mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-8 text-yellow-700">Our Products</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                            <div className="p-6 bg-white border border-b-4 border-yellow-700 shadow-md rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                                <h3 className="text-2xl font-bold mb-4 text-yellow-700">Honey</h3>
                                <ul className="space-y-4">
                                    {["Wild Honey", "Wildflower Honey", "Bulk Honey", "Retail Honey"].map(
                                        (item, index) => (
                                            <li key={index} className="flex items-center gap-3">
                                                <GiCogLock className="text-yellow-600 text-2xl" />
                                                <span className="text-gray-800 font-semibold">{item}</span>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                            <div className="flex justify-center">
                                <img src={honeyspice} alt="Honey and Spices" className="rounded-full w-60 h-60 border-4  border-yellow-700" />
                            </div>
                            <div className="p-6 bg-white border border-b-4 border-yellow-700 shadow-md rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                                <h3 className="text-2xl font-bold mb-4 text-yellow-700">Spices</h3>
                                <ul className="space-y-4">
                                    {["Nutmeg", "Tamarind", "Cloves", "Pepper"].map((item, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <GiCogLock className="text-yellow-600 text-2xl" />
                                            <span className="text-gray-800 font-semibold">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                {/* </section> */}

                <section className="py-16 px-5 bg-yellow-700 text-black text-center rounded-t-3xl mt-16">
                    <h2 className="text-3xl font-bold mb-4">Want to Learn More About Us?</h2>
                    <p className="mb-6">Feel free to reach out for any questions, queries, or collaboration ideas.</p>
                    <div className=''>
                        <input type="email" placeholder="Enter your email" className="px-4 py-3 rounded-lg text-gray-900  mb-4 focus:ring-0 w-44" /></div>
                    <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600">Contact Us</button>
                </section>
                </section>

                <section className="py-16  text-center">
                    <div className='flex justify-center items-center'>
                        <img src={bee1} className='w-44 h-44'></img>
                        <h2 className="text-2xl md:text-4xl font-bold mb-8 text-black underline">Bee Facts</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-3/4 mx-auto">
                        <div className="p-6 bg-black text-white shadow-lg rounded-lg">
                            <h3 className="text-xl font-semibold mb-2">Bees Have 5 Eyes</h3>
                            <p>Bees have two large compound eyes and three small simple eyes.</p>
                        </div>
                        <div className="p-6 bg-yellow-700 text-black shadow-lg rounded-lg">
                            <h3 className="text-xl font-semibold mb-2">Around for 30 Million Years</h3>
                            <p>Bees are ancient creatures, existing long before humans.</p>
                        </div>
                        <div className="p-6 bg-black text-white shadow-lg rounded-lg">
                            <h3 className="text-xl font-semibold mb-2">Flying Speed</h3>
                            <p>Bees can fly up to 32 km per hour.</p>
                        </div>
                        <div className="p-6 bg-yellow-700 text-black shadow-lg rounded-lg">
                            <h3 className="text-xl font-semibold mb-2">Queen's Egg Laying</h3>
                            <p>Queen bees can lay up to 1000 eggs per day.</p>
                        </div>
                        <div className="p-6 bg-black text-white shadow-lg rounded-lg">
                            <h3 className="text-xl font-semibold mb-2">Worker Bees</h3>
                            <p>Female bees in the hive, except the queen, are known as worker bees.</p>
                        </div>
                        <div className="p-6 bg-yellow-700 text-black shadow-lg rounded-lg">
                            <h3 className="text-xl font-semibold mb-2">Collective Work</h3>
                            <p>Bees work tirelessly for the collective good of the colony.</p>
                        </div>
                    </div>
                </section>

                <section className="py-16 bg-yellow-100 text-black text-center">
                    <h2 className="text-4xl font-bold mb-6">Join Us in Our Journey!</h2>
                    <p className="text-lg mb-8 p-3">Experience the best of honey and spices today.</p>
                    <a href="/productpage" className="bg-white text-black px-6 py-3 rounded-full border-4 border-black font-bold hover:bg-yellow-500 transition">Shop Now</a>
                </section>
            </div>
        </div>

    )
}

export default AboutUs