
import React, { useContext, useEffect, useState } from 'react';
import { database } from '../../FirebaseConfig';
import { collection, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { FaPercent } from 'react-icons/fa';


function CouponList({ onCheckValid }) {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(database, 'coupons'), async (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeCoupons = [];
      const updatePromises = [];

      snapshot.forEach((docSnap) => {
        const coupon = docSnap.data();
        const validToDate = coupon.validTo?.toDate?.() || new Date(coupon.validTo);
        validToDate.setHours(23, 59, 59, 999);

        const shouldBeActive = today <= validToDate;

        if (coupon.isActive !== shouldBeActive) {
          updatePromises.push(
            updateDoc(doc(database, 'coupons', docSnap.id), {
              isActive: shouldBeActive
            })
          );
        }

        if (shouldBeActive) {
          activeCoupons.push({
            id: docSnap.id,
            ...coupon,
            validTo: validToDate
          });
        }
      });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }

      setCoupons(activeCoupons);
      if (onCheckValid) onCheckValid(activeCoupons.length > 0);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [onCheckValid]);

  return (
    <div className="fixed top-0 left-0 w-screen h-6 z-50 bg-brandyellow animate-slide-down">
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