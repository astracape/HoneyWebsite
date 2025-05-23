import { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { database } from "../FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { CartContext } from "./CartContext";

export const CouponContext = createContext();

export const CouponProvider = ({ children }) => {
    const { cart } = useContext(CartContext);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [shippingRate, setShippingRate] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [finalTotal, setFinalTotal] = useState(0);
 

   
    // Fetch shipping rate based on region
    const fetchShippingRate = async (region) => {
        try {
            const shippingRef = collection(database, "shipping_methods");
            const snapshot = await getDocs(shippingRef);
            const shippingRates = snapshot.docs.map(doc => doc.data());
    
            const selectedShipping = shippingRates.find(shipping => shipping.region === region);
    
            if (selectedShipping) {
                setShippingRate(selectedShipping.rate);
                return selectedShipping.rate;
            } else {
                toast.error("Shipping rate not found for the selected region.");
                return 0;
            }
        } catch (error) {
            console.error("Error fetching shipping rates:", error);
            return 0;
        }
    };
    

    // Apply coupon if subtotal >= 500
    const applyCoupon = (coupon) => {
        const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    
        if (subtotal < (coupon.minimumOrderValue || 0)) {
            alert(`Cart total must be ${coupon.minimumOrderValue}  or more to apply this coupon`);
            return;
        }
    
        let discount = 0;
    
        if (coupon.discountType === "percentage") {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else if (coupon.discountType === "fixed") {
            discount = coupon.discountValue;
        }
    
        setAppliedCoupon(coupon);
        setDiscountAmount(discount);
    
        // Update final total after applying the coupon
        setFinalTotal(subtotal - discount + (shippingRate || 0));
    
        toast.success(`Coupon ${coupon.code} applied! You saved ₹${discount}`);
    };
   
    
    // Calculate final total including shipping & discount
    const calculateFinalTotal = (region) => {
        const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        const total = subtotal + shippingRate - discountAmount;
        return total > 0 ? total : 0;
    };
   


    return (
        <CouponContext.Provider value={{ appliedCoupon, applyCoupon, calculateFinalTotal, fetchShippingRate, shippingRate, discountAmount }}>
            {children}
        </CouponContext.Provider>
    );
};
