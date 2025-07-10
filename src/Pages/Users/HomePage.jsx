import React, { useEffect, useState } from 'react'
import img from '../../assets/Rectangle 15.png'
import img1 from '../../assets/hstory.png'
import wild from '../../assets/wild.png'
import bee from '../../assets/bee.png'
import img4 from "../../assets/western.png"
import img5 from "../../assets/Rectangle 59.png"
import spices from "../../assets/Group 68.png"
import tamarind from "../../assets/tamarind.jpg"
import cloves from "../../assets/cloves.png"
import nutmeg from "../../assets/nutmeg.png"
import pepper from "../../assets/Rectangle 43.png"
import pep from "../../assets/about.png"
import im52 from "../../assets/57.png"
import retail from "../../assets/retail.png"
import certificate1 from "../../assets/ndli-logo.png"
import certificate from "../../assets/Fssai-Logo-PNG-Transparent.png"
import bulk from "../../assets/bulk.png"
import { FaEnvira } from "react-icons/fa";
import { FaHouse, FaBoxOpen } from "react-icons/fa6";
import { get, ref } from 'firebase/database'
import { database } from '../../FirebaseConfig'
import { Link } from "react-router-dom"
import { collection, doc, getDocs } from 'firebase/firestore'
import { toast } from 'react-toastify'

