
import { collection, deleteDoc, doc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { database } from '../../FirebaseConfig';
import CouponForm from "./CouponForm";

function ViewCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);


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
          const validTo = coupon.validTo || ""

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

  const handleDelete = async () => {
    if (!selectedCoupon) return;

    try {
      await deleteDoc(doc(database, "coupons", selectedCoupon.id));
      setShowModal(false);
      setSelectedCoupon(null);
    } catch (error) {
      console.error("Error deleting coupon:", error);
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
                      onClick={() => {
                        setSelectedCoupon(coupon);
                        setShowModal(true);
                      }}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <CouponForm
              onClose={closeForm}
              onSubmit={handleFormSubmit}
              couponToEdit={editingCoupon}
            />
          </div>
        )}
      </div>
      {showModal && (
  <div className="fixed z-10 inset-0 overflow-y-auto">
    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      
      <div className="fixed inset-0 transition-opacity">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              🗑️
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Delete Coupon
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete coupon{" "}
                  <span className="font-semibold text-red-600">
                    "{selectedCoupon?.code}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            onClick={handleDelete}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Delete
          </button>
          <button
            onClick={() => {
              setShowModal(false);
              setSelectedCoupon(null);
            }}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default ViewCoupons;