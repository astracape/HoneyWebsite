
import React, { useContext, useEffect, useState } from 'react';
import { database } from '../../FirebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { FaPercent } from 'react-icons/fa';


function CouponList({ onCheckValid }) {
  const [coupons, setCoupons] = useState([]);
  

 
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const snapshot = await getDocs(collection(database, 'coupons'));
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        const activeCoupons = [];
        const updatePromises = [];

        snapshot.forEach((docSnap) => {
          const coupon = docSnap.data();
          const validToDate = coupon.validTo?.toDate?.() || new Date(coupon.validTo);
          validToDate.setHours(23, 59, 59, 999); // End of day

          // Check if coupon should be active
          const shouldBeActive = today <= validToDate;

          // If Firestore status doesn't match calculated status, queue an update
          if (coupon.isActive !== shouldBeActive) {
            updatePromises.push(
              updateDoc(doc(database, 'coupons', docSnap.id), {
                isActive: shouldBeActive
              })
            );
          }

          // Only show coupons that are active AND not expired
          if (shouldBeActive) {
            activeCoupons.push({ 
              id: docSnap.id, 
              ...coupon,
              validTo: validToDate
            });
          }
        });

        // Wait for all updates to complete
        if (updatePromises.length > 0) {
          await Promise.all(updatePromises);
        }

        setCoupons(activeCoupons);
        if (onCheckValid) onCheckValid(activeCoupons.length > 0);
      } catch (error) {
        console.error("Error fetching coupons:", error);
        if (onCheckValid) onCheckValid(false);
      }
    };

    fetchCoupons();
  }, [onCheckValid]);

  return (
    <div className="fixed top-0 left-0 w-screen h-6 z-50 bg-yellow-600 animate-slide-down">
      <div className="flex items-center h-full overflow-hidden">
        <div className="flex items-center space-x-8 px-4 animate-marquee whitespace-nowrap">
          {coupons.length > 0 ? (
            coupons.map((coupon) => (
              <div key={coupon.id} className="flex items-center space-x-2 text-white">
                <FaPercent className="flex-shrink-0" />
                <span className="font-bold">Use {coupon.code}</span>
                <span className="text-sm">
                  {coupon.discountType === "fixed"
                    ? `Flat ₹${coupon.discountValue} Off`
                    : `${coupon.discountValue}% Off` + 
                      (coupon.maxDiscount ? ` (Max ₹${coupon.maxDiscount})` : '')}
                </span>
                <span className="text-xs opacity-80">
                  Min Order: ₹{coupon.minimumOrderValue}
                </span>
              </div>
            ))
          ) : null}
        </div>
      </div>
    </div>
   
  );
}

export default CouponList;