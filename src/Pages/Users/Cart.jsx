import React, { useContext, useEffect, useState } from 'react'
import img from "../../assets/oatmeal-cookies-honey-jar-isolated-pastel-background-copy-space_176841-82698.jpg"
import { getAuth } from 'firebase/auth';
import { database } from '../../FirebaseConfig';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { CartContext } from '../../context/CartContext';
import Pagination from '../../Pagination/Pagination';
import { useNavigate } from 'react-router-dom';
import { CouponContext } from '../../context/CouponContext';
import { State } from 'country-state-city';
function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const { applyCoupon, fetchShippingRate, calculateFinalTotal, shippingRate, discountAmount } = useContext(CouponContext);
    const [couponCode, setCouponCode] = useState("");
    const { cart, updateQuantity, removeFromCart } = useContext(CartContext)
    const itemsPerPage = 10;
    const auth = getAuth();
    const indianStates = State.getStatesOfCountry("IN");
    const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
    const changeQuantity = (productId, change) => {
        updateQuantity(productId, change);
    };

    const navigate = useNavigate();

    const handleProceedToCheckout = () => {
        const user = auth.currentUser;
        if (user) {
            navigate("/checkout");
        } else {
            navigate("/login");
        }
    };


    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const handleRemove = (productId) => {
        removeFromCart(productId);
        //Update cart state after deletion
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };
    const pageCount = Math.ceil(cart.length / itemsPerPage);
    const currentItems = cart.slice(
        currentPage * itemsPerPage,
        currentPage * itemsPerPage + itemsPerPage
    );
 

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };
const confirmRemove = () => {
    if (deleteModal.item) {
        handleRemove(deleteModal.item.id);
        setDeleteModal({ show: false, item: null });
    }
};

    return (
        <div>
            <div className="flex flex-col">
                <section className="relative h-96 bg-cover bg-center w-full" style={{ backgroundImage: `url(${img})` }}>
                    <div className="absolute inset-0 bg-black opacity-60"></div>
                    <div className="relative flex items-center justify-center h-full">
                        <h1 className="text-white text-4xl font-extrabold tracking-wide">Cart</h1>
                    </div>
                </section>

                <div className="w-full max-w-6xl mx-auto px-6 py-8 ">
                    <div className='h-24 mt-10'>
                        <h2 className="text-3xl font-bold text-gray-800 my-6 border-l-4 border-brandyellow pl-3 ">Items in Your Cart</h2>
                    </div>
                    {cart.length > 0 ? (
                        <div className="">

                            <div className='overflow-x-auto'>
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="py-3 px-4 font-medium text-gray-700">Product</th>
                                            <th className="py-3 px-4 font-medium text-gray-700">Quantity</th>
                                            <th className="py-3 px-4 font-medium text-gray-700">Weight</th>
                                            <th className="py-3 px-4 font-medium text-gray-700">Price</th>
                                            <th className="py-3 px-4 font-medium text-gray-700">Total</th>
                                            <th className="py-3 px-4 font-medium text-gray-700">Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((item, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="py-4 px-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 ">
                                                    <Link to={`/singleproduct/${item.id}`}>
                                                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md mx-auto sm:mx-0" /></Link>
                                                    <span className="text-gray-800 text-center sm:text-left mt-2 sm:mt-0">{item.name}</span>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <div className="flex justify-center space-x-3">
                                                        <button
                                                            onClick={() => changeQuantity(item.id, -1)}
                                                            className="bg-gray-100 text-xl text-gray-600 p-2 rounded-full hover:bg-gray-200 transition duration-200"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="text-lg font-semibold">{item.quantity}</span>
                                                        <button
                                                            onClick={() => changeQuantity(item.id, 1)}
                                                            className="bg-gray-100 text-xl text-gray-600 p-2 rounded-full hover:bg-gray-200 transition duration-200"
                                                        >
                                                            +
                                                        </button>

                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center text-gray-700">{item.weight}</td>


                                                <td className="py-4 px-4 text-center text-gray-700">₹{(item.price).toLocaleString("en-IN")}</td>
                                                <td className="py-4 px-4 text-center text-gray-700">₹{(item.price * item.quantity).toLocaleString("en-IN")}</td>
                                                <td className="py-4 px-4 text-center">
                                                    <button
                                                        onClick={() => setDeleteModal({ show: true, item })}
                                                        className="text-red-500 text-2xl hover:text-red-700"
                                                    >
                                                        &times;
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-amber-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-amber-700">
                                        All discounts and shipping prices will be calculated during checkout.

                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">

                                <Link
                                    to="/productpage"
                                    className="flex items-center bg-white border border-brandyellow text-brandyellow hover:bg-brandyellow hover:text-white px-4 py-2 rounded-lg transition duration-200 flex-shrink-0"
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Continue Shopping
                                </Link>
                                <div className="flex items-center flex-col md:flex-row gap-6">
                                    <div className="text-right">
                                        <div className="flex justify-between items-center gap-4">
                                            <span className="text-gray-700 font-semibold">Subtotal:</span>
                                            <span className="text-gray-700 font-semibold">₹{calculateTotal().toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleProceedToCheckout}
                                        className="bg-brandyellow hover:bg-amber-500 text-white px-6 py-2 rounded-lg font-semibold transition duration-200 whitespace-nowrap"
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </div>

                            <Pagination pageCount={pageCount} onPageChange={handlePageChange} />
                        </div>
                    ) : (
                        // <p className="text-center mt-6 text-lg text-gray-600">Your cart is empty.</p>
                        <div className="text-center py-12">
                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h2 className="mt-4 text-2xl font-medium text-gray-900">Your cart is empty</h2>
                            <p className="mt-2 text-gray-500">Start adding some delicious items to your cart</p>
                            <div className="mt-6">
                                <Link
                                    to="/productpage"
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brandyellow hover:bg-amber-500 focus:outline-none"
                                >
                                    Browse Products
                                    <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                        <p className="mb-4">Remove {deleteModal.item?.name} from cart?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, item: null })}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemove}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer
                position="bottom-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    )
}

export default Cart
