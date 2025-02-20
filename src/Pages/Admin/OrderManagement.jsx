import { getDatabase, onValue, ref, update } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import * as XLSX from "xlsx";


function OrderManagement() {

    const [orders, setOrders] = useState([])
    const [currentPage, setCurrentPage] = useState(0);
    const [searchquery, setSearchquery] = useState("")
    const [filter, setFilter] = useState("all");
    const [selectedorder, setSelectedorder] = useState([])
    const [multiplestatus, setMultiplestatus] = useState("processing")


    const navigate = useNavigate()
    const itemsPerPage = 10;

    useEffect(() => {
        const db = getDatabase();
        const ordersRef = ref(db, 'orders'); // Fetch all orders

        onValue(ordersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const ordersArray = [];

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

    const filteredOrders = orders.filter((order) => {
        if (filter === "all") return true;
        if (filter === "new") return order.orderStatus.toLowerCase() === "pending";
        if (filter === "shipped") return order.orderStatus.toLowerCase() === "shipped";
        if (filter === "completed") return order.orderStatus.toLowerCase() === "order completed";
        return false;
    });

    const searchedOrders = filteredOrders.filter((order) => {
        return (
            order.id.toLowerCase().includes(searchquery.toLowerCase()) || // Check Order ID
            `${order.user?.firstName || "N/A"} ${order.user?.lastName || ""}`
                .toLowerCase()
                .includes(searchquery.toLowerCase()) || // Check Customer Name
            new Date(order.timestamp).toLocaleDateString("en-GB").includes(searchquery) //check ordered date
        );
    });

    const pageCount = Math.ceil(searchedOrders.length / itemsPerPage);
    const currentItems = searchedOrders.slice(
        currentPage * itemsPerPage,
        currentPage * itemsPerPage + itemsPerPage
    );

    // const handlePageChange = ({ selected }) => {
    //     setCurrentPage(selected);
    // };

    const viewOrderDetails = (userId, orderId) => {
        navigate(`/orderdetails/${userId}/${orderId}`);
    };
    const handleCheckboxChange = (orderId) => {
        if (selectedorder.includes(orderId)) {

            setSelectedorder(selectedorder.filter((id) => id !== orderId));
        } else {

            setSelectedorder([...selectedorder, orderId]);
        }
    };
    const updateOrderStatus = async (userId, orderId, status) => {
        const db = getDatabase();
        const orderRef = ref(db, `orders/${userId}/${orderId}`);

        const order = orders.find((o) => o.id === orderId);
        if (!order) return toast.error("Order not found");

        // Define valid transitions
        const validTransitions = {
            pending: ["processing", "cancelled"],
            processing: ["shipped", "cancelled"],
            shipped: ["delivered"],
            delivered: ["order completed"],
            cancelled: [], // No further transitions allowed
            "order completed": [] // No further transitions allowed
        };

        if (!validTransitions[order.orderStatus]?.includes(status)) {
            return toast.error(`Invalid status change from ${order.orderStatus} to ${status}`);
        }

        try {
            await update(orderRef, { orderStatus: status });
            toast.success(`Order status updated to ${status}`);
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status");
        }
    };

    const handleBulkStatusUpdate = () => {
        selectedorder.forEach((selectedorder) => {
            // updateOrderStatus(orderId, multiplestatus);
            const order = orders.find((order) => order.id === selectedorder);
            if (order) {
                updateOrderStatus(order.userId, order.id, multiplestatus);
            }
        });
        setSelectedorder([]); // Clear selected orders


    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(orders);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

        // Save the file
        XLSX.writeFile(workbook, "Orders.xlsx");
    };
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

                                    {/* <button type="button"
                                        className="relative flex items-center px-5 py-2 text-sm font-medium border rounded-full bg-white hover:bg-gray-100 text-gray-800">
                                        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                        Filter
                                    </button> */}
                                    <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                                        Export
                                    </button>

                                </div>
                            </div>


                            <div className="flex items-end justify-end space-x-4 mb-4">
                                <select value={multiplestatus} onChange={(e) => setMultiplestatus(e.target.value)}
                                    className="rounded-xl px-2 py-2 border-none focus:outline-none focus:ring-2 focus:ring-yellow-600">
                                    {["pending", "processing", "shipped", "delivered", "cancelled", "order completed"].map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>

                                <button
                                    // onClick={()=>updateOrderStatus(orders.userId,orders.orderId,"processing")}
                                    onClick={handleBulkStatusUpdate}
                                    className="bg-yellow-600 text-white px-4 py-2 rounded-md"
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
                                                <tr key={order.id}>
                                                    <td className="px-6 py-4 text-sm text-gray-800">
                                                        <input
                                                            className=''
                                                            type="checkbox"
                                                            checked={selectedorder.includes(order.id)}
                                                            onChange={() => handleCheckboxChange(order.id)}
                                                        />

                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800">{order.id}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-800">
                                                        {`${order.user?.firstName || "N/A"} ${order.user?.lastName || ""}`}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800">
                                                        ₹{order.totalAmount}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800">
                                                        {order.paymentMethod}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800 font-semibold">
                                                        {order.orderStatus}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800 font-semibold">
                                                        {new Date(order.timestamp).toLocaleDateString("en-GB")}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-yellow-700 cursor-pointer">
                                                        <button
                                                            onClick={() =>
                                                                viewOrderDetails(order.userId, order.id)
                                                            }
                                                            className="underline"
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
                                <ReactPaginate
                                    previousLabel={"← Previous"}
                                    nextLabel={"Next →"}
                                    pageCount={pageCount}
                                    onPageChange={({ selected }) => setCurrentPage(selected)}
                                    containerClassName={"flex space-x-2"}
                                    pageClassName={"px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-200"}
                                    previousClassName={"px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-200"}
                                    nextClassName={"px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-200"}
                                    activeClassName={"bg-yellow-600 text-white"}
                                />
                            </div>
                            <ToastContainer
                                position="top-right"
                                autoClose={2000}
                                hideProgressBar={false}
                                newestOnTop={false}
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