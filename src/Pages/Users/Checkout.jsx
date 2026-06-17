import React, { useContext, useEffect, useState } from 'react'
import img1 from "../../assets/Group 1.png"
import { Country, State, City } from 'country-state-city';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, database } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { addDoc, collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { CartContext } from '../../context/CartContext';
import { ShippingContext } from '../../context/ShippingContext';
import { CouponContext } from '../../context/CouponContext';
import { useCheckout } from '../../context/CheckoutContext';

function Checkout() {
    const { cart, getCartTotalPrice, getCartTotalWeight } = useContext(CartContext)
    const { updateShipping, checkoutData, setUseSameAddress, setBillingComplete, resetCheckout } = useCheckout();
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
    const { shippingTypes, fetchShippingRate, fetchShippingTypes, fetchShippingMethods, resetShippingRate, shippingRate, loading: shippingLoading,
        error: shippingError, } = useContext(ShippingContext);
    const navigate = useNavigate()
    const [country, setCountry] = useState(null);
    const [user, setUser] = useState()
    const [state, setState] = useState(null);
    const [city, setCity] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const indianStates = State.getStatesOfCountry("IN");
    const { appliedCoupon, markCouponAsUsedAfterOrder, discountAmount, applyCoupon, resetCoupon, setDiscountAmount, setAppliedCoupon, removeTempUsage } = useContext(CouponContext)
    // const { getTotalWeight, getCartTotalWeight } = useContext(CartContext)
    const [couponCode, setCouponCode] = useState("");
    const [billingData, setBillingData] = useState(null);
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchShippingTypes();
  if (cart.length === 0) {
        navigate("/cart", { replace: true });
        return;
    }
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                navigate('/reg');
            }
        });
        return () => unsubscribe();
    }, []);

    const resetAllCheckout = () => {
        setFormData(FormData);
        setCouponCode('');
        resetCheckout();
        resetCoupon();
        resetShippingRate();
    };
    // useEffect(() => {
    //     if (formData.description && formData.shippingType) {
    //         fetchShippingRate(formData.description, formData.shippingType);
    //     }
    // }, [formData.description, formData.shippingType]);
    useEffect(() => {
        if (formData.state) {
            setFormData(prev => ({
                ...prev,
                description:
                    formData.state === "Karnataka"
                        ? "Within Karnataka"
                        : "Outside Karnataka"
            }));
        }
    }, [formData.state]);
