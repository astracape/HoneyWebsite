import React from 'react'
import img from "../../assets/bg2.png"
import bee from "../../assets/image5.png"
import bee1 from "../../assets/bee123.png"
import img2 from "../../assets/Untitled.png"
import honeyspice from "../../assets/image6.png"
import img3 from "../../assets/bee-fly-dotted-route-pattern-vector_638603-453.jpg"

import { GiCogLock, GiHoneyJar } from "react-icons/gi";
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
                        Our story began started with a few hives nestled in our family farm. What began as a passion for beekeeping quickly grew into a commitment to sharing the pure, raw honey that bees so beautifully create. We have grown to share pure, raw, and natural Western Ghats honey with the world.
                            Harvested from the vast rubber farms and forest regions of Kanyakumari, our honey is unprocessed, cold-spun, and coarsely filtered to maintain the pure taste and natural benefits.
                        </p>
                        <p className="text-lg mb-4">We are passionate about producing and promoting farm-fresh honey and spices.</p>
                        <p className="text-lg mb-4 italic">"From my home in the Western Ghats, India, We arrange for the delivery of quality multifloral and rubber honey to customers all over the world."</p>
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
                        <h2 className="text-4xl font-bold mb-8 text-yellow-600">Our Products</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                            <div className='p-3'>
                                <div className="p-6   shadow-md rounded-se-3xl border-2 border-yellow-600 hover:shadow-xl transform hover:-translate-y-1 transition-all">
                                    <h3 className="text-2xl font-bold mb-4 text-yellow-600">Honey</h3>
                                    <ul className="space-y-4">
                                        {["Wild Honey", "Wildflower Honey", "Bulk Honey", "Retail Honey"].map(
                                            (item, index) => (
                                                <li key={index} className="flex items-center gap-3">
                                                    <GiHoneyJar className="text-yellow-600 text-2xl" />
                                                    <span className="text-gray-800 font-semibold">{item}</span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <img src={honeyspice} alt="Honey and Spices" className="rounded-full w-60 h-60 border-4  border-yellow-700" />
                            </div>
                            <div className='p-3'>
                                <div className="p-6 shadow-md rounded-es-3xl border-2 border-yellow-600 hover:shadow-xl transform hover:-translate-y-1 transition-all">
                                    <h3 className="text-2xl font-bold mb-4 text-yellow-600">Spices</h3>
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
                    </div>
                    {/* </section> */}

                    <section className="py-16 px-5 bg-yellow-600 text-black text-center rounded-t-3xl mt-16">
                        <h2 className="text-3xl font-bold mb-4">Want to Learn More About Us?</h2>
                        <p className="mb-6">Feel free to reach out for any questions, queries, or collaboration ideas.</p>
                        <div className=''>
                            <input type="email" placeholder="Enter your email" className="px-4 py-3 rounded-lg text-gray-900  mb-4 focus:ring-0 w-44" /></div>
                        <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 my-auto">Contact Us</button>
                    </section>
                </section>


                <section className="relative py-16 bg-gradient-to-r from-yellow-50 to-yellow-100 ">
                    <div className="absolute inset-0 bg-cover bg-center opacity-5 " style={{ backgroundImage: `url(${img3})` }}></div>

                    <div className="text-center mb-14">
                        {/* <img src={bee1} alt="Bee" className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-4" /> */}
                        <h2 className="text-3xl md:text-5xl font-bold text-black underline decoration-yellow-500">
                            Bee Facts
                        </h2>
                    </div>


                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">

                        <div className="space-y-8">

                            <div className="relative  p-6 text-center transform hover:scale-105 transition">
                                <div className="w-16 h-16 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                    👀
                                </div>
                                <h3 className="text-xl font-semibold text-black mb-2">Bees Have 5 Eyes</h3>
                                <p className="text-sm text-gray-700">Bees have two large compound eyes and three small simple eyes.</p>
                            </div>


                            <div className="relative   p-6 text-center transform hover:scale-105 transition">
                                <div className="w-16 h-16 bg-black text-yellow-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                    ⏳
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Around for 30 Million Years</h3>
                                <p className="text-sm">Bees are ancient creatures, existing long before humans.</p>
                            </div>


                            <div className="relative p-6 text-center transform hover:scale-105 transition">
                                <div className="w-16 h-16 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                    ✈️
                                </div>
                                <h3 className="text-xl font-semibold text-black mb-2">Flying Speed</h3>
                                <p className="text-sm text-gray-700">Bees can fly up to 32 km per hour.</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <img
                                src={bee1}
                                alt="Bee"
                                className="w-64 h-64 md:w-80 md:h-80 rounded-full shadow-lg border-4 border-yellow-300"
                            />
                        </div>


                        <div className="space-y-8">

                            <div className="relative rounded-xl p-6 text-center transform hover:scale-105 transition">
                                <div className="w-16 h-16 bg-black text-yellow-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                    🐝
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Queen's Egg Laying</h3>
                                <p className="text-sm">Queen bees can lay up to 1000 eggs per day.</p>
                            </div>


                            <div className="relative  p-6 text-center transform hover:scale-105 transition">
                                <div className="w-16 h-16 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                    ⚙️
                                </div>
                                <h3 className="text-xl font-semibold text-black mb-2">Worker Bees</h3>
                                <p className="text-sm text-gray-700">Female bees in the hive, except the queen, are known as worker bees.</p>
                            </div>


                            <div className="relative rounded-xl p-6 text-center transform hover:scale-105 transition">
                                <div className="w-16 h-16 bg-black text-yellow-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                    🤝
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Collective Work</h3>
                                <p className="text-sm">Bees work tirelessly for the collective good of the colony.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* <img src={about}></img> */}

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