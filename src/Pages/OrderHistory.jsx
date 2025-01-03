import { getDatabase, onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { auth } from '../FirebaseConfig';
import img from "../assets/composition-with-delicious-fermented-drinks.jpg"

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const navigate = useNavigate();

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
        setOrders(userOrders);
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
  return (
    <div>
       <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}>
                      <div className='p-10 flex justify-center md:justify-end items-center h-full'>
                          <div className='font-thin text-7xl bebas-neue-regular'>Order History</div>
                      </div>
                  </div>
      
      <div className="container mx-auto px-6 py-8">
  {/* <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">Order History</h1> */}
  {loadingOrders ? (
    <p className="text-center text-gray-500">Loading...</p>
  ) : orders.length === 0 ? (
    <p className="text-center text-gray-500">No orders found.</p>
  ) : (
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-gray-300 rounded-lg bg-white md:p-6 p-2"
        >
          <div className="flex flex-col md:flex-row justify-between items-center rounded-lg pb-4 mb-4 bg-[#bf89022c] p-5">
            <div>
              <p className="md:text-lg font-semibold text-gray-800">
                Order Number: {order.id}
              </p>
              <p className="text-sm text-gray-500">
                Date Placed: {new Date(order.timestamp).toLocaleDateString()}
              </p>
            </div>
            <div className="md:text-right">
              <p className="text-lg font-bold  text-gray-800">
                Total Amount: ₹{order.totalAmount}
              </p>
             
            </div>
          </div>
          <div className="space-y-4">
            {order.cartItems.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center">
                <img
                  src={item.imageUrl || "placeholder-image.jpg"}
                  alt={item.name}
                  className="w-20 h-20 rounded-md object-cover mr-4"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity} | ₹{item.price}
                  </p>
                </div>
                <button
                  className="text-yellow-700 underline text-sm"
                  onClick={() => navigate(`/singleproduct/${item.id}`)}
                >
                  View Product
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p
              className={`text-sm font-semibold ${
                order.orderStatus === "Pending"
                  ? "text-yellow-500"
                  : order.orderStatus === "Accepted"
                  ? "text-green-500"
                  : order.orderStatus === "Completed"
                  ? "text-blue-500"
                  : "text-red-500"
              }`}
            >
              Status: {order.orderStatus}
            </p>
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