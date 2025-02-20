import { getDatabase, onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { auth } from '../FirebaseConfig';
import img from "../assets/composition-with-delicious-fermented-drinks.jpg"
import ohh from "../assets/ohh.png"
function OrderHistory() {
  const [orders, setOrders] = useState([null]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const navigate = useNavigate();
  const itemsPerPage = 3;
  useEffect(() => {
    const user = auth.currentUser; // Get the current logged-in user

    // if (!user) {
    //   // Redirect to login if the user is not logged in
    //   navigate("/login");
    //   return;
    // }
    if (user) {
      console.log("Current User UID:", user.uid);
    } else {
      console.log("No user is currently logged in.");
    }

    const db = getDatabase();
    const ordersRef = ref(db, `orders/${user.uid}`);

    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log("Orders Data:", snapshot.val());
        const data = snapshot.val();
        console.log("No orders found for user:", user.uid);
        const userOrders = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        const sortedOrders = [...userOrders].sort((a, b) =>
          new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
        )
        setOrders(sortedOrders);
      } else {
        setOrders([]); // No orders found
      }
      setLoadingOrders(false);
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, [navigate]);

  // if (loadingOrders) {
  //   return <p className="text-center text-gray-500">Loading your order history...</p>;
  // }

  // if (orders.length === 0) {
  //   return <p className="text-center text-gray-600 mt-64 md:mt-96">No orders found.</p>;
  // }
  // const pageCount = Math.ceil(sortedProducts.length / itemsPerPage);
  // const currentItems = sortedProducts.slice(
  //     currentPage * itemsPerPage,
  //     currentPage * itemsPerPage + itemsPerPage

  // )
  return (
    <div>
      <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}>
        <div className='p-10 flex justify-center md:justify-end items-center h-full'>
          <div className='font-thin text-7xl bebas-neue-regular'>Order History</div>
        </div>
      </div>

      <div className="container  mx-auto px-6 py-12 max-w-6xl border-t-2 p-3 mt-4">
        {/* <div>
          <img src={ohh} className='rounded-lg w-96 h-96 p-3 border-2'></img>
        </div> */}
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
                      Order ID: <span className="text-yellow-600 text-xs md:text-base">{order.id}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(order.timestamp).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{order.totalAmount}
                  </p>
                </div>
                <div className="grid gap-4">
                  {(order.cartItems ? Object.values(order.cartItems) : []).map(
                    (item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <img
                          src={item.imageUrl || "placeholder-image.jpg"}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover shadow-md"
                        />
                        <div className="flex-1">
                          <h3 className="text-xs md:text-sm font-medium text-gray-700">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} | ₹{item.price}
                          </p>
                        </div>
                        <button
                          className="text-yellow-600 hover:underline text-xs md:text-sm border-l-2 p-3"
                          onClick={() => navigate(`/singleproduct/${item.id}`)}
                        >
                          View Product
                        </button>
                      </div>
                    )
                  )}
                </div>
                <div className="mt-4 text-right">
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
  )
}

export default OrderHistory