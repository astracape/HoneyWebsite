import React, { useContext, useEffect, useState } from 'react'
import img from "../../assets/oatmeal-cookies-honey-jar-isolated-pastel-background-copy-space_176841-82698.jpg"
import { getAuth } from 'firebase/auth';
import { database } from '../../FirebaseConfig';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
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

    const changeQuantity = (productId, change) => {
        updateQuantity(productId, change);
    };
    const handleApplyCoupon = async () => {
        try {
            // Fetch coupons from Firestore
            const querySnapshot = await getDocs(collection(database, "coupons"));
            const coupons = querySnapshot.docs.map(doc => doc.data());

            // Find the entered coupon in Firestore data
            const coupon = coupons.find(c => c.code === couponCode);

            if (coupon) {
                applyCoupon(coupon);
                localStorage.setItem("appliedCoupon", JSON.stringify(coupon));
                alert("Coupon applied successfully!");
            } else {
                toast.error("Invalid coupon code.");
            }
        } catch (error) {
            console.error("Error fetching coupons:", error);
            toast.error("Error applying coupon.");
        }
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

    const getTotalWeight = (weightString, quantity) => {
        if (!weightString || !quantity) return '0';

        const unit = weightString.replace(/[0-9.]/g, '').toLowerCase(); // g or kg
        const value = parseFloat(weightString);

        if (isNaN(value)) return '0';

        const weightInGrams = unit === 'kg' ? value * 1000 : value;
        const totalGrams = weightInGrams * quantity;

        return totalGrams >= 1000
            ? `${(totalGrams / 1000).toFixed(2)}kg`
            : `${totalGrams}g`;
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
    // useEffect(() => {
    //     if (selectedRegion) {
    //         fetchShippingRate(selectedRegion);
    //         localStorage.setItem("selectedRegion", selectedRegion);
    //     }
    // }, [selectedRegion]);

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
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
                        <h2 className="text-3xl font-bold text-gray-800 my-6 border-l-4 border-yellow-600 pl-3 ">Items in Your Cart</h2>
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
                                                {/* <td className="py-4 px-4 text-center text-gray-700">{getTotalWeight(item.weight, item.quantity)}</td> */}

                                                <td className="py-4 px-4 text-center text-gray-700">₹{item.price}</td>
                                                <td className="py-4 px-4 text-center text-gray-700">₹{item.price * item.quantity}</td>
                                                <td className="py-4 px-4 text-center">
                                                    <button
                                                        onClick={() => handleRemove(item.id)}
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
                            <div className="mt-6 flex justify-end gap-6">
                                {/* <div>
                                    <h3 className="text-lg font-medium text-gray-700 border-l-2 border-yellow-600 px-3">DISCOUNT/PROMO CODE</h3>
                                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter Coupon Code" className="mt-6 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500" />
                                    <button onClick={handleApplyCoupon} className="mt-3 w-full border-dashed border-yellow-600 border-2 text-black p-3 rounded-lg font-semibold">Apply Coupon</button>
                                </div>

                                <div className="bg-white p-6 ">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Region</label> */}
                                {/* <select
                                        value={selectedRegion}
                                        onChange={(e) => setSelectedRegion(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                        required
                                    >
                                        <option value="">Select region</option>
                                        <option value="Tamil Nadu">Tamil Nadu</option>
                                        <option value="Karnataka">Karnataka</option>
                                        <option value="Other States">Other States</option>
                                    </select> */}
                                {/* <select
                                        value={selectedRegion}
                                        onChange={(e) => setSelectedRegion(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                        required
                                    >
                                        <option value="">Select State</option>
                                        {indianStates.map((state) => (
                                            <option key={state.isoCode} value={state.name}>
                                                {state.name}
                                            </option>
                                        ))}
                                    </select> */}

                                <div className="flex justify-between py-2 text-gray-700 font-semibold mt-4">
                                    <span>Subtotal:</span>
                                    <span>₹{calculateTotal()}</span>
                                </div>
                                {/* <div className="flex justify-between py-2 text-gray-700">
                                        <span>Shipping:</span>
                                        <span>₹{shippingRate}</span>
                                    </div>
                                    <div className="flex justify-between py-2 text-green-600">
                                        <span>Discount:</span>
                                        <span>-₹{discountAmount}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-t-2 text-lg font-bold text-yellow-700">
                                        <span>Total:</span>
                                        <span>₹{calculateFinalTotal()}</span>
                                    </div> */}
                                {/* <Link to="/checkout" className="block bg-yellow-600  text-white text-center p-3 rounded-lg font-semibold mt-3">Proceed to Checkout</Link> */}
                                <button
                                    onClick={handleProceedToCheckout}
                                    className="block bg-yellow-600  text-white text-center p-3 rounded-lg font-semibold mt-3"
                                >
                                    Proceed to Checkout
                                </button>

                                {/* </div> */}
                            </div>

                            <Pagination pageCount={pageCount} onPageChange={handlePageChange} />
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