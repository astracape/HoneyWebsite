
import { collection, deleteDoc, doc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { database } from '../../FirebaseConfig';
import CouponForm from "./CouponForm";

function ViewCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);


  const fetchCoupons = () => {
    try {
      setLoading(true);
      const unsubscribe = onSnapshot(collection(database, 'coupons'), (querySnapshot) => {
        const couponsData = [];
        const now = new Date();

        querySnapshot.forEach((docSnap) => {
          const coupon = {
            id: docSnap.id,
            ...docSnap.data(),
          };

          const validFrom = coupon.validFrom || ""
          const validTo = coupon.validTo|| ""

          let status = "";
if (validFrom && validTo) {
  const fromDate = new Date(validFrom);
  const toDate = new Date(validTo);
          if (now < fromDate) {
            const diffMs = validFrom - now;
            const totalSeconds = Math.floor(diffMs / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            status = `Starts in ${hours}h ${minutes}m ${seconds}s`;
          } else if (now > toDate) {
            status = "Expired";
          } else {
            status = "Valid";
          }
        }
          couponsData.push({
            ...coupon,
            validFrom,
            validTo,
            status
          });
        });

        setCoupons(couponsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCoupons();
  }, []);


  useEffect(() => {
    fetchCoupons();
    const intervalId = setInterval(fetchCoupons, 3600000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await deleteDoc(doc(database, "coupons", id));
        await fetchCoupons();
      } catch (error) {
        console.error("Error deleting coupon:", error);
      }
    }
  };

  const handleEdit = (coupon) => {
    // Only set the coupon to edit and show the form
    fetchCoupons();  // This will fetch the coupons again after an update

    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const handleFormSubmit = async (couponData) => {
    try {
      if (couponData.id) {
        // Update Firestore with the new data
        await updateDoc(doc(database, 'coupons', couponData.id), {
          code: couponData.code,
          discountType: couponData.discountType,
          discountValue: couponData.discountValue,
          validFrom: couponData.validFrom,
          validTo: couponData.validTo,
          isActive: couponData.isActive,
        });
      }

      // Fetch updated coupons from Firestore
      await fetchCoupons();

      // Close the form
      setShowForm(false);
      setEditingCoupon(null);
    } catch (error) {
      console.error("Error updating coupon:", error);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCoupon(null);
  };

  const filteredCoupons = coupons.sort((a, b) => {
    return new Date(b.validFrom) - new Date(a.validFrom);
  });

  if (loading) {
    return (
      <div className="p-6 lg:ml-64">
        <h2 className="text-2xl font-bold px-3 border-l-4 border-yellow-600 mb-4">All Coupons</h2>
        <p>Loading coupons...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 lg:ml-64">
        <h2 className="text-2xl font-bold px-3 border-l-4 border-yellow-600 mb-4">All Coupons</h2>

        {coupons.length === 0 ? (
          <p>No coupons available.</p>
        ) : (
          <ul className="space-y-4">
            {filteredCoupons.map((coupon) => (
              <li key={coupon.id} className="border p-4 rounded shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold flex items-center space-x-2">
                      <span className='font-bold text-yellow-600'>{coupon.code}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${coupon.status.startsWith("Valid")
                          ? "bg-green-100 text-green-800"
                          : coupon.status === "Expired"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {coupon.status}
                      </span>

                    </h4>

                    <p>{coupon.discountType} - {coupon.discountValue}</p>
                    <p className='py-4 text-gray-500'>
                      {coupon.validFrom} ---
                      {coupon.validTo}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="text-yellow-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {showForm && (
          <CouponForm
            onClose={closeForm}
            onSubmit={handleFormSubmit}
            couponToEdit={editingCoupon}
          />
        )}
      </div>
    </div>
  );
}

export default ViewCoupons;