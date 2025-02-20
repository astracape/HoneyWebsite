import React, { useEffect, useState } from 'react'
import img1 from "../../assets/Group 70.png"
import { Country, State, City } from 'country-state-city';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getDatabase, onValue, push, ref, remove, set } from 'firebase/database';


function Checkout() {
    const [cartItems, setCartItems] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        country: '',
        state: '',
        city: '',
        address: '',
        apartment: '',
        pinCode: '',
        phone: '',
        email: '',
        paymentMethod: '',
    });
    // console.log(Country.getAllCountries())
    const navigate = useNavigate()
    const [country, setCountry] = useState(null);
    const [user, setUser] = useState()
    const [state, setState] = useState(null);
    const [city, setCity] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                // Fetch cart items from the database for the logged-in user
                const db = getDatabase();
                const cartRef = ref(db, `users/${currentUser.uid}/cart`);
                onValue(cartRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const cartData = snapshot.val();
                        setCartItems(Object.values(cartData)); // Convert Firebase object to array
                    } else {
                        setCartItems([]); // No cart items for logged user
                    }
                });
            } else {
                // Use sessionStorage for guests
                const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
                setCartItems(cart);
            }
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent duplicate submissions
        setIsSubmitting(true);

        // Early return if user is not logged in
        if (!user) {
            toast.warning("Please log in to place your order");
            navigate("/login");
            setIsSubmitting(false);
            return;
        }

        const orderDetails = createOrderDetails(formData, cartItems);

        try {
            if (formData.paymentMethod === "Razorpay") {
                await handleRazorpayPayment(orderDetails);
            } else if (formData.paymentMethod === "Cash on Delivery") {
                await handleCashOnDelivery(orderDetails);
            }
        } catch (error) {
            console.error("Error placing order:", error);
            toast.error("Error placing order. Please try again.");
        } finally {
            setIsSubmitting(false); // Reset submission flag
        }
    };

    // Helper function to create order details
    const createOrderDetails = (formData, cartItems) => {
        return {
            user: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                apartment: formData.apartment,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                pinCode: formData.pinCode,
            },
            // cartItems,
            cartItems: cartItems.map(item => ({
                ...item,
                // Store the total price per item based on quantity
            })),
            // totalAmount: cartItems.reduce((total, item) => total + parseFloat(item.price), 0),
            totalAmount: cartItems.length ? cartItems.reduce((total, item) => {
                const price = parseFloat(item.price);
                return total + (isNaN(price) ? 0 : price);
            }, 0) : 0,
            
            paymentMethod: formData.paymentMethod,
            orderStatus: "Pending",
            timestamp: new Date().toISOString(),
        };
    };

    // Helper function for Razorpay payment
    const handleRazorpayPayment = async (orderDetails) => {
        const orderAmount = orderDetails.totalAmount * 100; // Convert to paise
        const options = {
            key: "rzp_test_b5Ry0nM29Awoau",
            amount: orderAmount,
            currency: "INR",
            name: "Honey Store",
            description: "Test Transaction",
            image: "https://example.com/logo.png",
            handler: async (response) => {
                // On successful payment
                await saveOrderToDatabase(orderDetails);
                toast.success("Order Placed Successfully!");
                navigate("/successpage");
            },
            prefill: {
                name: `${orderDetails.user.firstName} ${orderDetails.user.lastName}`,
                email: orderDetails.user.email,
                contact: orderDetails.user.phone,
            },
            notes: {
                address: orderDetails.user.address,
            },
            theme: {
                color: "#F37254",
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
            console.error("Payment Failed:", response.error);
            toast.error("Payment Failed. Please try again.");
        });
        rzp.open();
    };

    // Helper function for Cash on Delivery
    const handleCashOnDelivery = async (orderDetails) => {
        await saveOrderToDatabase(orderDetails);
        await clearUserCart(user.uid);
        toast.success("Order Placed Successfully!");
        navigate("/successpage");
    };

    // Helper function to save order to Firebase
    // const saveOrderToDatabase = async (orderDetails) => {
    //     const db = getDatabase();
    //     const ordersRef = ref(db, `orders/${user.uid}`); // Centralized orders node

    //     // Push the order to the 'orders' node, with the userId included in the order
    //     const newOrderRef = push(ordersRef);  // Generate unique ID for order
    //     const orderData = {
    //         ...orderDetails,
    //         userId: user.uid, // Store the userId with the order
    //     };

    //     await set(newOrderRef, orderData); // Save the order with the userId in the database
    // };
    // Helper function to save order to Firebase with a short readable order ID
