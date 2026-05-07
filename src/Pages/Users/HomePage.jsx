import React, { useEffect, useState } from 'react'
import img from '../../assets/Rectangle 15.png'
import img1 from '../../assets/hstory.png'
import wild from '../../assets/Image.jpg'
import bee from '../../assets/bee.png'
import img4 from "../../assets/flat-lay-decoration-with-cinnamon-sticks-hazelnuts.jpg"
import img5 from "../../assets/Rectangle 59.png"
import spices from "../../assets/Group 68.png"
import tamarind from "../../assets/tamarind.jpg"
import cloves from "../../assets/cloves.png"
import nutmeg from "../../assets/nutmeg.png"
import pepper from "../../assets/Rectangle 43.png"
import pep from "../../assets/image6.png"
import im52 from "../../assets/57.png"
import retail from "../../assets/organic-walnuts-background.jpg"
import certificate1 from "../../assets/ndli-logo.png"
import certificate from "../../assets/Fssai-Logo-PNG-Transparent.png"
import bulk from "../../assets/pep.png"
import { FaEnvira } from "react-icons/fa";
import { FaHouse, FaBoxOpen } from "react-icons/fa6";
import { get, ref } from 'firebase/database'
import { database } from '../../FirebaseConfig'
import { Link } from "react-router-dom"
import { collection, doc, getDocs } from 'firebase/firestore'
import { toast } from 'react-toastify'

