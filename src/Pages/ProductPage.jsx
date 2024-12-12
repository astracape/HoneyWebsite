import React, { useEffect, useState } from 'react'
import { ref, onValue, get, set } from 'firebase/database';
import { database } from '../FirebaseConfig';
import img from "../assets/productpage.jpg"
import img1 from '../assets/bg.png'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify"
import { ShoppingCartIcon } from '@heroicons/react/solid';
import { getAuth } from 'firebase/auth';


function ProductPage() {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate()
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const category = queryParams.get('category') || 'all';  // Default to 'all'
        setSelectedCategory(category);
    }, [location]);


    useEffect(() => {
        const productsRef = ref(database, 'products/categories');

        onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const productList = Object.entries(data)
                    .flatMap(([category, productByCategory]) =>
                        Object.entries(productByCategory).map(([id, product]) => ({
                            id,
                            category,
                            ...product,
                        }))
                    );
                setProducts(productList);
            }
        });
    }, []);
    useEffect(() => {
        const productsRef = ref(database, 'products/categories');
        onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const productList = Object.entries(data)
                    .flatMap(([category, productByCategory]) =>
                        Object.entries(productByCategory).map(([id, product]) => ({
                            id,
                            category,
                            ...product,
                        }))
                    );
                setProducts(productList);
            }
        });
    }, []);

    const cartview = () => {
        navigate('/cart')
    }


    const auth = getAuth();

    const addToCart = async (product) => {
        const user = auth.currentUser;
    
        if (user) {
            // For logged-in users
            const userId = user.uid;
            const userCartRef = ref(database, `users/${userId}/cart`);
            
            try {
                const snapshot = await get(userCartRef);
                const currentCart = snapshot.val() || [];
                const updatedCart = [...currentCart, product];
                await set(userCartRef, updatedCart);
    
                console.log("Item added to logged-in user's cart in Firebase.");
                setShowPopup(true); // Show popup
                setTimeout(() => setShowPopup(false), 3000);
            } catch (error) {
                console.error("Error updating cart:", error);
            }
        } else {
            // For unlogged users
            const localCart = JSON.parse(localStorage.getItem("cart")) || [];
            const updatedCart = [...localCart, product];
            localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success("item added to your cart")
            console.log("Item added to unlogged user's cart in localStorage.");
        }
    };
    

    // Filter products based on the selected category
    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter((product) => product.category === selectedCategory);
    return (
        <div>
            <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}>
                <div className='p-10 flex justify-center md:justify-start items-center h-full'>
                    <div className='font-thin text-7xl bebas-neue-regular'>Products</div>
                </div>
            </div>

            <div className="flex flex-col items-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Categories</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className="bg-transparent border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors duration-300 px-6 py-2 rounded-full shadow-md"
                    >
                        All
                    </button>
                    <button
                        onClick={() => setSelectedCategory('honey')}
                        className="bg-transparent border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors duration-300 px-6 py-2 rounded-full shadow-md"
                    >
                        Honey
                    </button>
                    <button
                        onClick={() => setSelectedCategory('spices')}
                        className="bg-transparent border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors duration-300 px-6 py-2 rounded-full shadow-md"
                    >
                        Spices
                    </button>
                    <button
                        onClick={() => setSelectedCategory('oil')}
                        className="bg-transparent border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors duration-300 px-6 py-2 rounded-full shadow-md"
                    >
                        Oil
                    </button>
                    <button
                        onClick={() => setSelectedCategory('coconut')}
                        className="bg-transparent border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors duration-300 px-6 py-2 rounded-full shadow-md"
                    >
                        Coconut
                    </button>
                </div>
            </div>
 

            <div className="relative">

                <div
                    className="absolute inset-0 bg-cover bg-center opacity-25"
                    style={{ backgroundImage: `url(${img1})` }}
                ></div>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative w-3/4  mx-auto py-10">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                            <div key={index} className="border p-4 bg-white shadow rounded-xl md:w-full relative">
                                <Link to={`/singleproduct/${product.id}`}>
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-80 object-cover rounded-xl"
                                    />
                                </Link>
                                <div className="grid grid-cols-1 md:grid-cols-2 mt-4">
                                    <div>
                                        <h3 className="font-bold text-xl">{product.name}</h3>
                                        <p className="text-lg">₹{product.price}</p>
                                    </div>
                                    <div className="flex justify-end my-auto gap-5">
                                        <button className="bg-red-900 text-white p-3 rounded-xl" onClick={() => addToCart(product)}>Add to cart</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="col-span-3 text-center mt-16 font-bold">No products available</p>
                    )}
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
            {showPopup && (
                <div
                    data-aos="fade-up"  
                    data-aos-duration="600" 
                    className="fixed bottom-0 left-0 w-full font-bold italic bg-gradient-to-r from-[#ffa600dc] to-[#8b4513df] text-white p-6 flex items-center justify-between shadow-lg transform transition-transform"
                >
                    <div className="flex items-center gap-2">
                        <ShoppingCartIcon className="h-6 w-6 text-gray-900" />
                        <span className="text-xl text-gray-900">
                            Item added to cart successfully!
                        </span>
                    </div>
                    <button
                        onClick={cartview}
                        className="bg-transparent text-white font-normal px-4 py-2 rounded-lg border-2 border-gray-900 hover:bg-red-900 hover:text-white transition-colors duration-300 ease-in-out transform hover:scale-105 shadow-md"
                    >
                        View Cart
                    </button>
                </div>
            )}

        </div>





    )
}

export default ProductPage