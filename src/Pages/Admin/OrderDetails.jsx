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
                <h2 className="text-4xl font-bold text-brandyellow mb-8">Order Details</h2>


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

            {/* <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <FiPrinter className="text-lg" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <FiX className="text-xl text-gray-500" />
            </button>
          </div>
        </div>

       
        <div className="overflow-y-auto p-6" id="printable">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
            <div className="lg:col-span-2 space-y-6">
          
              <div className="bg-gray-50 p-5 rounded-lg border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order Number</p>
                    <p className="font-medium">{orderDetails.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">{new Date(orderDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-medium inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                      orderDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      orderDetails.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      orderDetails.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      orderDetails.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">{orderDetails.paymentMethod}</p>
                  </div>
                </div>
              </div>

            
              <div className="border rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Shipping Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{orderDetails.shippingAddress.phone}</p>
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
                <div className="border rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Billing Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{orderDetails.billingAddress.firstName} {orderDetails.billingAddress.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium">{orderDetails.billingAddress.phone}</p>
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

              <div className="border rounded-lg overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-800 p-5 border-b">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orderDetails.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.imageUrl && (
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img className="h-10 w-10 rounded-md object-cover" src={item.imageUrl} alt={item.name} />
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{Number(item.price).toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
           
              <div className="relative border rounded-lg overflow-hidden">
                {orderDetails.items[currentImageIndex]?.imageUrl && (
                  <>
                    <img 
                      src={orderDetails.items[currentImageIndex].imageUrl} 
                      alt={orderDetails.items[currentImageIndex].name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-between p-2">
                      <button 
                        onClick={handlePrevImage}
                        className="bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition"
                      >
                        <FiChevronLeft className="text-gray-800 text-xl" />
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition"
                      >
                        <FiChevronRight className="text-gray-800 text-xl" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                      {orderDetails.items.map((_, index) => (
                        <button 
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

             
              <div className="border rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {orderDetails.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{orderDetails.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">₹{orderDetails.shipping?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="border-t pt-3 mt-2 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

      
              <div className="border rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Shipping Details</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Shipping Method</p>
                    <p className="font-medium">{orderDetails.shippingMethod || 'Standard Shipping'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-medium">
                      {orderDetails.estimatedDelivery ? 
                        new Date(orderDetails.estimatedDelivery).toLocaleDateString() : 
                        '3-5 business days'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  */}

            {/* // Usage example:
// const [showOrderModal, setShowOrderModal] = useState(false);
// {showOrderModal && <OrderDetailsModal orderDetails={orderData} onClose={() => setShowOrderModal(false)} />} */}
        </div>
    )
}

export default OrderDetails