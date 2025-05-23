import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { database } from '../../FirebaseConfig';
import { get, getDatabase, onValue, ref, update } from 'firebase/database';
import { toast, ToastContainer } from 'react-toastify';
import ReactPaginate from 'react-paginate';
import { collection, getDocs } from 'firebase/firestore';
// import { Bar } from 'react-chartjs-2';

function Dashboard() {
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0)
    const [blogs, setBlogs] = useState([]);
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState([])
    const [recentProducts, setRecentProducts] = useState([])
    const [recentUsers, setRecentUsers] = useState([])
    const navigate = useNavigate();
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchTotalProducts = async () => {
            try {
                const productsRef = collection(database, "products");
                const snapshot = await getDocs(productsRef);

                if (!snapshot.empty) {
                    // Extract products from categories
                    const allProducts = snapshot.docs.flatMap(doc => doc.data().products || []);
                    setTotalProducts(allProducts.length);
                    const sortedProducts = allProducts
                        .filter(product => product.timestamp) 
                        .sort((a, b) => b.timestamp - a.timestamp);
                    // Get last 5, most recent first
                    setRecentProducts(sortedProducts.slice(0, 5));

                }
            } catch (error) {
                toast.error("Error fetching total products", error.message)
            }
        };

        fetchTotalProducts();
    }, []);

    useEffect(() => {
        const fetchTotalBlogs = async () => {
            try {
                const blogRef = collection(database, 'blogs');
                const snapshot = await getDocs(blogRef);
                if (!snapshot.empty) {
                    setTotalBlogs(snapshot.size)
                }
            } catch (error) {
                toast.error("Error fetching total products", error)
            }
        };

        fetchTotalBlogs();
    }, []);

    useEffect(() => {
        const fetchTotalUsers = async () => {
            try {
                const userRef = collection(database, 'users');
                const snapshot = await getDocs(userRef);
                if (!snapshot.empty) {
                    const users = snapshot.docs.map(doc => ({
                        id: doc.id, // Firestore document ID
                        ...doc.data(), // Document data
                    }));
                    const nonAdminUsers = users.filter(user => user.role !== "admin");
                    setTotalUsers(nonAdminUsers.length);
                    const sortedUsers = users
                        .filter(user => user.timestamp && user.role !== "admin")
                        .sort((a, b) => b.timestamp - a.timestamp) // Sort descending by timestamp
                        .slice(0, 5); // Get latest 5 users

                    setRecentUsers(sortedUsers);
                }
            } catch (error) {
                toast.error("Error fetching total users", error.message)
            }

        }
        fetchTotalUsers();
    }, []);

    useEffect(() => {
        const db = getDatabase();
        const ordersRef = ref(db, 'orders');

        onValue(ordersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const ordersArray = [];

                // Flatten the nested structure (orders grouped by userId)
                for (const userId in data) {
                    for (const orderId in data[userId]) {
                        ordersArray.push({
                            id: orderId,
                            userId: userId,
                            ...data[userId][orderId],
                        });
                    }
                }
                const sortedOrders = [...ordersArray].sort((a, b) =>
                    new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
                )
                setOrders(sortedOrders); // Update state with all orders
            } else {
                setOrders([]); // Handle no orders case
            }
        });
    }, []);


    return (
        <div className='md:ml-64 p-6 bg-gray-50 min-h-screen'>

            <div className="">
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ">
                <div className="bg-yellow-100  rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300 ">
                    <div className="flex items-center justify-between ">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700">Total Products</h3>
                            <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
                        </div>
                        <div className="p-3 bg-yellow-600 rounded-full">
                            <svg className="w-8 h-8 text-yellow-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-yellow-100 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300 ">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl  font-semibold text-gray-700">Total Blogs</h3>
                            <p className="text-3xl font-bold text-gray-900">{totalBlogs}</p>
                        </div>
                        <div className="p-3 bg-yellow-600 rounded-full">
                            <svg className="w-8 h-8 text-yellow-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-yellow-100  rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300 ">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700">Total Users</h3>
                            <p className="text-3xl  font-bold text-gray-900">{totalUsers}</p>
                        </div>
                        <div className="p-3 bg-yellow-600 rounded-full">
                            <svg className="w-8 h-8 text-yellow-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            {/* </div> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Products Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Latest Products</h3>
                        <Link to="/productpage" className="text-yellow-600 hover:text-yellow-700 font-medium">View All</Link>
                    </div>
                    <ul className="space-y-4">
                        {recentProducts.length > 0 ? (
                            recentProducts.map((product, index) => (
                                <li key={index} className="flex items-center space-x-4">
                                    {product.imageUrl && (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded-lg"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-800">{product.name}</p>
                                        <span className="text-sm text-gray-600">₹{product.price}</span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-600">No recent products</p>
                        )}
                    </ul>
                </div>

                {/* Recent Users Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Recent Users</h3>
                        <Link to="/users" className="text-yellow-600 hover:text-yellow-700 font-medium">View All</Link>
                    </div>
                    <ul className="space-y-4">
                        {recentUsers.length > 0 ? (
                            recentUsers.map((user, index) => (
                                <li key={index} className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <span className="text-lg font-semibold text-yellow-600">
                                            {user.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{user.name}</p>
                                        <span className="text-sm text-gray-600">{user.email}</span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-600">No recent users</p>
                        )}
                    </ul>
                </div>
            </div>

            {/* </div> */}

        </div>
    )
}

export default Dashboard