import { collection, doc, getFirestore, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate';
import 'react-toastify/dist/ReactToastify.css';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import * as XLSX from "xlsx";
import { database } from '../../FirebaseConfig';
import Pagination from '../../Pagination/Pagination';

function OrderManagement() {
    const [orders, setOrders] = useState([])
    const [currentPage, setCurrentPage] = useState(0);
    const [searchquery, setSearchquery] = useState("")
    const [filter, setFilter] = useState("all");
    const [selectedorder, setSelectedorder] = useState([])
    const [multiplestatus, setMultiplestatus] = useState("processing")
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersRef = query(collection(database, 'orders'), orderBy('createdAt', 'desc'));
                const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
                    const ordersArray = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    
                    setOrders(ordersArray);
                    setLoading(false);
                });
                
                return () => unsubscribe();
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast.error("Failed to load orders");
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = orders.filter((order) => {
        if (filter === "all") return true;
        if (filter === "new") return order.status.toLowerCase() === "pending";
        if (filter === "shipped") return order.status.toLowerCase() === "shipped";
        if (filter === "completed") return order.status.toLowerCase() === "completed";
        return false;
    });

    const searchedOrders = filteredOrders.filter((order) => {
        return (
            order.id.toLowerCase().includes(searchquery.toLowerCase()) || // Check Order ID
            `${order.user?.firstName || "N/A"} ${order.user?.lastName || ""}`
                .toLowerCase()
                .includes(searchquery.toLowerCase()) || // Check Customer Name
            new Date(order.createdAt).toLocaleDateString("en-GB").includes(searchquery) //check ordered date
        );
    });

    const pageCount = Math.ceil(searchedOrders.length / itemsPerPage);
    const currentItems = searchedOrders.slice(
        currentPage * itemsPerPage,
        currentPage * itemsPerPage + itemsPerPage
    );

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    const viewOrderDetails = (orderId) => {
        navigate(`/orderdetails/${orderId}`);
    };

    const handleCheckboxChange = (orderId) => {
        if (selectedorder.includes(orderId)) {
            setSelectedorder(selectedorder.filter((id) => id !== orderId));
        } else {
            setSelectedorder([...selectedorder, orderId]);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        const db = getFirestore();
        const orderRef = doc(db, "orders", orderId);
        const order = orders.find((o) => o.id === orderId);
        
        if (!order) {
            toast.error("Order not found");
            return;
        }

        // Define valid transitions
        const validTransitions = {
            pending: ["processing", "cancelled"],
            processing: ["shipped", "cancelled"],
            shipped: ["delivered", "completed"],
            delivered: ["completed"],
            cancelled: [],
            completed: []
        };

        const currentStatus = order.status.toLowerCase();
        
        if (!validTransitions[currentStatus]?.includes(status)) {
            toast.error(`Invalid status change from ${order.status} to ${status}`);
            return;
        }

        try {
            await updateDoc(orderRef, { 
                status: status,
                updatedAt: new Date().toISOString() 
            });
            
            // Update local state to reflect the change
            setOrders(orders.map(o => 
                o.id === orderId ? {...o, status: status} : o
            ));
            
            toast.success(`Order status updated to ${status}`);
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status");
        }
    };

    const handleBulkStatusUpdate = async () => {
        if (selectedorder.length === 0) {
            toast.warning("Please select at least one order");
            return;
        }

        try {
            await Promise.all(
                selectedorder.map(orderId => 
                    updateOrderStatus(orderId, multiplestatus)
                )
            );
            setSelectedorder([]);
        } catch (error) {
            console.error("Bulk update error:", error);
        }
    };

    const exportToExcel = () => {
        if (orders.length === 0) {
            toast.warning("No orders to export");
            return;
        }

        const formattedOrders = orders.map(order => ({
            "Order ID": order.id,
            "Customer": `${order.user?.firstName || ""} ${order.user?.lastName || ""}`,
            "Email": order.user?.email || "",
            "Phone": order.user?.phone || "",
            "Total Amount": order.total,
            "Status": order.status,
            "Payment Method": order.paymentMethod,
            "Date": new Date(order.createdAt).toLocaleDateString("en-GB"),
            "Address": `${order.shippingAddress?.address || ""}, ${order.shippingAddress?.city || ""}`
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedOrders);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
        XLSX.writeFile(workbook, "Orders.xlsx");
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading orders...</div>;
    }

    return (
        <div>
            <div className="md:ml-44 md:p-6 p-2 min-h-screen ">
                <div className="mx-auto max-w-screen-xl bg-white">
                    <h1 className=" mb-10 md:ml-20 text-2xl font-bold text-gray-900">Orders</h1>
                    <div className="bg-white py-5 md:px-3 md:ml-20 border-b-2">
                        <nav className="flex flex-wrap gap-4 ">
                            <button onClick={() => setFilter("all")} className='inline-flex whitespace-nowrap border-b-2 border-transparent py-2  text-xs md:text-base px-3  font-medium text-gray-600 transition-all duration-200 ease-in-out hover:border-b-yellow-600 hover:text-yellow-600 mx-auto md:mx-0'>All</button>
                            <button onClick={() => setFilter("new")} className='inline-flex whitespace-nowrap border-b-2 border-transparent py-2  text-xs md:text-base px-3  font-medium text-gray-600 transition-all duration-200 ease-in-out hover:border-b-yellow-600 hover:text-yellow-600 mx-auto md:mx-0'>New</button>
                            <button onClick={() => setFilter("shipped")} className='inline-flex whitespace-nowrap border-b-2 border-transparent  text-xs md:text-base py-2 px-3  font-medium text-gray-600 transition-all duration-200 ease-in-out hover:border-b-yellow-600 hover:text-yellow-600 mx-auto md:mx-0'>Shipped</button>
                            <button onClick={() => setFilter("completed")} className='inline-flex whitespace-nowrap border-b-2 border-transparent  text-xs md:text-base py-2 px-3 font-medium text-gray-600 transition-all duration-200 ease-in-out hover:border-b-yellow-600 hover:text-yellow-600 mx-auto md:mx-0'>Completed</button>
                        </nav>
                    </div>
                </div>
                <div className="">
                    <div className=" max-w-screen-xl md:ml-20">
                        <div className="mt-6 rounded-xl bg-gray-200 md:px-6 shadow border-b-2 border-black ">
                            <div className="flex flex-col md:flex-row w-full md:items-center justify-between gap-4 md:p-10">
                                <form className="relative flex w-full md:max-w-2xl items-center p-1">
                                    <svg className="absolute left-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <circle cx={11} cy={11} r={8} />
                                        <line x1={21} y1={21} x2="16.65" y2="16.65" />
                                    </svg>
                                    <input
                                        type="text"
                                        name="search"
                                        className="h-14 w-full rounded-md py-4 pr-40 pl-12 focus:outline-none border-none focus:ring-0 focus:border-b-2 focus:border-yellow-600"
                                        placeholder="Search with orderId | Customer name | Ordered date"
                                        value={searchquery}
                                        onChange={(e) => setSearchquery(e.target.value)}
                                    />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-600 px-6 py-2 text-white rounded-md">
                                        Search
                                    </button>
                                </form>

                                <div className="flex flex-wrap md:flex-nowrap items-center gap-2 mb-2 md:mt-0">
                                    <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                                        Export
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-end justify-end space-x-4 mb-4">
                                <select 
                                    value={multiplestatus} 
                                    onChange={(e) => setMultiplestatus(e.target.value)}
                                    className="rounded-xl px-2 py-2 border-none focus:outline-none focus:ring-2 focus:ring-yellow-600"
                                >
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                <button
                                    onClick={handleBulkStatusUpdate}
                                    className="bg-yellow-600 text-white px-4 py-2 rounded-md"
                                    disabled={selectedorder.length === 0}
                                >
                                    Apply to Selected
                                </button>
                            </div>
                            
                            <div className=" bg-white overflow-x-auto shadow-md rounded-lg">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr className="bg-yellow-600">
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedorder.length > 0 && selectedorder.length === currentItems.length}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedorder(currentItems.map((order) => order.id));
                                                        } else {
                                                            setSelectedorder([]);
                                                        }
                                                    }}
                                                />
                                            </th>
                                            <th className="md:px-6 md:py-3 text-left text-sm font-semibold text-black">
                                                Order ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                                                Customer Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                                                Total Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                                                Payment Method
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                                                Order Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                                                Ordered Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.length > 0 ? (
                                            currentItems.map((order) => (
                                                <tr key={order.id} className="border-b">
                                                    <td className="px-6 py-4 text-sm text-gray-800">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedorder.includes(order.id)}
                                                            onChange={() => handleCheckboxChange(order.id)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800">{order.id}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-800">
                                                        {`${order.billingAddress?.firstName || "N/A"} ${order.billingAddress?.lastName || ""}`}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800">
                                                        ₹{order.total}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800">
                                                        {order.paymentMethod}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold">
                                                        <span className={`px-2 py-1 rounded-full ${
                                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-red-100 text-red-800' // cancelled
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800">
                                                        {new Date(order.createdAt).toLocaleDateString("en-GB")}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-yellow-700 cursor-pointer">
                                                        <button
                                                            onClick={() => viewOrderDetails(order.id)}
                                                            className="underline hover:text-yellow-600"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-4 text-center text-gray-700">
                                                    No Orders Found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="mt-6 flex justify-end p-5">
                                <Pagination 
                                    pageCount={pageCount} 
                                    onPageChange={handlePageChange} 
                                    forcePage={currentPage}
                                />
                            </div>
                            
                            <ToastContainer
                                position="top-right"
                                autoClose={3000}
                                hideProgressBar={false}
                                newestOnTop
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderManagement