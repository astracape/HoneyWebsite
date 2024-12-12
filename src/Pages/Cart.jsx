import React, { useEffect, useState } from 'react'
import img from "../assets/oatmeal-cookies-honey-jar-isolated-pastel-background-copy-space_176841-82698.jpg"
import { getAuth } from 'firebase/auth';
import { database } from '../FirebaseConfig';
import { get, ref, set } from 'firebase/database';

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const auth = getAuth();
    useEffect(() => {
        const fetchCartItems = async () => {
            const user = auth.currentUser;

            if (user) {
                // Fetch cart from Firebase for logged-in users
                const userId = user.uid;
                const userCartRef = ref(database, `users/${userId}/cart`);
                try {
                    const snapshot = await get(userCartRef);
                    const cartData = snapshot.val() || [];
                    const updatedCart = cartData.map(item => ({
                        ...item,
                        quantity: Number(item.quantity) || 1,  // Default to 1 if invalid
                        totalPrice: (Number(item.price) || 0) * (Number(item.quantity) || 1), // Calculate total price
                    }));
                    setCartItems(updatedCart);
                } catch (error) {
                    console.error("Error fetching cart data:", error);
                }
            } else {
                // Fetch cart from localStorage for unlogged users
                const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
                const updatedCart = storedCart.map(item => ({
                    ...item,
                    quantity: Number(item.quantity) || 1,  // Default to 1 if invalid
                    totalPrice: (Number(item.price) || 0) * (Number(item.quantity) || 1), // Calculate total price
                }));
                setCartItems(updatedCart);
            }
        };

        fetchCartItems();
    }, [auth]);


    const updateCart = (updatedCart) => {
        const user = auth.currentUser;

        if (user) {
            // Update Firebase for logged-in users
            const userId = user.uid;
            const userCartRef = ref(database, `users/${userId}/cart`);
            set(userCartRef, updatedCart);
        } else {
            // Update localStorage for unlogged users
            localStorage.setItem('cart', JSON.stringify(updatedCart));
        }

        setCartItems(updatedCart);
    };

    const changeQuantity = (index, change) => {
        const updatedCart = cartItems.map((item, i) => (
            i === index ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
        ));
        updateCart(updatedCart);
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const deleteItem = (index) => {
        const updatedCart = cartItems.filter((_, i) => i !== index);
        updateCart(updatedCart);
    };
    return (
        <div>
            <div className="flex flex-col items-center">
                <section className="relative h-96 bg-cover bg-center w-full" style={{ backgroundImage: `url(${img})` }}>
                    <div className="absolute inset-0 bg-black opacity-60"></div>
                    <div className="relative flex items-center justify-center h-full">
                        <h1 className="text-white text-4xl font-extrabold tracking-wide">Cart</h1>
                    </div>
                </section>

                <div className="w-full max-w-6xl mx-auto px-6 py-8 ">
                    <div className='h-24 mt-10'>
                        <h2 className="text-3xl font-semibold  text-left text-yellow-800 underline italic ">Items in Your Cart</h2>
                    </div>
                    {cartItems.length > 0 ? (
                        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-100 text-center">
                                        <th className="py-3 px-4 font-medium text-gray-700">Product</th>
                                        <th className="py-3 px-4 font-medium text-gray-700">Quantity</th>
                                        <th className="py-3 px-4 font-medium text-gray-700">Price</th>
                                        <th className="py-3 px-4 font-medium text-gray-700">Total</th>
                                        <th className="py-3 px-4 font-medium text-gray-700">Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((item, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="py-4 px-4 flex justify-center items-center space-x-4">
                                                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                                                <span className="text-gray-800">{item.name}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex justify-center space-x-3">
                                                    <button
                                                        onClick={() => changeQuantity(index, -1)}
                                                        className="bg-gray-100 text-xl text-gray-600 p-2 rounded-full hover:bg-gray-200 transition duration-200"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="text-lg font-semibold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => changeQuantity(index, 1)}
                                                        className="bg-gray-100 text-xl text-gray-600 p-2 rounded-full hover:bg-gray-200 transition duration-200"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center text-gray-700">₹{item.price}</td>
                                            <td className="py-4 px-4 text-center text-gray-700">₹{item.price * item.quantity}</td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => deleteItem(index)}
                                                    className="text-red-500 text-2xl hover:text-red-700"
                                                >
                                                    &times;
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end mt-6">
                                <div className="flex items-center space-x-6 p-5">
                                    <div className="text-2xl font-semibold">Total: ₹{calculateTotal()}</div>
                                    <button
                                        // onClick={handleCheckout}
                                        className="bg-yellow-600 text-white  px-8 py-3 rounded-lg shadow-lg  transition duration-300"
                                    >
                                        <a href='/checkout'>Checkout</a>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center mt-6 text-lg text-gray-600">Your cart is empty.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Cart