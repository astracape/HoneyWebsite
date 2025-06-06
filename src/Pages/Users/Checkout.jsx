import React, { useContext, useEffect, useState } from 'react'
import img1 from "../../assets/Group 70.png"
import { Country, State, City } from 'country-state-city';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, database } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { CartContext } from '../../context/CartContext';
import { ShippingContext } from '../../context/ShippingContext';
import { CouponContext } from '../../context/CouponContext';
import { useCheckout } from '../../context/CheckoutContext';

function Checkout() {
    const { cart } = useContext(CartContext)
    const { updateShipping, checkoutData, setUseSameAddress, setBillingComplete } = useCheckout();
    const useSameAddress = checkoutData.useSameAddress;
    const [formData, setFormData] = useState(checkoutData.shipping || {
        firstName: '',
        lastName: '',
        country: 'India',
        state: '',
        city: '',
        address: '',
        apartment: '',
        pinCode: '',
        phone: '',
        email: '',
        paymentMethod: '',
        shippingType: '',
    });
    // console.log(Country.getAllCountries())
    const { shippingTypes, fetchShippingRate, fetchShippingTypes, shippingRate, loading: shippingLoading,
        error: shippingError, } = useContext(ShippingContext);
    const navigate = useNavigate()
    const [country, setCountry] = useState(null);
    const [user, setUser] = useState()
    const [state, setState] = useState(null);
    const [city, setCity] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const indianStates = State.getStatesOfCountry("IN");
    const { discountAmount, applyCoupon } = useContext(CouponContext)
    const { getTotalWeight, getCartTotalWeight } = useContext(CartContext)
    const [couponCode, setCouponCode] = useState("");
    const [billingData, setBillingData] = useState(null);
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchShippingTypes();

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, []);
    const handleUseSameAddressChange = (e) => {
        setUseSameAddress(e.target.checked);
    };

    useEffect(() => {
        if (formData.state && formData.shippingType) {
            fetchShippingRate(formData.state, formData.shippingType);
        }
    }, [formData.state, formData.shippingType]);
    // useEffect(() => {
    //   if (checkoutData.billing) {
    //     setBillingData(checkoutData.billing);
    //   }
    // }, [checkoutData.billing]);

    useEffect(() => {
        if (state && country) {
            const cities = City.getCitiesOfState(country.isoCode, state);
            setCity(cities);
        }
    }, [state, country]);

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        const updatedForm = { ...formData, [name]: value };
        setFormData(updatedForm);
        console.log("Trying to match: region =", state, "| type =", shippingType);

        if (
            (name === "state" || name === "shippingType") &&
            updatedForm.state &&
            updatedForm.shippingType
        ) {
            await fetchShippingRate(updatedForm.state, updatedForm.shippingType);
        }
    };

    const calculateFinalTotal = () => {
        const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        const total = subtotal + (shippingRate || 0) - (discountAmount || 0);
        return total > 0 ? total : 0;
    };
    console.log(shippingRate)
    const validateForm = () => {
        const requiredFields = [
            'firstName', 'lastName', 'country', 'state',
            'city', 'address', 'pinCode', 'phone',
            'email', 'paymentMethod', 'shippingType'
        ];

        for (const field of requiredFields) {
            if (!formData[field]) {
                toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }

        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        updateShipping(formData);
        if (isSubmitting) return;
        if (!validateForm()) return;
        if (!user) {
            toast.warning("Please log in to place your order");
            navigate("/login");
            return;
        }

        // Redirect to billing page if needed
        // if (!useSameAddress && !billingData) {
        //     navigate('/billing', { state: { shippingData: formData } });
        //     return;
        // }
        if (!checkoutData.useSameAddress && !checkoutData.billingComplete) {
            navigate('/billing');
            return;
        }
        // Reset billing complete flag if needed
        if (checkoutData.useSameAddress && checkoutData.billingComplete) {
            setBillingComplete(false);
        }
        setIsSubmitting(true);
        const orderDetails = createOrderDetails();

        try {
            if (formData.paymentMethod === "Razorpay") {
                await handleRazorpayPayment(orderDetails);
            } else if (formData.paymentMethod === "Cash on Delivery") {
                await handleCashOnDelivery(orderDetails);
            }
        } catch (error) {
            toast.error("Error placing order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const createOrderDetails = () => {
        const timestamp = Date.now().toString().slice(-6);
        const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderId = `ORD-${timestamp}-${randomString}`;

        // Get billing data from context instead of local state
        const billingAddressData = useSameAddress ? formData : checkoutData.billing;

        return {
            orderId,
            userId: user.uid,
            shippingAddress: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                address: `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}`,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                pinCode: formData.pinCode,
                phone: formData.phone,
                email: formData.email
            },
            billingAddress: {
                firstName: billingAddressData.firstName,
                lastName: billingAddressData.lastName,
                address: `${billingAddressData.address}${billingAddressData.apartment ? ', ' + billingAddressData.apartment : ''}`,
                city: billingAddressData.city,
                state: billingAddressData.state,
                country: billingAddressData.country,
                pinCode: billingAddressData.pinCode,
                phone: billingAddressData.phone,
                email: billingAddressData.email
            },
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl,
                weight: item.weight
            })),
            subtotal: cart.reduce((total, item) => total + item.price * item.quantity, 0),
            shipping: shippingRate || 0,
            discount: discountAmount || 0,
            total: calculateFinalTotal(),
            paymentMethod: formData.paymentMethod,
            status: "Pending",
            createdAt: new Date().toISOString(),
        };
    };

    const handleRazorpayPayment = async (orderDetails) => {
         try {
        const orderAmount = orderDetails.total;
     const response = await fetch('https://us-central1-honey-8e04f.cloudfunctions.net/createOrder',
             {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: orderAmount,
               
            }),
        });
     const data = await response.json();

        const options = {
            key: import.meta.env.VITE_RAZORPAY_API_KEY,
            amount: orderAmount,
            currency: "INR",
            name: "Cape Naturals-Honey&Spices",
            description: "Order Payment",
            image: "/logo123.png",
    order_id: data.id,
            handler: async (response) => {
                await saveOrderToDatabase(orderDetails);
                toast.success("Order Placed Successfully!");
                navigate("/success");
            },
            prefill: {
                name: `${orderDetails.billingAddress.firstName} ${orderDetails.billingAddress.lastName}`,
                email: orderDetails.billingAddress.email,
                contact: orderDetails.billingAddress.phone,
            },
            theme: {
                color: "#ca8a04",
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
            toast.error("Payment Failed. Please try again.");
        });
        rzp.open();
     } catch (error) {
        console.error("Payment initiation failed", error);
        toast.error("Payment initiation failed");
    }
    };
    
    const handleCashOnDelivery = async (orderDetails) => {
        await saveOrderToDatabase(orderDetails);
        await clearUserCart(user.uid);
        toast.success("Order Placed Successfully!");
        navigate("/successpage");
    };

    const saveOrderToDatabase = async (orderDetails) => {
        try {
            await setDoc(doc(database, "orders", orderDetails.orderId), orderDetails);
            return true;
        } catch (error) {
            console.error("Error saving order:", error);
            toast.error("Failed to save order. Please try again.");
            return false;
        }
    };

    const clearUserCart = async (uid) => {
        const userCartRef = collection(database, `users/${uid}/cart`);
        try {
            const querySnapshot = await getDocs(userCartRef);
            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        } catch (error) {
            console.error("Error clearing cart:", error);
        }
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


    return (
        <div>
            <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${img1})` }}>
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className='p-10 flex justify-center md:justify-start items-center h-full'>
                </div>
            </div>
            <div className="container mx-auto p-8 md:w-2/3">

                <div className="mb-8">


                    <h3 className="text-2xl font-semibold mb-4 px-3 border-l-4 border-yellow-600">Shipping Details</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="shippingType" className="block font-medium mb-1">
                                Shipping Type
                            </label>
                            <select
                                id="shippingType"
                                name='shippingType'
                                value={formData.shippingType}
                                onChange={handleInputChange}
                                className="w-full border px-3 py-2 rounded"
                            >
                                <option value="">Select a Shipping Type</option>
                                {shippingTypes.map((type) => (
                                    <option key={type.id} value={type.name}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">


                            <div className="flex flex-col">
                                <label htmlFor="firstName" className="text-gray-700 self-start">First Name *</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName" className="mt-2 px-4 py-2 border rounded-md w-full" required onChange={handleInputChange} pattern="[A-Za-z\s]{2,50}" title="Name must contain only letters and be 2-50 characters long."
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="lastName" className="text-gray-700 self-start">Last Name *</label>
                                <input
                                    type="text"
                                    id="lastName" name="lastName" className="mt-2 px-4 py-2 border rounded-md w-full" onChange={handleInputChange} required pattern="[A-Za-z\s]{2,50}"
                                    title="Name must contain only letters and be 2-50 characters long."
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col mt-4">
                                <label htmlFor="country" className="text-gray-700 self-start">Country / Region *</label>
                                <select
                                    id="country" name="country" value={country?.isoCode || ""}
                                    onChange={(e) => {
                                        const selectedCountry = Country.getAllCountries().find(c => c.isoCode === e.target.value);
                                        setCountry(selectedCountry);
                                        setState(null); // Reset state when country changes
                                        setCity(null);
                                        setFormData((prevData) => ({
                                            ...prevData,
                                            country: selectedCountry ? selectedCountry.name : '',
                                        }));
                                    }}
                                    className="mt-2 px-4 py-2 border rounded-md w-full" required
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
                                <label htmlFor="address" className="text-gray-700 self-start">Street Address *</label>
                                <input
                                    type="text" id="address" name="address" className="mt-2 px-4 py-2 border rounded-md w-full" onChange={handleInputChange} required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col mt-4">
                                <label htmlFor="apartment" className="text-gray-700 self-start">Apartment, Suite, Unit, etc. (optional)</label>
                                <input
                                    type="text"
                                    id="apartment" value={formData.apartment} name="apartment" onChange={handleInputChange} className="mt-2 px-4 py-2 border rounded-md w-full"
                                />
                            </div>



                            <div className="flex flex-col mt-4">
                                <label htmlFor="state" className="text-gray-700 self-start">State *</label>

                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="mt-2 px-4 py-2 border rounded-md w-full"
                                    required
                                >
                                    <option value="">Select State</option>
                                    {indianStates.map((state) => (
                                        <option key={state.isoCode} value={state.name}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col mt-4">
                                <label htmlFor="city" className="text-gray-700 self-start">Town / City *</label>

                                <input
                                    type="text"
                                    id="city" value={formData.city} name="city" onChange={handleInputChange} className="mt-2 px-4 py-2 border rounded-md w-full"
                                />
                            </div>



                            <div className="flex flex-col mt-4">
                                <label htmlFor="pinCode" className="text-gray-700 self-start">PIN Code *</label>
                                <input
                                    type="text"
                                    id="pinCode"
                                    name="pinCode"
                                    onChange={handleInputChange}
                                    className="mt-2 px-4 py-2 border rounded-md w-full"
                                    required
                                />

                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col mt-4">
                                <label htmlFor="phone" className="text-gray-700 self-start">Phone *</label>
                                <input
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    placeholder='+91 Phone Number'
                                    onChange={handleInputChange}
                                    className="mt-2 px-4 py-2 border rounded-md w-full"
                                    maxLength={14}
                                    minLength={10}
                                    pattern="\+?[0-9\s\-\(\)]*"
                                    inputMode='numeric'
                                    required
                                />
                            </div>


                            <div className="flex flex-col mt-4">
                                <label htmlFor="email" className="text-gray-700 self-start">Email address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    onChange={handleInputChange}
                                    className="mt-2 px-4 py-2 border rounded-md w-full"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={useSameAddress}
                                    onChange={handleUseSameAddressChange}
                                    className="mr-2"
                                />
                                Billing address is the same as shipping address
                            </label>
                        </div>
                        
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold mb-4 px-3 border-l-4 border-yellow-600">Payment Methods</h3>

                            {/* Razorpay Payment Option */}
                            <div className="mb-4 p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Razorpay"
                                        onChange={handleInputChange}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        
                                        <div className="mt-2 text-sm text-gray-600">
                                            <p>Pay via UPI, Credit/Debit Cards, Wallets, or NetBanking</p>
                                            <p className="mt-1 italic text-gray-500">
                                                After clicking "Place Order", you will be redirected to Razorpay to complete your purchase securely.
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center space-x-2">
                                            <img
                                                src="https://cdn.iconscout.com/icon/free/png-512/free-upi-logo-icon-download-in-svg-png-gif-file-formats--unified-payments-interface-payment-money-transfer-logos-icons-1747946.png?f=webp&w=512"
                                                alt="UPI"
                                                className="h-8"
                                            />
                                            <img
                                                src="https://cdn.iconscout.com/icon/free/png-512/free-visa-logo-icon-download-in-svg-png-gif-file-formats--online-payment-brand-logos-pack-icons-226460.png?f=webp&w=512"
                                                alt="Visa"
                                                className="h-8"
                                            />
                                            <img
                                                src="https://cdn.iconscout.com/icon/free/png-512/free-mastercard-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-1-pack-logos-icons-3030047.png?f=webp&w=512"
                                                alt="Mastercard"
                                                className="h-8"
                                            />
                                            
                                            <img
                                                src="https://cdn.iconscout.com/icon/free/png-512/free-payment-icon-download-in-svg-png-gif-file-formats--rupay-card-pay-bank-transaction-methods-pack-e-commerce-shopping-icons-51318.png?f=webp&w=512"
                                                alt="RuPay"
                                                className="h-8"
                                            />
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Cash on Delivery Option */}
                            <div className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Cash on Delivery"
                                        onChange={handleInputChange}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800">Cash on Delivery</div>
                                        <div className="mt-1 text-sm text-gray-600">
                                            Pay in cash when your order is delivered
                                        </div>
                                    </div>
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

                <div className="mt-8 bg-white  overflow-hidden">
                    <div className=" border-b p-3">
                        <h3 className="text-2xl font-semibold text-gray-800 px-3 border-l-4 border-yellow-600">Your Order Summary</h3>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr className="text-left text-gray-600">
                                        <th className="px-6 py-4 font-medium uppercase text-sm">Product</th>
                                        <th className="px-6 py-4 font-medium uppercase text-sm">Quantity</th>
                                        <th className="px-6 py-4 font-medium uppercase text-sm">Weight</th>
                                        <th className="px-6 py-4 font-medium uppercase text-sm text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {cart.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={item.imageUrl}
                                                        className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                                                        alt={item.name}
                                                    />
                                                    <div>
                                                        <span className="font-medium text-gray-800 block">{item.name}</span>

                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex items-center">
                                                    <span className="mr-2">{item.quantity}</span>
                                                    <span className="text-gray-400">×</span>
                                                    <span className="ml-2">₹{item.price}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {getTotalWeight(item.weight, item.quantity)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-800">
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 p-6'>
                            <div className="p-5 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-700 border-l-4 border-yellow-600 px-3 mb-6">DISCOUNT/PROMO CODE</h3>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="Enter Coupon Code"
                                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="bg-white border-dashed border-yellow-600 border-2 text-black px-5 py-3 rounded-lg font-semibold hover:bg-yellow-50 transition-colors whitespace-nowrap"
                                    >
                                        Apply Code
                                    </button>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="mt-3 text-green-600 text-sm">
                                        Coupon applied successfully!
                                    </div>
                                )}
                            </div>

                            <div className="p-5 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-700 border-l-4 border-yellow-600 px-3 mb-6">ORDER SUMMARY</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">₹{cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Weight</span>
                                        <span className="font-medium">{getCartTotalWeight(cart)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">₹{shippingRate.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Discount</span>
                                        <span className="font-medium text-green-600">-₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-800">Total</span>
                                            <span className="text-xl font-bold text-yellow-600">₹{calculateFinalTotal().toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer
                position="bottom-center"
                autoClose={1200}
                hideProgressBar={false}
                newestOnTop={true}
                limit={1}
            />
        </div>
    )
}
export default Checkout