import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import img from "../../assets/orderd.jpg"
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { toast } from 'react-toastify';


function OrderDetails() {
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);


    const database = getFirestore();
    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) return;
            try {
                const orderRef = doc(database, "orders", orderId);
                const snapshot = await getDoc(orderRef);
                if (snapshot.exists()) {
                    setOrderDetails({ id: snapshot.id, ...snapshot.data() });
                } else {
                    toast.error("No order data found");
                }
            } catch (error) {
                toast.error("Error fetching order details");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading order details...</div>;
    }

    if (!orderDetails) {
        return <div className="flex justify-center items-center h-screen text-red-500">No order details found</div>;
    }

    // Calculate totals
    const subtotal = orderDetails.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const total = subtotal + (orderDetails.shipping || 0) - (orderDetails.discount || 0);

    return (
        <div>
            <div className="md:ml-64 md:p-6 p-2 min-h-screen">
                <h2 className="text-4xl font-bold text-brandyellow mb-8">Order Details</h2>

                {/* Print Button */}
                <div className="flex justify-end mb-6 p-5">
                    <button
                        // onClick={() => {
                        //     const printContent = document.getElementById("printable").innerHTML;
                        //     const originalContent = document.body.innerHTML;

                        //     document.body.innerHTML = printContent;
                        //     window.print();
                        //     document.body.innerHTML = originalContent;
                        // }}
                        onClick={() => window.print()}
                        className="bg-brandyellow text-white px-6 py-2 rounded-lg shadow-lg hover:bg-yellow-700 transition duration-300"
                    >
                        Print Order
                    </button>
                </div>

                {/* Printable Section */}
                <div id="printable" className="bg-white p-6 rounded-lg shadow-md">
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        <div>
                            <div className="mb-6">
                                <h3 className="text-xl font-medium">Order ID: {orderDetails.id}</h3>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Status:</span>
                                    <span className={`ml-2 px-2 py-1 rounded-full ${orderDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        orderDetails.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                            orderDetails.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                orderDetails.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    orderDetails.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-red-100 text-red-800'
                                        }`}>
                                        {orderDetails.status}
                                    </span>
                                </p>
                                <p className="text-gray-700"><span className="font-semibold">Order Date:</span> {new Date(orderDetails.createdAt).toLocaleString()}</p>
                                <p className="text-gray-700"><span className="font-semibold">Payment Method:</span> {orderDetails.paymentMethod}</p>
                            </div>

                            <div className="mb-6 p-4 border rounded-lg">
                                <h4 className="text-lg font-semibold mb-3 text-brandyellow border-b pb-2">Shipping Address</h4>
                                <div className="text-gray-700 space-y-2">
                                    <p><span className="font-medium">Name:</span> {orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}</p>
                                    <p><span className="font-medium">Email:</span> {orderDetails.shippingAddress.email}</p>
                                    <p><span className="font-medium">Phone:</span> {orderDetails.shippingAddress.phone}</p>
                                    <p><span className="font-medium">Address:</span> {orderDetails.shippingAddress.address}</p>
                                    <p><span className="font-medium">City:</span> {orderDetails.shippingAddress.city}</p>
                                    <p><span className="font-medium">State:</span> {orderDetails.shippingAddress.state}</p>
                                    <p><span className="font-medium">Country:</span> {orderDetails.shippingAddress.country}</p>
                                    <p><span className="font-medium">Pin Code:</span> {orderDetails.shippingAddress.pinCode}</p>
                                </div>
                            </div>


                            {orderDetails.billingAddress && (
                                <div className="mb-6 p-4 border rounded-lg">
                                    <h4 className="text-lg font-semibold mb-3 text-brandyellow border-b pb-2">Billing Address</h4>
                                    <div className="text-gray-700 space-y-2">
                                        <p><span className="font-medium">Name:</span> {orderDetails.billingAddress.firstName} {orderDetails.billingAddress.lastName}</p>
                                        <p><span className="font-medium">Email:</span> {orderDetails.billingAddress.email}</p>
                                        <p><span className="font-medium">Phone:</span> {orderDetails.billingAddress.phone}</p>
                                        <p><span className="font-medium">Address:</span> {orderDetails.billingAddress.address}</p>
                                        <p><span className="font-medium">City:</span> {orderDetails.billingAddress.city}</p>
                                        <p><span className="font-medium">State:</span> {orderDetails.billingAddress.state}</p>
                                        <p><span className="font-medium">Country:</span> {orderDetails.billingAddress.country}</p>
                                        <p><span className="font-medium">Pin Code:</span> {orderDetails.billingAddress.pinCode}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='flex flex-col'>
                            <div className='flex justify-center mb-6'>
                                <img src={img} className='w-64 h-64 rounded-full border-4 border-brandyellow object-cover' alt="Order" />
                            </div>


                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-semibold mb-3 text-brandyellow border-b pb-2">Order Summary</h4>
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    {orderDetails.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount:</span>
                                            <span>-₹{orderDetails.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Shipping:</span>
                                        <span>₹{orderDetails.shipping?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                        <span>Total:</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h4 className="text-lg font-semibold mt-8 mb-4 text-brandyellow">Order Items</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-brandyellow text-left">
                                    <th className="py-3 px-4 font-medium text-black">Product</th>
                                    <th className="py-3 px-4 font-medium text-black">Price</th>
                                    <th className="py-3 px-4 font-medium text-black">Quantity</th>
                                    <th className="py-3 px-4 font-medium text-black">Shipping Rate</th>

                                    <th className="py-3 px-4 font-medium text-black">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetails.items.map((item, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-10 flex space-x-4 justify-center items-center ">
                                            {item.imageUrl && (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-12 h-12 object-cover rounded border border-gray-200"
                                                />
                                            )}
                                            <span className="">{item.name}</span>
                                        </td>



                                        <td className="py-4 px-4 text-gray-700">₹{Number(item.price).toFixed(2)}</td>
                                        <td className="py-4 px-4 text-gray-700">{item.quantity}</td>
                                        {/* Merge Total cell only once */}
                                        {index === 0 && (
                                            <td
                                                className="py-4 px-4 text-gray-700"
                                                rowSpan={orderDetails.items.length}
                                            >
                                                ₹{orderDetails.shipping?.toFixed(2) || '0.00'}
                                            </td>
                                        )}
                                        {index === 0 && (
                                            <td className="py-4 px-4 text-gray-700 font-medium" rowSpan={orderDetails.items.length}>
                                                ₹{total.toFixed(2)}
                                            </td>
                                        )}

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails