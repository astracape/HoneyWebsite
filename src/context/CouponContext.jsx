import { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { database } from "../FirebaseConfig";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { CartContext } from "./CartContext";
import { getAuth } from "firebase/auth";
export const CouponContext = createContext();

export const CouponProvider = ({ children }) => {
    const { cart } = useContext(CartContext);
      const auth = getAuth();
  const user = auth.currentUser;
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
    

  
   const applyCoupon = async (coupon) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    toast.error("Please login to apply a coupon.");
    return;
  }

  // Check coupon is active
  if (!coupon.isActive) {
    toast.error("This coupon is not active.");
    return;
  }

  // Check valid dates
  const today = new Date();
  const from = new Date(coupon.validFrom);
  const to = new Date(coupon.validTo);

  if (today < from) {
    toast.error("This coupon is not yet active.");
    return;
  }

  if (today > to) {
    toast.error("This coupon has expired.");
    return;
  }

  // Check subtotal condition
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  if (subtotal < (coupon.minimumOrderValue || 0)) {
    toast.error(`Cart total must be ₹${coupon.minimumOrderValue} or more to apply this coupon.`);
    return;
  }

  // Check if user already used this coupon today
  const couponId = coupon.code;
  const usageRef = doc(database, "coupon_usage", couponId);
  const usageSnap = await getDoc(usageRef);
  const usageData = usageSnap.exists() ? usageSnap.data() : {};

  const userUsageDates = usageData[user.uid] || [];
  const todayStr = today.toISOString().split("T")[0];

  if (userUsageDates.includes(todayStr)) {
    toast.error("You’ve already used this coupon today.");
    return;
  }

  // ✅ Apply discount
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
  setFinalTotal(subtotal - discount + shippingRate);

  toast.success(`Coupon ${coupon.code} applied! You saved ₹${discount}`);

  // Save coupon usage for today
  const updatedDates = [...userUsageDates, todayStr];
  if (usageSnap.exists()) {
    await updateDoc(usageRef, { [user.uid]: updatedDates });
  } else {
    await setDoc(usageRef, { [user.uid]: updatedDates });
  }

  
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
