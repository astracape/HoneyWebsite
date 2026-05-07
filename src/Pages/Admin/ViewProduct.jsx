import React, { useEffect, useState } from 'react';
import { database } from '../../FirebaseConfig';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import Pagination from '../../Pagination/Pagination';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import { FaBoxOpen } from 'react-icons/fa';

function ViewProduct() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortOrder, setSortOrder] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const itemsPerPage = 10;
    

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const category = queryParams.get('category') || 'all';
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

                setCategories([{ id: "all", name: "All Products" }, ...categoryList]);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsRef = collection(database, "products");
                const snapshot = await getDocs(productsRef);
                let productList = [];

                snapshot.forEach((doc) => {
                    const category = doc.id;
                    const data = doc.data();

                    if (data.products && Array.isArray(data.products)) {
                        const categoryProducts = data.products.map((product) => ({
                            ...product,
                            category,
                        }));
                        productList = [...productList, ...categoryProducts];
                    }
                });

                setProducts(productList);
            } catch (error) {
                toast.error("Error fetching products");
            }
        };
        fetchProducts();
    }, []);

    const confirmDelete = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const removeProduct = async () => {
        if (!selectedProduct) return;

        try {
            const { id, category } = selectedProduct;
            const categoryRef = doc(database, "products", category);

            const categorySnap = await getDoc(categoryRef);
            if (!categorySnap.exists()) {
                toast.error("Category not found");
                return;
            }

            const data = categorySnap.data();
            const updatedProducts = data.products.filter(product => product.id !== id);

            await updateDoc(categoryRef, { products: updatedProducts });
            setProducts(prevProducts => prevProducts.filter(product => product.id !== id));

            setShowModal(false);
            toast.success("Product removed successfully");
        } catch (error) {
            toast.error("Error removing product");
        }
    };

    const filteredProducts = products
        .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
        .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
        (currentPage + 1) * itemsPerPage
    );

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className="lg:ml-64 min-h-screen bg-gray-50">
            {/* Admin Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 px-3 border-l-4 border-brandyellow">Product Management</h1>
                    <div className="flex space-x-4">
                        <Link
                            to="/addproduct"
                            className="flex items-center bg-brandyellow text-white px-4 py-2 rounded-md transition-colors"
                        >
                            <FiPlus className="mr-2" />
                            Add New Product
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-transparent focus:ring-2 focus:ring-yellow-500 "
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center">
                                <label htmlFor="category" className="mr-2 text-sm font-medium text-gray-700">Category:</label>
                                <select
                                    id="category"
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        navigate(`?category=${e.target.value}`);
                                    }}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2"
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center">
                                <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">Sort:</label>
                                <select
                                    id="sort"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2"
                                >
                                    <option value="">Default</option>
                                    <option value="AtoZ">A-Z</option>
                                    <option value="ZtoA">Z-A</option>
                                    <option value="lowToHigh">Price: Low to High</option>
                                    <option value="highToLow">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {currentItems.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>

                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Weight
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt={product.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 capitalize">
                                                    {categories.find(c => c.id === product.category)?.name || product.category}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">₹{product.price}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-semibold ${product.stockStatus === "out-of-stock"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-green-100 text-green-700"
                                                        }`}
                                                >
                                                    {product.stockStatus === "out-of-stock" ? "Out of Stock" : "In Stock"}-
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{product.weight}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        to={`/editproductbyid/${product.id}`}
                                                        className="text-brandyellow flex items-center"
                                                    >
                                                        <FiEdit2 className="mr-1" /> Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => confirmDelete(product)}
                                                        className="text-red-600 flex items-center"
                                                    >
                                                        <FiTrash2 className="mr-1" /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FaBoxOpen className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm
                                    ? "Try adjusting your search or filter criteria"
                                    : "Get started by adding a new product"}
                            </p>
                            <div className="mt-6">
                                <Link
                                    to={selectedCategory !== 'all' ? `/addproduct?category=${selectedCategory}` : '/addproduct'}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brandyellow
                                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                >
                                    <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                                    Add New Product
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {currentItems.length > 0 && (
                    <div className="flex justify-center mt-6">
                        <Pagination pageCount={pageCount} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <FiTrash2 className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Delete product</h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={removeProduct}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Delete
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
}

export default ViewProduct;