import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from '../FirebaseConfig';
import img from "../assets/composition-with-delicious-fermented-drinks.jpg";
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log("No user is currently logged in.");
        setOrders([]);
        setLoadingOrders(false);
        return;
      }

      const ordersRef = collection(database, "orders");
      const ordersQuery = query(
        ordersRef,
        where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
      );

      const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        const userOrders = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            orderId: data.orderId,
            // Use total instead of totalAmount if that's what's in your database
            totalAmount: data.total || data.totalAmount,
            timestamp: data.createdAt || data.timestamp,
            orderStatus: data.status || data.orderStatus,
            cartItems: data.items || data.cartItems || [],
            user: data.user || {},
            shippingAddress: data.shippingAddress || {},
            billingAddress: data.billingAddress || {}
          };
        });
        setOrders(userOrders);
        setLoadingOrders(false);
      });

      return () => unsubscribeOrders();
    });

    return () => unsubscribeAuth();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return "Unknown date";
    }
  };

  return (
    <div>
      <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}>
        <div className='p-10 flex justify-center md:justify-end items-center h-full'>
          <div className='font-thin text-7xl bebas-neue-regular'>Order History</div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-6xl border-t-2 p-3 mt-4">
        {loadingOrders ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-600 text-xl">No orders found.</p>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/50 backdrop-blur-lg shadow-lg border border-gray-200 rounded-xl p-6 transition-all"
              >
                <div className="flex flex-wrap justify-between items-center border-b border-gray-300 pb-4 mb-4">
                  <div>
                    <p className="text-xs md:text-base font-semibold text-gray-800">
                      Order ID: <span className="text-yellow-600 text-xs md:text-base">{order.orderId}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {formatDate(order.timestamp)}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{order.totalAmount?.toFixed(2) || '0.00'}
                  </p>
                </div>
                
                <div className="grid gap-4">
                  {order.cartItems?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <img
                        src={item.imageUrl || "placeholder-image.jpg"}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover shadow-md"
                        onError={(e) => {
                          e.target.src = "placeholder-image.jpg";
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="text-xs md:text-sm font-medium text-gray-700">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} | ₹{item.price}
                        </p>
                        {item.weight && (
                          <p className="text-xs text-gray-400">
                            Weight: {item.weight}
                          </p>
                        )}
                      </div>
                      <button
                        className="text-yellow-600 hover:underline text-xs md:text-sm border-l-2 p-3"
                        onClick={() => navigate(`/singleproduct/${item.id}`)}
                      >
                        View Product
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Shipped to: {order.shippingAddress?.city}, {order.shippingAddress?.state}
                    </p>
                  </div>
                  <span
                    className={`inline-block text-sm font-semibold px-3 py-1 rounded-full 
                      ${order.orderStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : order.orderStatus === "Order Confirmed"
                          ? "bg-green-100 text-green-600"
                          : order.orderStatus === "Shipped"
                            ? "bg-blue-100 text-blue-600"
                            : order.orderStatus === "Completed"
                              ? "bg-purple-100 text-purple-600"
                              : order.orderStatus === "Delivered"
                                ? "bg-green-200 text-green-700"
                                : order.orderStatus === "Cancelled"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;