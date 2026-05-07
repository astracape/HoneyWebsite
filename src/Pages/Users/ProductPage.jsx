import React, { useContext, useEffect, useState, useRef } from 'react'
import { database } from '../../FirebaseConfig';
import img from "../../assets/freepik__a-topdown-view-of-a-small-white-bowl-filled-with-p__34361.jpeg"
import 'react-toastify/dist/ReactToastify.css';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify"
import { ShoppingCartIcon } from '@heroicons/react/solid';
import { getAuth } from 'firebase/auth';
import ReactPaginate from 'react-paginate';
import { collection, doc, getDoc, getDocs, increment, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { CartContext } from '../../context/CartContext';
import Pagination from '../../Pagination/Pagination';

function ProductPage() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [sortOrder, setSortOrder] = useState('');
    const navigate = useNavigate()
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const { cart, addToCart } = useContext(CartContext);
    const [nativeSpecialId, setNativeSpecialId] = useState(null);

    const [loadedProductIds, setLoadedProductIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState("")
    const [showCartSidebar, setShowCartSidebar] = useState(false);
    const itemsPerPage = 12;
    const resultsRef = useRef(null);

    useEffect(() => {
        if (searchTerm) {
            resultsRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [searchTerm]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, "categories"));

                const categoryList = querySnapshot.docs
                    .map(doc => ({
                        id: doc.id,                 //  real ID
                        name: doc.data()?.category  // display name
                    }))
                    .filter(item => item.name !== "Gifting Options");

                // desired order by NAME
                const desiredOrder = [
                    "Honey",
                    "Spices",
                    "Nuts",
                    "Native Specials - Pre order",
                    "Wholesale"
                ];

                const sortedCategories = desiredOrder
                    .map(name => categoryList.find(cat => cat.name === name))
                    .filter(Boolean);

                setCategories([
                    ...sortedCategories,
                    { id: "all", name: "All" }
                ]);
                const nativeSpecialCategory = categoryList.find(
                    cat => cat.name === "Native Specials - Pre order"
                );

                if (nativeSpecialCategory) {
                    setNativeSpecialId(nativeSpecialCategory.id);
                }

                // SET DEFAULT TO HONEY ID
                // const honeyCategory = categoryList.find(cat => cat.name === "Honey");
                // if (honeyCategory) {
                //     setSelectedCategory(honeyCategory.id);
                //     navigate(`?category=${honeyCategory.id}`, { replace: true });
                // }
                const queryParams = new URLSearchParams(location.search);
const categoryFromURL = queryParams.get("category");

if (!categoryFromURL) {
    const honeyCategory = categoryList.find(cat => cat.name === "Honey");

    if (honeyCategory) {
        setSelectedCategory(honeyCategory.id);
        navigate(`?category=${honeyCategory.id}`, { replace: true });
    }
}


            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const productsRef = collection(database, "products");

        const unsubscribe = onSnapshot(productsRef, (snapshot) => {
            let newProducts = [];

            snapshot.forEach((docSnap) => {
                const categoryId = docSnap.id;
                const data = docSnap.data();
                const productList = data?.products || [];

                // Now that categoryId is defined, log here:
                console.log("Checking doc id:", categoryId, "against selectedCategory:", selectedCategory);

                if (selectedCategory === "all" || selectedCategory === categoryId) {
                    const categoryProducts = productList
                        .filter(product => !product.isGift)
                        .map(product => ({
                            ...product,
                            category: categoryId,
                        }));
                    console.log("Loaded products for", categoryId, categoryProducts);
                    newProducts = [...newProducts, ...categoryProducts];
                }
            });

            setProducts(newProducts);
        });

        return () => unsubscribe();
    }, [selectedCategory]);

    const cartview = () => {
        navigate('/cart')
    }

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };
    const auth = getAuth();
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    const filteredProducts = products
        .filter((product) =>

            selectedCategory === 'all' || product.category === selectedCategory
        )
        .filter((product) => !product.isGift)
        .filter((product) => {
            const name = product.name.toLowerCase()
            return searchWords.every((word) => name.includes(word))
        });

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
    const handleAddToCart = (product) => {
        addToCart(product);
        setShowPopup(true);
        const timer = setTimeout(() => {
            setShowPopup(false);
        }, 1000);
        // Clear timeout if component unmounts or popup is closed manually
        return () => clearTimeout(timer);
    };

    useEffect(() => {
        if (products.length === 0) {
            setLoading(true);
        }

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [products]);

    return (
        <div>
            <div className="relative h-44 md:h-56 lg:h-40 overflow-hidden">

                {/* Background Image */}
                <img
                    src={img}
                    alt="Products Banner"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                />

                {/* Soft Premium Overlay */}
                <div className="absolute inset-0 bg-black/35"></div>

                {/* Content */}
                <div className="relative h-full flex items-center justify-center">

                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-extralight text-white tracking-[0.2em] uppercase">
                            Products
                        </h1>
                    </div>

                </div>
            </div>

            {nativeSpecialId && selectedCategory === nativeSpecialId && 
 (
                <div className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 py-10 px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-900 to-red-700 rounded-full mb-6 shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                        </div>

                        <div className="space-y-4 text-gray-700">
                            <p className="text-lg leading-relaxed">
                                Each of our native snacks is <span className="font-semibold text-red-700">prepared fresh upon request</span>
                                &nbsp;and never produced in bulk. We cherish the traditional methods that ensure
                                every bite carries authentic, homemade quality.
                            </p>
                            <div className="inline-block px-6 py-2 bg-gradient-to-r from-red-900 to-red-700 rounded-full shadow-md">
                                <p className="text-white font-medium">
                                    Pre-orders will be shipped <span className="font-bold">10 days</span> after the order date
                                </p>
                            </div>
                            <p className="text-gray-600 mt-6 italic font-medium">
                                We appreciate your patience as we craft your order with care.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => setShowCartSidebar(true)}
                className="fixed bottom-6 right-6 bg-red-700 text-white p-4 rounded-full shadow-lg z-40 hover:bg-red-800 transition-colors"
            >
                <ShoppingCartIcon className="h-6 w-6" />
                {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {cart.length}
                    </span>
                )}
            </button>

            {/* Cart Sidebar */}
            {showCartSidebar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
                    <div className="bg-white w-full max-w-md h-full overflow-y-auto">
                        <div className="p-4 border-b sticky top-0 bg-white z-10">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold">Your Cart ({cart.length})</h3>
                                <button
                                    onClick={() => setShowCartSidebar(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            {cart.length > 0 ? (
                                cart.map((item) => (
                                    <div key={item.id} className="flex gap-3 border-b pb-3">
                                        <img
                                            src={item.imageUrl}
                                            className="w-16 h-16 object-cover rounded"
                                            alt={item.name}
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium">{item.name}</h4>
                                            <p className="text-gray-600">₹{item.price} × {item.quantity}</p>
                                            <p className="text-sm text-gray-500">{item.weight}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-10">
                                    <p className="mb-4">Your cart is empty</p>
                                    <button
                                        onClick={() => {
                                            setShowCartSidebar(false);
                                            navigate('/productpage');
                                        }}
                                        className="bg-brandyellow text-black font-medium px-5 py-2 rounded hover:bg-yellow-500 transition-colors"
                                    >
                                        Browse Products
                                    </button>
                                </div>

                            )}
                        </div>
                        {cart.length > 0 && (
                            <div className="p-4 border-t sticky bottom-0 bg-white">
                                <button
                                    onClick={() => {
                                        setShowCartSidebar(false);
                                        navigate('/cart');
                                    }}
                                    className="w-full bg-gradient-to-r from-red-900 to-red-700 text-white py-3 rounded-lg  transition-colors"
                                >
                                    See Details
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 p-4 md:mt-10">
                <div className="w-full md:w-1/4 self-start min-w-[250px] p-2 space-y-6">
                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.replace(/\s+/g, ' '))}
                            className="px-4 py-2 border rounded-md mb-6 border-yellow-600"
                        />
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Categories:</h2>
                        <div className="flex  flex-col gap-2 ">


                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => {
                                        setSelectedCategory(category.id);
                                        setCurrentPage(0);
                                        navigate(`?category=${category.id}`);
                                    }}

                                    className={`py-2 px-4 text-left rounded-md font-medium transition-all duration-300 text-sm flex items-center gap-3 w-full 
      ${selectedCategory === category.id
                                            ? "bg-gradient-to-r from-red-900 to-red-700 text-white shadow-md"
                                            : "text-gray-700 hover:bg-yellow-50"
                                        }`}
                                >
                                    {category.name}
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
                            <option value="">Category</option>
                            <option value="AtoZ">Alphabetical (A-Z)</option>
                            <option value="ZtoA">Alphabetical (Z-A)</option>
                            <option value="lowToHigh" >Price: Low to High</option>
                            <option value="highToLow">Price: High to Low</option>
                        </select>
                    </div>
                </div>


                {/* Product Grid */}
                <div className={`flex-1 w-full  relative p-5 ${!loading && currentItems.length > 0 ? 'md:border-l-2 md:border-t-2' : ''}`}>
                    <div ref={resultsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                {/* Simple spinner without separate component*/}
                                <div className="w-16 h-16 border-4 border-gray-300 border-t-yellow-500 rounded-full animate-spin">
                                </div>
                                <p className="text-center mt-6 text-lg text-gray-600 col-span-full">Loading products...</p>

                            </div>
                        ) : currentItems.length > 0 ? (
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
                                        {product.isPreorder && (
                                            <div className="mt-1 inline-flex flex-col items-center gap-0.5">
                                                <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded-full">
                                                    🕒 Pre-order
                                                </span>
                                                <span className="text-[11px] text-amber-700">
                                                    Delivered within 10 days
                                                </span>
                                            </div>
                                        )}
                                        <p className="text-gray-600 text-sm mt-1 font-medium"> ₹{product.price}</p>
                                        <p className="text-gray-600 text-sm mt-1 font-medium">{product.weight}</p>

                                    </div>
                                    {product.stockStatus === "out-of-stock" && (
                                        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                                            Out of Stock
                                        </span>
                                    )}

                                    <button
                                        className="w-full mt-2 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white py-2 rounded-lg transition-all duration-300 text-sm"
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 font-medium  col-span-full">No products available</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex md:justify-end justify-center  p-5 mt-6">
                <Pagination pageCount={pageCount} onPageChange={handlePageChange} />
            </div>
            <ToastContainer
                position="bottom-center"
                autoClose={1200}
                hideProgressBar={false}
                limit={1}
            />

            {showPopup && (
                <div
                    className="fixed bottom-4 left-0 right-0 mx-auto bg-brandyellow rounded-lg shadow-xl z-50 max-w-sm w-[90%]"
                    data-aos="fade-up"
                    data-aos-duration="300"
                >
                    <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center overflow-hidden flex-1">
                            <div className="bg-green-100 p-2 rounded-full mr-2 flex-shrink-0">
                                <svg
                                    className="w-5 h-5 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-800 font-medium text-sm truncate">
                                Added to cart
                            </span>
                        </div>
                        <button
                            onClick={() => setShowPopup(false)}
                            className="text-black hover:text-gray-600 flex-shrink-0 ml-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

        </div>
    )
}

export default ProductPage