function HomePage() {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const blogsRef = collection(database, 'blogs');
                const snapshot = await getDocs(blogsRef);

                if (!snapshot.empty) {
                    const blogArray = snapshot.docs.map(doc => ({
                        id: doc.id, // Get document ID
                        ...doc.data(), // Get document data
                    }));


                    const latestBlogs = blogArray.slice(-2); // Get the last two blogs
                    setBlogs(latestBlogs);
                }
            } catch (error) {
                toast.error("Error fetching blogs")
            }
        };

        fetchBlogs();
    }, []);
    return (
        

            <div className='overflow-x-hidden '>


                <div className="relative h-screen bg-cover  bg-center p-0 m-0" style={{ backgroundImage: `url(${img})` }}>
                    <div className="absolute inset-0 bg-black opacity-50"></div>


                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center animate-slideUp" data-aos-once="true">
                        <h1 className="text-white text-2xl font-bold md:text-5xl lg:p-8  mt-16 font-serif " data-aos="zoom-in">
                            Drizzle the Goodness of Nature's Best Honey
                        </h1>
                        <p className=" text-white text-base md:text-xl">
                            Pure, Raw, and Unfiltered Honey Direct from Farms
                        </p>

                        <Link to="/productpage" className="mt-16 bg-brandyellow hover:scale-95 md:w-96 w-48 h-8  md:h-16 text-black font-bold rounded-lg shadow-lg transition duration-300 flex items-center justify-center text-base md:text-2xl">
                            Shop Now
                        </Link>

                    </div>
                </div>
                <section className='grid grid-cols lg:grid-cols-2 relative border-b-8 border-dotted border-brandyellow  md:p-10 bg-yellow-100 ' data-aos="fade-left">
                    <div>
                        <div className='mt-10'>
                            <img src={img1} className='mx-auto p-5'></img>
                        </div>

                    </div>

                    <div className='p-5 md:p-10 my-auto'>
                        <p className='text-4xl font-bold bebas-neue-regular'>Honey Story</p>
                        <p className='text-base mt-5 md:mr-10'>We strive to bring you pure, raw honey crafted by nature’s finest workers—bees! Sourced from local beekeepers who practice sustainable farming,
                             our honey is 100% natural, unfiltered, and packed with nutrients. With no additives or processing, we ensure you experience the true flavour and health benefits of honey, just as nature intended.
                              We believe in delivering the highest quality product that’s free of additives,
                            preserving the true taste and benefits of honey.</p>
                        <p className='italic mt-4 font-semibold'> "From our hives to your home, every jar reflects our commitment to purity and sustainability."</p>
                    </div>
                </section>

                <section className=" flex flex-col justify-center items-center w-full md:p-5 mt-5 ">
                    {/* <div className="container mx-auto"> */}
                    <div className='grid grid-cols-1 md:grid-cols-3'>
                        <div>
                            <img src={bee} className='w-36 h-36 md:ml-40 hidden md:block '></img>
                        </div>
                        <div>
                            <h1 className='text-2xl mb-5 font-bold  text-center md:text-3xl lg:text-4xl md:mt-14'>Featured Products</h1>
                        </div>
                        <div>
                            <img src={bee} className='md:w-36 md:h-36 mb-5 transform -scale-x-100 hidden md:block'></img>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                        <div className="group bg-white border rounded-lg shadow-md overflow-hidden border-brandyellow transition-transform transform hover:scale-105">
                            <img src={pep} alt="Wildflower Honey" className="w-full h-48 object-cover md:p-3" />
                            <div className="p-2">
                                <h4 className="text-xl font-semibold mb-2">Multi-floral Honey</h4>
                            </div>
                        </div>
                        <div className="group bg-white border rounded-lg shadow-md overflow-hidden border-brandyellow transition-transform transform hover:scale-105">
                            <img src={wild} alt="Wildflower Honey" className="w-full h-48 object-cover md:p-3" />
                            <div className="p-2">
                                <h4 className="text-xl font-semibold mb-2">Wild Honey</h4>
                            </div>
                        </div>
                        <div className="group bg-white border rounded-lg shadow-md overflow-hidden border-brandyellow transition-transform transform hover:scale-105">
                            <img src={bulk} alt="Wildflower Honey" className="w-full h-48 object-cover md:p-3" />
                            <div className="p-2">
                                <h4 className="text-xl font-semibold mb-2">Bulk Honey</h4>
                            </div>
                        </div>
                        <div className="group bg-white border rounded-lg shadow-md overflow-hidden border-brandyellow transition-transform transform hover:scale-105">
                            <img src={retail} alt="Wildflower Honey" className="w-full h-48 object-cover md:p-3" />
                            <div className="p-2">
                                <h4 className="text-xl font-semibold mb-2">Retail Honey</h4>
                            </div>
                        </div>
                    </div>
                    <Link to="/productpage" className="mt-8 px-6 py-3 bg-[#bf8a02]  mx-auto text-white rounded-lg text-lg hover:scale-x-95">Explore Products</Link>

                    {/* </div> */}
                </section>

                <section className="relative h-96 bg-cover bg-center mt-5" style={{ backgroundImage: `url(${img4})` }}>


                    <div className="absolute inset-0 bg-gradient-to-r from-black opacity-100">

                    </div>
                    <div className="relative z-10 md:p-8 text-white">
                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold md:p-5 p-3">Western Ghats Spices</h1>
                        <p className='md:w-2/4 p-5 text-base md:text-sm xl:text-xl'>Discover the rich aroma and flavor of spices grown in the pristine Western Ghats. From the misty hills to your kitchen, each spice is handpicked to deliver the finest essence of nature's bounty.</p>
                        <div className='p-5'>
                            <Link to="/productpage" className="md:mt-8 p-3 bg-red-800 hover:bg-red-500 text-white rounded-full text-lg">Shop Now</Link>
                        </div>
                    </div>

                </section >

                <section className="relative h-1/2 bg-cover bg-center p-5" style={{ backgroundImage: `url(${img5})` }}>
                    <div className='grid grid-cols-1 md:grid-cols-2'>
                        <div>
                            <img src={spices} className='mx-auto my-auto' data-aos="rotate"
                                data-aos-duration="1500">
                            </img>
                        </div>
                        <div className='my-auto md:p-10 ' data-aos="flip-left" data-aos-duration="10">
                            <h1 className='md:text-right text-2xl md:text-4xl font-bold bebas-neue-regular'>Spice Story</h1>
                            <p className='mt-5 md:text-right'>Nestled in the misty hills of the Western Ghats, our spices are a testament to the ancient heritage of this fertile region. Known for their intense aroma and unmatched flavor, these spices have been cultivated using traditional methods, passed down through generations. From the tangy Tamarind to the bold Pepper, the sweet warmth of Nutmeg, and the aromatic Cloves, every spice brings the essence of the Western Ghats to your kitchen.</p>
                        </div>

                    </div>

                </section>
                <div className='mx-auto  text-font text-center bg-black' >
                    <h1 className='reggae-one-regular text-4xl p-7 text-white'>---Spices---</h1>
                    <div className='mx-auto items-center justify-center md:p-3'>
                        <div className='grid grid-cols-1 md:grid-cols-2 justify-center items-center mx-auto gap-5'>
                            <div>
                                <div className="flex justify-center py-8 mt-16  md:mt-0 ">

                                    <div className="relative bg-gradient-to-br from-red-900 to-red-500 text-white w-80 rounded-lg shadow-xl shadow-red-500/50 p-6 hover:scale-105 transition-transform duration-300 ease-out">

                                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-36 h-36 rounded-full overflow-hidden drop-shadow-2xl border-4 border-white ">
                                            <img className="object-cover w-full h-full hover:animate-spin" src={tamarind} alt="Tamarind" />
                                        </div>


                                        <div className="mt-16 text-center">
                                            <h2 className="font-bold text-lg drop-shadow-[0_1px_10px_rgba(255,255,255,0.8)]">TAMARIND</h2>
                                            <p className="font-semibold mt-2">Tangy and versatile, Tamarind adds a unique flavor to traditional dishes.</p>
                                            <p className="text-sm mt-4">
                                                Harvested from the heart of the Western Ghats, Tamarind is known for its bold, sour-sweet taste.
                                                It's an essential ingredient in many South Indian curries, chutneys, and sauces. Whether used in soups or desserts, it brings a distinctive depth of flavor to every dish.
                                            </p>
                                        </div>

                                    </div>
                                </div>

                            </div>
                            <div>
                                <div className="flex justify-center py-8">

                                    <div className="relative bg-gradient-to-br from-red-900 to-red-500 text-white w-80 rounded-lg shadow-xl drop-shadow-2xl shadow-red-500/50  p-6 hover:scale-105 transition-transform duration-300 ease-out">

                                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-36 h-36 rounded-full overflow-hidden shadow-lg border-4 border-white">
                                            <img className="object-cover w-full h-full hover:animate-spin" src={cloves} alt="Tamarind" />
                                        </div>


                                        <div className="mt-16 text-center">
                                            <h2 className="font-bold text-lg drop-shadow-[0_1px_10px_rgba(255,255,255,0.8)]">CLOVES</h2>
                                            <p className="font-semibold mt-2">Aromatic and strong, Cloves bring depth to curries and baked goods.</p>
                                            <p className="text-sm mt-4">
                                                Cloves grown in the Western Ghats are intensely aromatic, with a warm, spicy-sweet flavor. Each clove is sun-dried to preserve its rich oils, making it a powerful ingredient in spice blends like garam masala. Beyond culinary uses, cloves are known for their medicinal properties.
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-center py-8 mt-5">

                                    <div className="relative hover:scale-105 bg-gradient-to-br from-red-900 to-red-500 text-white w-80 rounded-lg drop-shadow-2xl shadow-xl shadow-red-500/50 p-6 transition-transform duration-300 ease-out">

                                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-36 h-36 rounded-full overflow-hidden shadow-lg border-4 border-white">
                                            <img className="object-cover w-full h-full hover:animate-spin" src={pepper} alt="Tamarind" />
                                        </div>


                                        <div className="mt-16 text-center">
                                            <h2 className="font-bold text-lg drop-shadow-[0_1px_10px_rgba(255,255,255,0.8)]">PEPPER</h2>
                                            <p className="font-semibold mt-2">Bold and pungent, our Pepper is carefully handpicked for quality and heat.</p>
                                            <p className="text-sm mt-4">
                                                The Western Ghats are home to some of the world’s finest black pepper, revered for its sharp, spicy kick. Grown in the shade of dense forests, this pepper is sun-dried to perfection, ensuring every peppercorn bursts with intense heat and flavor. It’s a staple in kitchens worldwide, elevating both savory and grilled dishes.
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-center py-8  mt-5">

                                    <div className="relative bg-gradient-to-br from-red-900 to-red-500 text-white w-80 rounded-lg shadow-xl shadow-red-500/50 p-6 hover:scale-105 transition-transform duration-300 ease-out">

                                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full overflow-hidden drop-shadow-2xl border-4 border-white transition-transform duration-500 hover:rotate-12">
                                            <img className="object-cover w-full h-full hover:animate-spin" src={nutmeg} alt="Tamarind" />
                                        </div>


                                        <div className="mt-16 text-center">
                                            <h2 className="font-bold text-lg drop-shadow-[0_1px_10px_rgba(255,255,255,0.8)]">NUTMEG</h2>
                                            <p className="font-semibold mt-2">Warm and slightly sweet, Nutmeg is perfect for both savory and sweet dishes.</p>
                                            <p className="text-sm mt-4">
                                                Grown high in the hills, Nutmeg from the Western Ghats has a distinct sweetness with a subtle warmth. Used in both savory dishes like creamy sauces and sweet recipes like cakes and pies, its aromatic flavor adds richness. Nutmeg is also prized for its potential health benefits, including aiding digestion and improving sleep.
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className='flex justify-center mt-8 p-5'>
                            <Link to="/productpage" className="px-6 py-4 bg-gradient-to-br from-red-900 to-red-500 text-white rounded-lg text-lg">
                                Explore Spices
                            </Link>
                        </div>
                    </div>
                </div>

                <section className="w-full py-12 bg-[#f3d17554] border-t-8 border border-red-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                        <h1 className="text-center text-3xl sm:text-4xl font-extrabold mb-12 text-gray-900 underline">Latest From Blogs</h1>


                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:p-20">

                            {blogs.map((blog) => (
                                <div key={blog.id} className="flex md:h-96 overflow-hidden md:p-5 p-2 transition-transform duration-300 hover:scale-105">

                                    <img
                                        src={blog.image}

                                        className="w-1/2 h-72 object-cover border-l-4 border-yellow-700 p-3 rounded-xl"
                                    />
                                    <div className=" w-full flex flex-col">
                                        <div className="text-gray-500 text-sm mb-4 self-start">
                                            <span> {new Date(blog.date).toLocaleDateString("en-GB")}</span>
                                        </div>
                                        <div className="text-gray-700 text-base mb-4 line-clamp-3">
                                            <div dangerouslySetInnerHTML={{ __html: blog.description }} />
                                        </div>
                                        <Link
                                            to={`/fullblog/${blog.id}`}
                                            className="text-yellow-600 font-semibold hover:underline self-start"
                                        >
                                            Read More
                                        </Link>
                                    </div>
                                </div>
                            ))}



                        </div>
                        <div className='flex justify-end relative group'>
                            <Link to='/blog' className='underline text-right text-red-700' >View all</Link> <span className="absolute bottom-full text-sm text-gray-500 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                ! Click to view all blogs
                            </span>
                        </div>
                    </div>
                </section>


                <section className=" flex flex-col justify-center items-center p-5  bg-red-900">
                    <div className="container leading-8 items-center justify-center">
                        <h1 className='text-2xl mb-5 font-bold text-center md:text-4xl text-yellow-100'>Why to choose us?</h1>
                        <div className='grid grid-cols-1 md:grid-cols-3 mt-16 gap-10 items-center justify-center'>
                            <div className='mx-auto'>
                                <FaEnvira className='text-white w-11 h-11 mx-auto'></FaEnvira>
                                <h1 className='font-bold text-xl text-white text-center mt-5'>100% Natural</h1>
                                <p className='text-white text-center'>Indulge in healthy,raw and unprocessed</p>
                            </div>
                            <div className='mx-auto'>
                                <FaHouse className='text-white w-11 h-11 mx-auto'></FaHouse>
                                <h1 className='font-bold text-xl text-white text-center mt-5'>Doorstep Delivery</h1>
                                <p className='text-white text-center'>Convenient and swift organic goodness at your doorstep</p>
                            </div>
                            <div className='mx-auto'>
                                <FaBoxOpen className='text-white w-11 h-11 mx-auto'></FaBoxOpen>
                                <h1 className='font-bold text-xl text-white text-center mt-5'>Sustainable Packaging</h1>
                                <p className='text-white text-center'>Eco-friendly packaging for a greener tomorrow</p>
                            </div>
                        </div>
                    </div>



                </section>
                <section className="relative h-96 bg-cover bg-center p-5" style={{ backgroundImage: `url(${im52})` }}>
                    <div>
                        <h1 className='text-4xl font-bold text-center'>Our Certifications</h1>
                        <div className='  place-items-center mt-10'>
                            <img src={certificate} className='w-24 h-24 p-1 rounded-full border-4 border-black'></img>
                            {/* <img src={certificate1} className='w-24 h-24 p-1 rounded-full border-4 border-black'></img> */}

                        </div>
                    </div>
                </section>


            </div >
        
    )
}

export default HomePage