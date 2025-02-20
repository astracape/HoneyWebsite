import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { database } from '../../FirebaseConfig';
import { get, getDatabase, ref, update } from 'firebase/database';
import { toast, ToastContainer } from 'react-toastify';
import img from "../../assets/orderd.jpg"

function OrderDetails() {
    const { orderId } = useParams();
    const { userId } = useParams();  // Fetch the orderId from the URL
    // Fetch the orderId from the URL
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);


    const updateOrderStatus = async (status) => {
        const db = getDatabase();
        const orderRef = ref(db, `orders/${userId}/${orderId}`);

        try {
            await update(orderRef, { orderStatus: status });
            toast.success(`Order status updated to ${status}`);
            setOrderDetails((prev) => ({ ...prev, orderStatus: status }));

        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status");
        }
    };

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const orderRef = ref(database, `orders/${userId}/${orderId}`);
                const snapshot = await get(orderRef);
                if (snapshot.exists()) {
                    setOrderDetails(snapshot.val());
                } else {
                    // Handle case when no data is found
                    console.error("No order data found");
                }
            } catch (error) {
                console.error("Error fetching order details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!orderDetails) {
        return <div>No order details found</div>;
    }
    return (
        <div>
            <div className="md:ml-64 md:p-6 p-2 min-h-screen">
                <h2 className="text-4xl font-bold text-yellow-600 mb-8">Order Details</h2>

                {/* Print Button */}
                <div className="flex justify-end mb-6 p-5">
                    <button
                        onClick={() => {
                            const printContent = document.getElementById("printable").innerHTML;
                            const originalContent = document.body.innerHTML;

                            // Replace body content with the printable section
                            document.body.innerHTML = printContent;
                            window.print();

                            // Restore original content
                            document.body.innerHTML = originalContent;
                        }}
                        className="bg-yellow-600 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-yellow-700 transition duration-300"
                    >
                        Print Order
                    </button>
                </div>

                {/* Printable Section */}

                <div
                    id="printable"
                    className="bg-white p-6 rounded-lg shadow-md">
                    <div className='grid grid-cols-2'>
                        <div>
                            <div className="mb-4">
                                <h3 className="text-xl font-medium">Order ID: {orderId}</h3>
                                <p className="text-gray-700">Order Status: {orderDetails.orderStatus}</p>
                                <p className="text-gray-700">Total Amount: ₹{orderDetails.cartItems.reduce((total, item) => total + parseFloat(item.price), 0)}</p>
                                <p className="text-gray-700">Payment Method: {orderDetails.paymentMethod}</p>
                            </div>

                            <h4 className="text-lg font-semibold mb-2">Customer Details</h4>
                            <div className="mb-4">
                                <p className="text-gray-700"><strong>Name:</strong> {orderDetails.user.firstName} {orderDetails.user.lastName}</p>
                                <p className="text-gray-700"><strong>Email:</strong> {orderDetails.user.email}</p>
                                <p className="text-gray-700"><strong>Phone:</strong> {orderDetails.user.phone}</p>
                                <p className="text-gray-700"><strong>Address:</strong> {orderDetails.user.address}</p>
                                <p className="text-gray-700"><strong>Apartment:</strong> {orderDetails.user.apartment}</p>
                                <p className="text-gray-700"><strong>City:</strong> {orderDetails.user.city}</p>
                                <p className="text-gray-700"><strong>State:</strong> {orderDetails.user.state}</p>
                                <p className="text-gray-700"><strong>Country:</strong> {orderDetails.user.country}</p>
                                <p className="text-gray-700"><strong>Pin Code:</strong> {orderDetails.user.pinCode}</p>
                            </div>
                        </div>
                        <div className='flex justify-center my-auto'>
                            <img src={img} className='w-64 h-64 rounded-full border-4 border-yellow-600'></img>
                            {/* <div className="flex gap-2 p-5">
                                <button
                                    className="px-2 py-1 bg-[#D98C00] text-white rounded hover:scale-95"
                                    onClick={() => updateOrderStatus('Processing')}
                                >
                                    Accept
                                </button>
                                <button
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:scale-95"
                                    onClick={() => updateOrderStatus('Shipped')}
                                >
                                    Shipped
                                </button>
                                <button
                                    className="px-2 py-1 bg-[#6C4600] text-white rounded hover:scale-95"
                                    onClick={() => updateOrderStatus('Order Completed')}
                                >
                                    Completed
                                </button>
                                <button
                                    className="px-2 py-1 bg-black text-white rounded hover:scale-95"
                                    onClick={() => updateOrderStatus('Rejected')}
                                >
                                    Reject
                                </button>
                            </div> */}
                        </div>
                    </div>
                    <h4 className="text-lg font-semibold mt-4 mb-2">Order Items</h4>

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-yellow-600 text-left">
                                    <th className="py-2 px-4 font-medium text-black">Product</th>
                                    <th className="py-2 px-4 font-medium text-black">Price</th>
                                    <th className="py-2 px-4 font-medium text-black">Quantity</th>
                                    <th className="py-2 px-4 font-medium text-black">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetails.cartItems && orderDetails.cartItems.map((item, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-4 px-4 flex items-center space-x-4">
                                            {item.imageUrl && (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-12 h-12 object-cover rounded border border-gray-200"
                                                />
                                            )}
                                            <span>{item.name}</span>
                                        </td>
                                        <td className="py-4 px-4 text-gray-700">₹{item.price}</td>
                                        <td className="py-4 px-4 text-gray-700">{item.quantity}</td>
                                        <td className="py-4 px-4 text-gray-700">₹{item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-lg font-semibold">Total Amount: ₹{orderDetails.cartItems.reduce((total, item) => total + parseFloat(item.price), 0)}</h4>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default OrderDetails