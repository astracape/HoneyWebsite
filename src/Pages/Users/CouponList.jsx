// import React, { useEffect, useState } from 'react'
// import { database } from '../../FirebaseConfig';
// import { collection, getDocs, onSnapshot } from 'firebase/firestore';
// import { CopyToClipboard } from 'react-copy-to-clipboard';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaCopy, FaCheck, FaPercent } from 'react-icons/fa';

// function CouponList({onCheckValid}) {
// const [coupons, setCoupons] = useState([]);
// useEffect(() => {
//   const fetchCoupons = async () => {
//     const snapshot = await getDocs(collection(database, 'coupons'));
//     const activeCoupons = [];

//     snapshot.docs.forEach((docSnap) => {
//       const data = docSnap.data();
//       if (data.isActive) {
//         activeCoupons.push({ id: docSnap.id, ...data });
//       }
//     });

//     setCoupons(activeCoupons);
//     if (onCheckValid) onCheckValid(activeCoupons.length > 0);
//   };

//   fetchCoupons();
// }, [onCheckValid]);

// // useEffect(() => {
// //   const fetchCoupons = async () => {
// //     const snapshot = await getDocs(collection(database, 'coupons'));
// //     const today = new Date();
// //     const validCoupons = [];
// //     const expiredCoupons = [];

// //     const allCoupons = snapshot.docs.map(docSnap => {
// //       return { id: docSnap.id, ...docSnap.data() };
// //     });

// //     for (const coupon of allCoupons) {
// //       const validToDate = new Date(coupon.validTo + 'T23:59:59');
// //       const isExpired = validToDate < today;

// //       if (coupon.isActive && isExpired) {
// //         expiredCoupons.push(coupon);
// //       }

// //       if (coupon.isActive && !isExpired) {
// //         validCoupons.push(coupon);
// //       }
// //     }

// //     // Auto-deactivate expired coupons in Firestore
// //     for (const expired of expiredCoupons) {
// //       const couponRef = doc(database, 'coupons', expired.id);
// //       await updateDoc(couponRef, { isActive: false });
// //       console.log(`Deactivated expired coupon: ${expired.code}`);
// //     }

// //     setCoupons(validCoupons);
// //     if (onCheckValid) onCheckValid(validCoupons.length > 0);
// //   };

// //   fetchCoupons();
// // }, [onCheckValid]);
   
//     return (
//         <div>
//             <div className="fixed top-0 left-0 w-full h-6  z-50 bg-yellow-600 animate-slide-down">
//                 <div className="flex my-auto items-center space-x-8 px-4 animate-marquee">
//                     {coupons.length > 0 ? (
//                         coupons.map((coupon) => ( 
//                             <div key={coupon.id} className="flex items-center space-x-2 text-white">
//                                <FaPercent/>  <span className="font-bold">Use {coupon.code}</span> -
//                                 <span className="text-sm">
//                                     {coupon.discountType === "fixed"
//                                         ? `Flat ₹${coupon.discountValue} Off`
//                                         : `${coupon.discountValue}% Off (Max ₹${coupon.maxDiscount})`}
//                                 </span>
//                                 <span className="text-xs opacity-80">Min Order: ₹{coupon.minimumOrderValue}</span>
                     
//                             </div>
//                         ))
//                     ) : (
//                         <p className="text-white"></p>
//                     )}
//                 </div>
                
                
//             </div>
            
//         </div>


//     )
// }

// export default CouponList

// import React, { useEffect, useState } from 'react';
// import { database } from '../../FirebaseConfig';
// import { collection, getDocs, onSnapshot } from 'firebase/firestore';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaPercent } from 'react-icons/fa';

// function CouponList({ onCheckValid }) {
//   const [coupons, setCoupons] = useState([]);
  
//   useEffect(() => {
//     const fetchActiveCoupons = async () => {
//       try {
//         const snapshot = await getDocs(collection(database, 'coupons'));
//         const today = new Date();
//         const activeCoupons = [];
        
//         snapshot.forEach((docSnap) => {
//           const coupon = docSnap.data();
//           const validToDate = coupon.validTo?.toDate?.() || new Date(coupon.validTo);
          
//           // Only include coupons that are marked as active and not expired
//           if (coupon.isActive && today <= validToDate) {
//             activeCoupons.push({ 
//               id: docSnap.id, 
//               ...coupon,
//               validTo: validToDate
//             });
//           }
//         });
        
//         setCoupons(activeCoupons);
//         if (onCheckValid) onCheckValid(activeCoupons.length > 0);
//       } catch (error) {
//         console.error("Error fetching coupons:", error);
//       }
//     };
    
//     fetchActiveCoupons();
    
//     // Set up real-time listener for coupon changes
//     const unsubscribe = onSnapshot(collection(database, 'coupons'), () => {
//       fetchActiveCoupons();
//     });
    
//     return () => unsubscribe();
//   }, [onCheckValid]);
  
//   return (
//     <div className="fixed top-0 left-0 w-full h-6 z-50 bg-yellow-600 animate-slide-down">
//       <div className="flex items-center h-full overflow-hidden">
//         <div className="flex items-center space-x-8 px-4 animate-marquee whitespace-nowrap">
//           {coupons.length > 0 ? (
//             coupons.map((coupon) => (
//               <div key={coupon.id} className="flex items-center space-x-2 text-white">
//                 <FaPercent className="flex-shrink-0" />
//                 <span className="font-bold">Use {coupon.code}</span>
//                 <span className="text-sm">
//                   {coupon.discountType === "fixed"
//                     ? `Flat ₹${coupon.discountValue} Off`
//                     : `${coupon.discountValue}% Off` + 
//                       (coupon.maxDiscount ? ` (Max ₹${coupon.maxDiscount})` : '')}
//                 </span>
//                 <span className="text-xs opacity-80">
//                   Min Order: ₹{coupon.minimumOrderValue}
//                 </span>
//                 <span className="text-xs italic">
//                   Valid until: {coupon.validTo.toLocaleDateString('en-GB')}
//                 </span>
//               </div>
//             ))
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CouponList;
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