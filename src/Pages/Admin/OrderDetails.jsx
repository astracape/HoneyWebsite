import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import img from "../../assets/orderd.jpg"
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { FiPrinter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function OrderDetails() {
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    const handlePrevImage = () => {
        setCurrentImageIndex(prev => (prev === 0 ? orderDetails.items.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev => (prev === orderDetails.items.length - 1 ? 0 : prev + 1));
    };
    return (
        <div>
            <div className="md:ml-64 md:p-6 p-2 min-h-screen">
                {/* <h2 className="text-4xl font-bold text-brandyellow mb-8">Order Details</h2> */}


                <div className="flex justify-end mb-6 p-5">
                    <button

                        onClick={() => window.print()}
                        className="bg-brandyellow text-white px-6 py-2 rounded-lg shadow-lg hover:bg-yellow-700 transition duration-300"
                    >
                        Print Order
                    </button>
                </div>


                <div id="printable" className="bg-white p-6 rounded-lg shadow-md">
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        <div>
                            <div className="border rounded-lg p-5">
                                <h3 className="text-sm text-gray-500">Order ID:&nbsp;<span className='font-bold text-black'>{orderDetails.id}</span></h3>
                                <p className="text-gray-700">
                                    <span className="text-sm text-gray-500">Status:</span>
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
                                <p className="text-gray-700"><span className="text-sm text-gray-500">Order Date:</span> {new Date(orderDetails.createdAt).toLocaleString()}</p>
                                <p className="text-gray-700"><span className="text-sm text-gray-500">Payment Method:</span> {orderDetails.paymentMethod}</p>
                            </div>

                            <div className="p-5 border rounded-lg mt-5">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">Shipping Address</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium">{orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Contact</p>
                                        <p className="font-medium">{orderDetails.shippingAddress.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{orderDetails.shippingAddress.email}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium">
                                            {orderDetails.shippingAddress.address}, {orderDetails.shippingAddress.city},<br />
                                            {orderDetails.shippingAddress.state}, {orderDetails.shippingAddress.country} - {orderDetails.shippingAddress.pinCode}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {orderDetails.billingAddress && (
                                <div className="mt-5 p-5 border rounded-lg">
                                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Billing Address</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p className="font-medium">{orderDetails.billingAddress.firstName} {orderDetails.billingAddress.lastName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Contact</p>
                                            <p className="font-medium">{orderDetails.billingAddress.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium">{orderDetails.billingAddress.email}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-500">Address</p>
                                            <p className="font-medium">
                                                {orderDetails.billingAddress.address}, {orderDetails.billingAddress.city},<br />
                                                {orderDetails.billingAddress.state}, {orderDetails.billingAddress.country} - {orderDetails.billingAddress.pinCode}
                                            </p>
                                        </div>
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
                                    <th className="py-3 px-4 font-medium text-black">Weight</th>
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
                                        <td className='py-4 px-4 text-gray-700'>{item.weight}</td>

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