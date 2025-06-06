import React, { useContext, useEffect, useState } from 'react'
import { database } from '../../FirebaseConfig';
import img from "../../assets/productpage.jpg"
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
    const { addToCart } = useContext(CartContext);
    const [loadedProductIds, setLoadedProductIds] = useState(new Set());
const [searchTerm,setSearchTerm]=useState("")
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
        const fetchCategories = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, "categories"));
                const categoryList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data()?.category || ""
                })).filter(cat => cat.name);

                setCategories([{ id: "all", name: "All" }, ...categoryList]);
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
                    const categoryProducts = productList.map(product => ({
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

    const filteredProducts = products
    .filter((product) =>
        selectedCategory === 'all' || product.category === selectedCategory
    )
    .filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  
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
            <div className="relative h-96 bg-cover bg-center" loading='lazy' style={{ backgroundImage: `url(${img})` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
                <div className='relative p-10 flex justify-center md:justify-start items-center h-full'>
                    <div className='font-thin text-7xl bebas-neue-regular '>Products</div>
                </div>
            </div>



            <div className="flex flex-col md:flex-row gap-6 p-4 md:mt-10">
                <div className="w-full md:w-1/4 self-start min-w-[250px] p-2 space-y-6">
                    <div className="bg-white shadow-lg rounded-lg p-4">
                    <input
                    type="text"
                    placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
                        {loading ? (
                            <p className="text-center mt-6 text-lg text-gray-600 col-span-full">Loading products...</p>
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
                                        <p className="text-gray-600 text-sm mt-1 font-medium"> ₹{product.price}</p>
                                        <p className="text-gray-600 text-sm mt-1 font-medium">{product.weight}</p>

                                    </div>
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