useEffect(() => {
    if (
        formData.state &&
        formData.shippingType
    ) {
        fetchShippingRate(
            formData.state,
            formData.shippingType
        );
    }
}, [
    cart,
    formData.state,
    formData.shippingType
]);
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
        console.log("Trying to match: region =", State, "| type =", shippingType);
        updateShipping(updatedForm);
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
        console.log("Selected Payment Method:", formData.paymentMethod);

        if (isSubmitting) return;
        if (!validateForm()) return;
        if (!user) {
            toast.warning("Please log in to place your order");
            navigate("/reg");
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
            if (formData.paymentMethod === "Online Payment") {
                await handleRazorpayPayment(orderDetails);
            } else if (formData.paymentMethod === "Cash on Delivery") {
                await handleCashOnDelivery(orderDetails);
            }
        } catch (error) {
            console.error("Order placement error:", error);
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
                    await clearUserCart(user.uid);
                    if (appliedCoupon) {
                        await markCouponAsUsedAfterOrder(user.uid, appliedCoupon.code);
                        await removeTempUsage(appliedCoupon.code, user.uid);
                    }
                    resetAllCheckout();
                    toast.success("Order Placed Successfully!");
                    navigate("/successpage");
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
            console.log("Opening Razorpay", options);

            rzp.open();
        } catch (error) {
            console.error("Payment initiation failed", error);
            toast.error("Payment initiation failed");
        }
    };

    const handleCashOnDelivery = async (orderDetails) => {
        await saveOrderToDatabase(orderDetails);
        await clearUserCart(user.uid);
        if (appliedCoupon) {
            await markCouponAsUsedAfterOrder(user.uid, appliedCoupon.code);
            await removeTempUsage(appliedCoupon.code, user.uid);
        }
        resetAllCheckout();
        toast.success("Order Placed Successfully!");
        navigate("/successpage");
    };

    const saveOrderToDatabase = async (orderDetails) => {
        try {

            console.log("🔥 ORDER OBJECT:", orderDetails);
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
            const querySnapshot = await getDocs(collection(database, "coupons"));
            const coupons = querySnapshot.docs.map(doc => doc.data());

            const coupon = coupons.find(c => c.code === couponCode.trim());

            if (!coupon) {
                toast.error("Invalid coupon code.");
                return;
            }

            await applyCoupon(coupon); //  All checks are already handled inside
        } catch (error) {
            console.error("Error applying coupon:", error);
            toast.error("Error applying coupon.");
        }
    };
    const handleRemoveCoupon = async () => {
        if (appliedCoupon && user) {
            await removeTempUsage(appliedCoupon.code, user.uid); // remove from temp usage in DB
        }
        resetCoupon()
        setDiscountAmount(0); // reset discount
        setAppliedCoupon(null); // clear applied coupon
        setCouponCode("");

    };



    return (
        <div>
            <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${img1})` }}>
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className='p-10 flex justify-center md:justify-CENTER items-center h-full'>
                    <div className='font-bold text-6xl md:text-9xl bebas-neue-regular '>CHECKOUT</div>
                </div>
            </div>
            <div className="container mx-auto p-2 max-w-7xl min-h-screen">
                <div className="flex flex-col lg:flex-row gap-8 h-full">
                    <div className="lg:w-2/4 space-y-8 pr-2 flex-shrink-0 h-full">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-100">
                                Shipping Details
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            required
                                            pattern="[A-Za-z\s]{2,50}"
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brandyellow focus:border-brandyellow"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            required
                                            pattern="[A-Za-z\s]{1,50}"
                                            onChange={handleInputChange}
                                            value={formData.lastName}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brandyellow focus:border-brandyellow"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        required
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brandyellow focus:border-brandyellow"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-1">
                                        Apartment, Suite, etc. (optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="apartment"
                                        name="apartment"
                                        value={formData.apartment}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brandyellow focus:border-brandyellow"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                            Country *
                                        </label>
                                        <select
                                            id="country"
                                            name="country"
                                            value={country?.isoCode || ""}
                                            onChange={(e) => {
                                                const selectedCountry = Country.getAllCountries().find(c => c.isoCode === e.target.value);
                                                setCountry(selectedCountry);
                                                setState(null);
                                                setCity(null);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    country: selectedCountry ? selectedCountry.name : '',
                                                }));
                                            }}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brandyellow focus:border-brandyellow"
                                        >
                                            <option value="">Select Country</option>
                                            {Country.getAllCountries().map(c => (
                                                <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                            State *
                                        </label>
                                        <select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brandyellow focus:border-brandyellow"
                                        >
                                            <option value="">Select State</option>
                                            {indianStates.map(state => (
                                                <option key={state.isoCode} value={state.name}>{state.name}</option>
                                            ))}

                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            required
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brandyellow focus:border-brandyellow"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700 mb-1">
                                            PIN Code *
                                        </label>
                                        <input
                                            type="text"
                                            id="pinCode"
                                            name="pinCode"
                                            value={formData.pinCode}
                                            required
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brandyellow focus:border-brandyellow"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            placeholder="+91 Phone Number"
                                            value={formData.phone}
                                            maxLength={13}
                                            required
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brandyellow focus:border-brandyellow"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        required
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brandyellow focus:border-brandyellow"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="shippingType" className="block text-sm font-medium text-gray-700 mb-2">
                                        Shipping Type
                                    </label>
                                    <select
                                        id="shippingType"
                                        name='shippingType'
                                        value={formData.shippingType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brandyellow focus:border-brandyellow"
                                    >
                                        <option value="">Select a Shipping Type</option>
                                        {shippingTypes.map((type) => (
                                            <option key={type.id} value={type.name}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-6 mt-6 border-t border-gray-100">
                                    <h3 className="text-xl font-semibold mb-6">Payment Method</h3>

                                    <div className="space-y-3">
                                        <label className="flex items-start p-4 border rounded-xl hover:border-brandyellow transition-colors cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                
                                                value="Online Payment"
                                                onChange={handleInputChange}
                                                className="mt-1 mr-3 h-5 w-5 text-brandyellow focus:ring-brandyellow border-gray-300"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium">Online Payment</div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Pay via UPI, Credit/Debit Cards, Wallets, or NetBanking
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                                                        <img
                                                            src="https://cdn.iconscout.com/icon/free/png-512/free-upi-logo-icon-download-in-svg-png-gif-file-formats--unified-payments-interface-payment-money-transfer-logos-icons-1747946.png"
                                                            alt="UPI"
                                                            className="w-4 h-4 mr-1"
                                                        />
                                                        UPI
                                                    </div>
                                                    <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                                                        <img
                                                            src="https://cdn.iconscout.com/icon/free/png-512/free-visa-logo-icon-download-in-svg-png-gif-file-formats--online-payment-brand-logos-pack-icons-226460.png"
                                                            alt="Visa"
                                                            className="w-4 h-4 mr-1"
                                                        />
                                                        Visa
                                                    </div>
                                                    <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                                                        <img
                                                            src="https://cdn.iconscout.com/icon/free/png-512/free-mastercard-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-1-pack-logos-icons-3030047.png"
                                                            alt="Mastercard"
                                                            className="w-4 h-4 mr-1"
                                                        />
                                                        Mastercard
                                                    </div>
                                                    <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                                                        <img
                                                            src="https://cdn.iconscout.com/icon/free/png-512/free-payment-icon-download-in-svg-png-gif-file-formats--rupay-card-pay-bank-transaction-methods-pack-e-commerce-shopping-icons-51318.png"
                                                            alt="RuPay"
                                                            className="w-4 h-4 mr-1"
                                                        />
                                                        RuPay
                                                    </div>

                                                </div>
                                            </div>
                                        </label>

                                        {/* <label className="flex items-start p-4 border rounded-xl hover:border-brandyellow transition-colors cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="Cash on Delivery"
                                                onChange={handleInputChange}
                                                className="mt-1 mr-3 h-5 w-5 text-brandyellow focus:ring-brandyellow border-gray-300"
                                            />
                                            <div>
                                                <div className="font-medium">Cash on Delivery</div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Pay in cash when your order is delivered
                                                </p>
                                            </div>
                                        </label> */}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 px-6 bg-brandyellow hover:bg-brandyellow/90 text-white font-semibold rounded-lg shadow-sm transition-colors"
                                >
                                    Place Order
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className=" w-full lg:border-l-2 lg:pl-10 flex mx-auto items-start justify-start self-start">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4 w-full">
                            <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-100">
                                Order Summary
                            </h3>
                            <div className="space-y-6 mb-6">
                                {cart.map((item, index) => (
                                    <div key={index} className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Link to={`/singleproduct/${item.id}`}>
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-12 h-12 rounded-md object-cover border border-gray-200"
                                                />
                                            </Link>
                                            <div>
                                                <div className="font-medium flex items-center gap-2">
                                                    {item.name}

                                                    {item.isPreorder && (
                                                        <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                                            Pre-order
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    {item.quantity} × ₹{item.price}
                                                </div>

                                                {item.isPreorder && (
                                                    <div className="text-[11px] text-amber-700">
                                                        Delivered within 10 days
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                        <div className="font-medium">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Discount Code
                                </label>
                                <div className="flex flex-col md:flex-row gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="Enter coupon code"
                                        className="flex-1 px-4 py-2 w-full lg:w-auto border border-gray-300 rounded-lg focus:ring-brandyellow focus:border-brandyellow"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="px-4 py-2 w-full lg:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="mt-2 flex items-center justify-between text-green-600 text-sm">
                                        <span>Coupon applied: {couponCode}</span>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="text-green-600 hover:text-red-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-6 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>₹{cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span>₹{shippingRate.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Discount</span>
                                        <span className="text-green-600">-₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="pt-3 mt-3 border-t border-gray-200">
                                    <div className="flex justify-between font-semibold text-base">
                                        <span>Total</span>
                                        <span className="text-brandyellow">₹{calculateFinalTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-center space-x-8 text-gray-400">
                                    <div className="text-center">
                                        <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <div className="text-xs">Secure Payment</div>
                                    </div>
                                    <div className="text-center">
                                        <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <div className="text-xs">Data Protection</div>
                                    </div>
                                    <div className="text-center">
                                        <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        <div className="text-xs">Free Returns</div>
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