function HomePage() {
    const [blogs, setBlogs] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [honeyProducts, setHoneyProducts] = useState([]);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const categoriesSnapshot = await getDocs(collection(database, "categories"));
                const productsSnapshot = await getDocs(collection(database, "products"));

                let honeyId = null;
                let spicesId = null;

                categoriesSnapshot.forEach((doc) => {
                    const name = doc.data().category;

                    if (name === "Honey") honeyId = doc.id;
                    if (name === "Spices") spicesId = doc.id;
                });

                let honeyProductsList = [];
                let spicesProductsList = [];

                productsSnapshot.forEach((docSnap) => {
                    const productList = docSnap.data().products || [];

                    if (docSnap.id === honeyId) {
                        honeyProductsList = [...honeyProductsList, ...productList];
                    }

                    if (docSnap.id === spicesId) {
                        spicesProductsList = [...spicesProductsList, ...productList];
                    }
                });

                // ✅ Featured Section (2 + 2)
                const selectedHoney = honeyProductsList.slice(0, 2);
                const selectedSpices = spicesProductsList.slice(0, 2);

                setFeaturedProducts([
                    ...selectedHoney,
                    ...selectedSpices
                ]);

                // ✅ Honey Collection (ALL honey)
                setHoneyProducts(honeyProductsList);

            } catch (error) {
                console.error("Featured products error:", error);
            }
        };

        fetchFeaturedProducts();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, "categories"));
                const categoryList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCategories(categoryList);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const reviewsRef = collection(database, 'reviews');
                const snapshot = await getDocs(reviewsRef);

                if (!snapshot.empty) {
                    const reviewArray = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    const latestReviews = reviewArray.slice(-4).reverse(); // Newest 4
                    setReviews(latestReviews);
                }
            } catch (error) {
                toast.error("Error fetching reviews");
            }
        };

        fetchReviews();
    }, []);


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


            <section className=" flex flex-col justify-center items-center w-full md:p-5 mt-5 ">
                {/* <div className="container mx-auto"> */}
                <div className='grid grid-cols-1 md:grid-cols-3'>
                    <div className='flex justify-end'>
                        <img src={bee} className='w-36 h-36 hidden md:block '></img>
                    </div>
                    <div className='relative'>
                        <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-24 h-24 opacity-10">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600 md:mt-14">
                                <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="currentColor" />
                            </svg>
                        </div>
                        <h1 className='text-2xl md:text-5xl font-serif text-gray-900 mt-[50px] md:mb-10'>Featured Products</h1>
                    </div>
                    <div className='flex justify-start'>
                        <img src={bee} className='md:w-36 md:h-36 transform -scale-x-100 hidden md:block'></img>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {featuredProducts.map((product) => (
                        <Link
                            key={product.id}
                            to={`/singleproduct/${product.id}`}
                            className="group bg-white border rounded-lg shadow-md overflow-hidden border-brandyellow transition-transform transform hover:scale-105"
                        >
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-64 object-cover md:p-3"
                            />
                            <div className="p-2">
                                <h4 className="text-xl font-semibold mb-2">
                                    {product.name}
                                </h4>
                            </div>
                        </Link>
                    ))}

                </div>

                <Link to="/productpage" className="mt-8 px-6 py-3 bg-[#bf8a02]  mx-auto text-white rounded-lg text-lg hover:scale-x-95">Explore Products</Link>


            </section>
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
            <section className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    {/* Minimal Header */}
                    <div className="text-center mb-16 relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-24 h-24 opacity-10">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600">
                                <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="currentColor" />
                            </svg>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mt-4 mb-3">The Honey Collection</h2>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-16 h-px bg-brandyellow"></div>
                            <span className="text-brandyellow text-sm italic font-serif">pure • raw • natural</span>
                            <div className="w-16 h-px bg-brandyellow"></div>
                        </div>
                    </div>


                    {/* Product Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {honeyProducts.map((product) => (
                            <div key={product.id} className="group bg-white">
                                <div className="relative border border-brandyellow p-4 pt-20 transition-all duration-500 hover:border-yellow-600 hover:shadow-xl">
                                    {/* Corner Accents */}
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brandyellow "></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brandyellow "></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brandyellow "></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brandyellow "></div>

                                    {/* Large Image - Clickable */}
                                    <Link to={`/singleproduct/${product.id}`} className="block">
                                        <div className="relative -mt-28 mb-4 cursor-pointer">
                                            <div className="w-64 h-64 mx-auto rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-amber-50 group-hover:shadow-2xl transition-shadow duration-300">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </div>
                                            {/* Optional: Add a subtle hint on hover */}
                                            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <span className="bg-brandyellow text-white text-xs px-3 py-1 rounded-full">
                                                    View Product
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Simple Content */}
                                    <div className="text-center mt-4">
                                        <h3 className="font-serif text-2xl text-gray-900 mb-2">{product.name}</h3>
                                        <p className="text-sm text-brandyellow font-medium">₹{product.price}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-16">
                        <Link
                            to="/productpage"
                            className="inline-block px-8 py-3 border border-brandyellow transition-colors"
                        >
                            Explore Collection →
                        </Link>
                    </div>
                </div>
            </section>


            <section
                className="relative py-20 bg-fixed bg-cover bg-center"
                style={{ backgroundImage: `url(${img4})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
                <div className="relative z-10 md:p-8 text-white">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold md:p-5 p-3">Western Ghats Spices</h1>
                    <p className='md:w-2/4 p-5 text-base md:text-sm xl:text-xl'>Discover the rich aroma and flavor of spices grown in the pristine Western Ghats. From the misty hills to your kitchen, each spice is handpicked to deliver the finest essence of nature's bounty.</p>
                    <div className='p-5'>
                        {/* <Link to="/productpage" className="md:mt-8 p-3 bg-red-800 hover:bg-red-500 text-white rounded-full text-lg">Shop Now</Link> */}
                        {categories
                            .filter((cat) => cat.category === "Spices")
                            .map((category) => (
                                <Link to={`/productpage?category=${category.id}`} key={category.id} className="px-6 py-4 bg-gradient-to-br from-red-900 to-red-500 text-white rounded-lg text-lg">
                                    Shop Now
                                </Link>
                            ))}

                    </div>
                </div>
            </section>


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

                        {categories
                            .filter((cat) => cat.category === "Spices")
                            .map((category) => (
                                <Link to={`/productpage?category=${category.id}`} key={category.id} className="px-6 py-4 bg-gradient-to-br from-red-900 to-red-500 text-white rounded-lg text-lg">
                                    Explore {category.category}
                                </Link>
                            ))}


                    </div>
                </div>
            </div>

            <section className="w-full py-12 bg-[#f3d17554] border-t-8 border border-red-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* <h1 className="text-center text-3xl sm:text-4xl font-extrabold mb-12 text-gray-900 underline">Latest From Blogs</h1> */}
                    <div className="text-center relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-24 h-24 opacity-10">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600">
                                <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="currentColor" />
                            </svg>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mt-4 mb-3">Latest From Blogs</h2>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-32 h-px bg-brandyellow"></div>
                        </div>
                    </div>

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
            <section className="py-20 bg-amber-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* <div className="text-center mb-12">
                        <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">What Our Customers Say</h2>
                    </div> */}
                    <div className="text-center mb-10 relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-24 h-24 opacity-10">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600">
                                <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="currentColor" />
                            </svg>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mt-4 mb-3">What Our Customers Say</h2>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-16 h-px bg-brandyellow"></div>
                            <span className="text-brandyellow text-sm italic font-serif">Testimonials</span>
                            <div className="w-16 h-px bg-brandyellow"></div>

                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {reviews.slice(0, 3).map((review) => (
                            <div
                                key={review.id}
                                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                            >
                                <div className="flex items-center mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-brandyellow to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-gray-900">{review.name}</h3>
                                        <p className="text-sm text-gray-600">{review.place}</p>
                                    </div>
                                </div>

                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`w-5 h-5 ${i < review.rating ? 'text-brandyellow' : 'text-gray-300'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>

                                <p className="text-gray-700 italic">"{review.review}"</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            to="/reviews"
                            className="inline-flex items-center px-6 py-3 border-2 border-red-900 text-red-900 hover:bg-brandyellow hover:text-white hover:border-brandyellow rounded-full font-medium transition-all duration-300"
                        >
                            Read All Reviews
                        </Link>
                    </div>
                </div>
            </section>

            <section className=" flex flex-col justify-center items-center p-5  bg-red-900">
                <div className="container leading-8 items-center justify-center">
                    {/* <h1 className='text-2xl mb-5 font-bold text-center md:text-4xl text-yellow-100'>Why to choose us?</h1> */}
                     <div className="text-center mb-10 relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-24 h-24 opacity-10">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-white">
                                <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="currentColor" />
                            </svg>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif text-yellow-100 mt-4 mb-3">Why to choose us?</h2>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-32 h-px bg-brandyellow"></div>
                            

                        </div>
                    </div>
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
                    <h1 className='text-4xl md:text-5xl text-center font-serif text-gray-900 mt-4 mb-3'>Our Certifications</h1>
                             <div className="flex items-center justify-center gap-3">
                            <div className="w-32 h-px bg-brandyellow"></div>
                        </div>

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