const saveOrderToDatabase = async (orderDetails) => {
    const db = getDatabase();

    // Generate a short custom order ID
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const randomString = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4-char random string
    const orderId = `ORD-${timestamp}-${randomString}`; // Example: ORD-654321-ABCD

    const orderData = {
        ...orderDetails,
        userId: user.uid, // Store user ID
        orderId: orderId, // Store custom order ID
    };

    // Save order with custom order ID as key
    await set(ref(db, `orders/${user.uid}/${orderId}`), orderData);
};


    // Helper function to clear user's cart from Firebase
    const clearUserCart = async (uid) => {
        const db = getDatabase();
        const userCartRef = ref(db, `users/${uid}/cart`);
        await remove(userCartRef);
    };

    return (
        <div>
            <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${img1})` }}>
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className='p-10 flex justify-center md:justify-start items-center h-full'>
                </div>
            </div>
            <div className="container mx-auto p-8 md:w-2/3">

                <div className="mb-8">


                    <h3 className="text-2xl font-semibold mb-4">Billing Details</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col">
                                <label htmlFor="firstName" className="text-gray-700">First Name *</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    className="mt-2 px-4 py-2 border rounded-md w-full"
                                    required
                                    onChange={handleInputChange}
                                    pattern="[A-Za-z\s]{2,50}"
                                    title="Name must contain only letters and be 2-50 characters long."
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="lastName" className="text-gray-700">Last Name *</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    className="mt-2 px-4 py-2 border rounded-md w-full"
                                    onChange={handleInputChange}
                                    required
                                    pattern="[A-Za-z\s]{2,50}"
                                    title="Name must contain only letters and be 2-50 characters long."
                                />
                            </div>
                        </div>



                        <div className="flex flex-col mt-4">
                            <label htmlFor="country" className="text-gray-700">Country / Region *</label>
                            <select
                                id="country"
                                name="country"
                                value={country?.isoCode || ""}
                                onChange={(e) => {
                                    const selectedCountry = Country.getAllCountries().find(c => c.isoCode === e.target.value);
                                    setCountry(selectedCountry);
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        country: selectedCountry ? selectedCountry.name : '',
                                    }));
                                }}
                                className="mt-2 px-4 py-2 border rounded-md w-full"
                                required
                            >
                                <option value="">Select Country</option>
                                {Country.getAllCountries().map((c) => (
                                    <option key={c.isoCode} value={c.isoCode}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col mt-4">
                            <label htmlFor="address" className="text-gray-700">Street Address *</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                className="mt-2 px-4 py-2 border rounded-md w-full"
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="flex flex-col mt-4">
                            <label htmlFor="apartment" className="text-gray-700">Apartment, Suite, Unit, etc. (optional)</label>
                            <input
                                type="text"
                                id="apartment"
                                value={formData.apartment}
                                name="apartment"
                                onChange={handleInputChange}
                                className="mt-2 px-4 py-2 border rounded-md w-full"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

                            <div className="flex flex-col">
                                <label htmlFor="state" className="text-gray-700">State *</label>
                                <select
                                    id="state"
                                    name="state"
                                    value={state?.isoCode || ""}
                                    onChange={(e) => {
                                        const selectedState = State.getStatesOfCountry(country?.isoCode).find(s => s.isoCode === e.target.value);
                                        setState(selectedState);
                                        setFormData((prevData) => ({
                                            ...prevData,
                                            state: selectedState ? selectedState.name : '',
                                        }));
                                    }}
                                    className="mt-2 px-4 py-2 border rounded-md w-full"
                                    required
                                >
                                    <option value="">Select State</option>
                                    {country &&
                                        State.getStatesOfCountry(country.isoCode).map((s) => (
                                            <option key={s.isoCode} value={s.isoCode}>
                                                {s.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="city" className="text-gray-700">Town / City *</label>
                                <select
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange
                                    }
                                    className="mt-2 px-4 py-2 border rounded-md w-full"
                                    required
                                >
                                    <option value="">Select City</option>
                                    {state &&
                                        City.getCitiesOfState(country.isoCode, state.isoCode).map((c) => (
                                            <option key={c.name} value={c.name}>
                                                {c.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div className="flex flex-col">
                                <label htmlFor="pinCode" className="text-gray-700">PIN Code *</label>
                                <input
                                    type="text"
                                    id="pinCode"
                                    name="pinCode"
                                    onChange={handleInputChange}
                                    className="mt-2 px-4 py-2 border rounded-md w-full"
                                    required
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="phone" className="text-gray-700">Phone *</label>
                                <input
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    onChange={handleInputChange}
                                    className="mt-2 px-4 py-2 border rounded-md w-full"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col mt-4">
                            <label htmlFor="email" className="text-gray-700">Email address *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                onChange={handleInputChange}
                                className="mt-2 px-4 py-2 border rounded-md w-full"
                                required
                            />
                        </div>




                        <div className="mt-6">
                            <h3 className="text-xl font-semibold mb-4">Payment Methods</h3>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Razorpay"
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    Razorpay (Credit/Debit Card / UPI)
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Cash on Delivery"
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    Cash on Delivery
                                </label>
                            </div>
                        </div>


                        <button
                            type="submit"
                            className="mt-8 py-3 px-6 bg-yellow-600 text-white font-semibold rounded-md w-1/3"
                        >
                            Place Order
                        </button>
                    </form>
                </div>


                <div className="mt-8 border-t pt-8">
                    <h3 className="text-xl font-semibold mb-4">Your Order</h3>
                    {cartItems.map((item, index) => (
                        <div className="flex justify-between mt-2" key={index}>
                            <span>{item.name}</span>
                            <span>₹{item.price}</span>
                        </div>
                    ))}

                </div>
            </div>
            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            // toastStyle={{
            //     borderRadius: "8px",
            //     border:"",
            //     padding: "15px",
            //   }}
            />
        </div>

    )
}

export default Checkout