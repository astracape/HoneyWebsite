import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { database } from '../../FirebaseConfig';
import { get, getDatabase, onValue, ref, update } from 'firebase/database';
import { toast, ToastContainer } from 'react-toastify';
// import { Bar } from 'react-chartjs-2';

function Dashboard() {
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0)
    const [blogs, setBlogs] = useState([]);
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTotalProducts = async () => {
            try {
                const productsRef = ref(database, 'products/categories');
                const snapshot = await get(productsRef);
                if (snapshot.exists()) {
                    const products = snapshot.val();
                    const productCount = Object.keys(products).reduce((count, category) => count + Object.keys(products[category]).length, 0);
                    setTotalProducts(productCount);
                }
            } catch (error) {
                console.error("Error fetching total products:", error);
            }
        };

        fetchTotalProducts();
    }, []);

    useEffect(() => {
        const fetchTotalBlogs = async () => {
            try {
                const blogRef = ref(database, 'blogs');
                const snapshot = await get(blogRef);
                if (snapshot.exists()) {
                    const blogs = snapshot.val();
                    const blogCount = Object.keys(blogs).length;
                    setTotalBlogs(blogCount);
                }
            } catch (error) {
                console.error("Error fetching total products:", error);
            }
        };

        fetchTotalBlogs();
    }, []);

    useEffect(() => {
        const fetchTotalUsers = async () => {
            try {
                const userRef = ref(database, 'users');
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    const userCount = Object.keys(users).length;
                    setTotalUsers(userCount);
                }
            } catch (error) {
                console.error("Error fetching total products:", error);
            }
        };

        fetchTotalUsers();
    }, []);

    useEffect(() => {
        const db = getDatabase();
        const ordersRef = ref(db, 'orders'); // Fetch all orders

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

                setOrders(ordersArray); // Update state with all orders
            } else {
                setOrders([]); // Handle no orders case
            }
        });
    }, []);

    const updateOrderStatus = async (userId,orderId, status) => {
        const db = getDatabase();
        const orderRef = ref(db, `orders/${userId}/${orderId}`);

        try {
            await update(orderRef, { orderStatus: status });
            toast.success(`Order status updated to ${status}`);
            // Optionally, refresh orders list here
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status");
        }
    };
    // View order details function
    const viewOrderDetails = (userId,orderId) => {
        navigate(`/orderdetails/${userId}/${orderId}`); // Navigate to order details page
    };

    return (
        <div>
            <div className="flex flex-col border-b">


                {/* <div className="flex-1 p-4"> */}


                <div className="mt-4">
                    {/* <Bar data={data} /> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 p-10 mx-auto">
                    <div className="bg-white p-4 rounded shadow w-64 flex flex-col items-center border border-b-4 border-yellow-600">
                        <h3 className="text-xl">Total Products</h3>
                        <p className="text-3xl">{totalProducts}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow w-64 flex flex-col items-center border border-b-4 border-yellow-600">
                        <h3 className="text-xl">Total Blogs</h3>
                        <p className="text-3xl">{totalBlogs}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow w-64 flex flex-col items-center border border-b-4 border-yellow-600">
                        <h3 className="text-xl">Total Users</h3>
                        <p className="text-3xl">{totalUsers}</p>
                    </div>
                </div>
                {/* </div> */}



            </div>
            <div className="container mx-auto p-8">
                <h3 className="text-2xl font-semibold mb-4">Orders</h3>

                {/* Orders Table */}
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-yellow-600">
                                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Order ID</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Customer Name</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Total Amount</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Payment Method</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Order Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 text-sm text-gray-800">{order.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800">{`${order.user?.firstName} ${order.user?.lastName}`}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800">
                                            ₹{order.totalAmount}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-800">{order.paymentMethod}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{order.orderStatus}
                                            <div className="flex gap-2 p-5">
                                                <button
                                                    className="px-2 py-1 bg-[#D98C00] text-white rounded hover:scale-95"
                                                    onClick={() => updateOrderStatus(order.userId,order.id, 'Processing')}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="px-2 py-1 bg-[#6C4600] text-white rounded hover:scale-95"
                                                    onClick={() => updateOrderStatus(order.userId,order.id, 'Order Completed')}
                                                >
                                                    Completed
                                                </button>
                                                <button
                                                    className="px-2 py-1 bg-black text-white rounded hover:scale-95"
                                                    onClick={() => updateOrderStatus(order.userId,order.id, 'Rejected')}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-yellow-700 cursor-pointer">
                                            <button onClick={() => viewOrderDetails(order.userId,order.id)} className="underline">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))

                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-700">No Orders Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <ToastContainer />
            </div>
        </div>
    )
}

export default Dashboard