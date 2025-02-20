import React, { useEffect, useState } from 'react'
import { ref, onValue, get, set } from 'firebase/database';
import { database } from '../../FirebaseConfig';
import img from "../../assets/productpage.jpg"

import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify"
import { ShoppingCartIcon } from '@heroicons/react/solid';
import { getAuth } from 'firebase/auth';
import ReactPaginate from 'react-paginate';


function ProductPage() {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [sortOrder, setSortOrder] = useState('');
    const navigate = useNavigate()
    const location = useLocation();

    const itemsPerPage = 12;

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to the top when the component mounts
    }, []);
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

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };
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
                const existingProduct = currentCart.findIndex(
                    (item) => item.id === product.id
                )
                if (existingProduct > -1) {
                    // Increment the quantity of the existing product
                    currentCart[existingProduct].quantity += 1;
                } else {
                    // Add the product with default quantity 1
                    currentCart.push({ ...product, quantity: 1 });
                }
                await set(userCartRef, currentCart);

                console.log("Item added to logged-in user's cart in Firebase.");
                setShowPopup(true); // Show popup
                setTimeout(() => setShowPopup(false), 3000);
            } catch (error) {
                console.error("Error updating cart:", error);
                toast.error("Failed to add item to cart.");
            }
        } else {
            // For unlogged users
            const localCart = JSON.parse(sessionStorage.getItem("cart")) || [];
            const existingProduct = localCart.findIndex(
                (item) => item.id === product.id
            )
            if (existingProduct > -1) {
                // Increment the quantity of the existing product
                localCart[existingProduct].quantity += 1;
            } else {
                // Add the product with default quantity 1
                localCart.push({ ...product, quantity: 1 });
            }

            sessionStorage.setItem("cart", JSON.stringify(localCart));
            toast.success("item added to your cart")
            console.log("Item added to unlogged user's cart in localStorage.");
        }
    };


    // Filter products based on the selected category
    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter((product) => product.category === selectedCategory);


    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortOrder === "lowToHigh") return a.price - b.price;
        if (sortOrder === "highToLow") return b.price - a.price;
        if (sortOrder === "AtoZ") return a.name.localeCompare(b.name);
        if (sortOrder === "ZtoA") return b.name.localeCompare(a.name);
        return 0;
    });
    const pageCount = Math.ceil(sortedProducts.length / itemsPerPage);
    const currentItems = sortedProducts.slice(
        currentPage * itemsPerPage,
        currentPage * itemsPerPage + itemsPerPage

    )
    return (
        <div>
            <div className="relative h-96 bg-cover bg-center" loading='lazy' style={{ backgroundImage: `url(${img})` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
                <div className='relative p-10 flex justify-center md:justify-start items-center h-full'>
                    <div className='font-thin text-7xl bebas-neue-regular'>Products</div>
                </div>
            </div>



            <div className="flex flex-col md:flex-row gap-6 p-4 md:mt-10">
                <div className="w-full md:w-1/4 self-start p-2 space-y-6">
                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Categories:</h2>
                        <div className="flex  flex-col gap-2 ">
                            {["all", "honey", "spices", "oil", "coconut", "nuts", "wholesale"].map((category) => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setCurrentPage(0);
                                    }}
                                    className={`py-2 px-4 text-left rounded-md font-medium transition-all duration-300 text-sm flex items-center gap-3 w-full
                        ${selectedCategory === category
                                            ? 'bg-gradient-to-r from-red-900 to-red-700 text-white shadow-md hover:w-72'
                                            : 'text-gray-700 hover:bg-yellow-50'
                                        }`}
                                >
                                    <span className='text-lg'>
                                    {/* Add icons for each category */}
                                    {category === "all" && <span>📦</span>}
                                    {category === "honey" && <span>🍯</span>}
                                    {category === "spices" && <span>🌶️</span>}
                                    {category === "oil" && <span>🫒</span>}
                                    {category === "coconut" && <span>🥥</span>}
                                    {category === "nuts" && <span>🥜</span>}
                                    {category === "wholesale" && <span>🛒</span>}
                                    </span>
                                    <span className="flex-1"> 
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className='flex gap-2'>
                        <p className='font-semibold text-lg'>Sort:</p>
                        <select
                            onChange={(e) => setSortOrder(e.target.value)}
                            value={sortOrder}
                            className="px-4 py-3 border-2 border-yellow-600 rounded-lg text-gray-900 bg-white shadow-md focus:outline-none focus:border-transparent focus:ring-2 focus:ring-yellow-600"
                        >
                            <option value="">Sort by</option>
                            <option value="AtoZ">Alphabetical (A-Z)</option>
                            <option value="ZtoA">Alphabetical (Z-A)</option>
                            <option value="lowToHigh" >Price: Low to High</option>
                            <option value="highToLow">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 relative md:border-l-2 p-5 md:border-t-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 relative">
                        {currentItems.length > 0 ? (
                            currentItems.map((product, index) => (
                                <div key={index} className="bg-white shadow-lg rounded-xl overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl p-4 relative">
                                    <Link to={`/singleproduct/${product.id}`}>
                                        <div className="relative">
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-56 object-cover rounded-lg transition-opacity duration-300 hover:opacity-80"
                                                loading="lazy"
                                            />
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        </div>
                                    </Link>
                                    <div className="mt-2 text-center">
                                        <h3 className="font-semibold text-base text-gray-800">{product.name}</h3>
                                        <p className="text-gray-600 text-sm mt-1 font-medium">__</p>
                                    </div>
                                    <button
                                        className="w-full mt-2 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white py-2 rounded-lg transition-all duration-300 text-sm"
                                        onClick={() => addToCart(product)}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 font-medium col-span-full">No products available</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex md:justify-end justify-center  p-5 mt-6">
                <ReactPaginate
                    previousLabel={<span className="text-lg">←</span>}
                    nextLabel={<span className="text-lg">→</span>}
                    breakLabel={"..."}
                    pageCount={pageCount}
                    marginPagesDisplayed={1}
                    pageRangeDisplayed={3}
                    onPageChange={handlePageChange}
                    containerClassName={"flex space-x-2"}
                    pageClassName={"px-4 py-2 bg-yellow-100 rounded-full cursor-pointer hover:bg-gray-200 transition-all duration-300"}
                    activeClassName={"bg-yellow-600 text-white"}
                    previousClassName={"px-4 py-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-all duration-300"}
                    nextClassName={"px-4 py-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-all duration-300"}
                />
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