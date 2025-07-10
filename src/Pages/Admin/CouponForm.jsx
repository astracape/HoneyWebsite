import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { database } from '../../FirebaseConfig';
import { Link } from 'react-router-dom';

function CouponForm({ onClose, couponToEdit }) {
    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState("percentage");
    const [discountValue, setDiscountValue] = useState("");
    const [validFrom, setValidFrom] = useState("");
    const [validTo, setValidTo] = useState("");
    const [minimumOrderValue, setMinimumOrderValue] = useState("");
    const [maxDiscount, setMaxDiscount] = useState("");
    const [usageLimit, setUsageLimit] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [applicableProducts, setApplicableProducts] = useState("");
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("");

    useEffect(() => {
        if (couponToEdit) {
             const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            return d.toISOString().split("T")[0]; // format: 'YYYY-MM-DD'
        };
            setCode(couponToEdit.code || "");
            setDiscountType(couponToEdit.discountType || "percentage");
            setDiscountValue(couponToEdit.discountValue || "");
            setValidFrom(couponToEdit.validFrom || "");
            setValidTo(couponToEdit.validTo || "");
            setMinimumOrderValue(couponToEdit.minimumOrderValue || "");
            setMaxDiscount(couponToEdit.maxDiscount || "");
            setUsageLimit(couponToEdit.usageLimit || "");
            setIsActive(couponToEdit.isActive ?? true);
        }
    }, [couponToEdit]);

 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
    
        const couponData = {
            code,
            discountType,
            discountValue: Number(discountValue),
            validFrom,
            validTo,
            minimumOrderValue: Number(minimumOrderValue),
            maxDiscount: Number(maxDiscount) || null,
            usageLimit: Number(usageLimit),
            isActive: new Date(validFrom) <= new Date() && new Date(validTo) >= new Date(),
            applicableProducts: applicableProducts
                ? applicableProducts.split(",").map((item) => item.trim())
                : [],
            updatedAt: serverTimestamp(),  // Track the time of the update
            updatedBy: "admin_user",  // Update the user field to track who edited
        };
    
        console.log(couponData);  // Log the data to check if it has the correct values
    
        try {
            if (couponToEdit) {
                // If editing, update the existing coupon document
                await updateDoc(doc(database, "coupons", couponToEdit.id), couponData);
                console.log("Coupon updated:", couponToEdit.id);
            } else {
                // If creating a new coupon, add it to Firestore
                const docRef = await addDoc(collection(database, "coupons"), couponData);
                console.log("Coupon Created with ID:", docRef.id);
            }
            onClose(); // Close the modal after successful submission
        } catch (err) {
            console.error("Error saving coupon:", err);
            setError("Failed to save coupon. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    
    return (
        <div>
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                    <Link to="/viewcoupons" className="flex justify-end text-yellow-600 underline">View Coupons</Link>

                    <h3 className="text-lg font-semibold mb-4">Create Coupon</h3>
                    <form onSubmit={handleSubmit}>
                        <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg mb-3" placeholder="Coupon Code" required />
                        <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg mb-3" required>
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed</option>
                        </select>
                        <input type="number" value={discountValue}
                            min={new Date().toISOString().split("T")[0]} onChange={(e) => setDiscountValue(e.target.value)}
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg mb-3" placeholder="Discount Value" required />
                        <span>Valid From:</span>
                        <input
                            type="date"
                            value={validFrom}
                            onChange={(e) => {
                                const selectedDate = e.target.value;
                                setValidFrom(selectedDate);

                                // If current validTo is earlier than selected validFrom, clear validTo
                                if (validTo && new Date(validTo) < new Date(selectedDate)) {
                                    setValidTo('');
                                }
                            }}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg mb-3"
                            required
                        />

                        <span>Valid To:</span>
                        <input
                            type="date"
                            value={validTo}
                            onChange={(e) => setValidTo(e.target.value)}
                            min={validFrom || new Date().toISOString().split("T")[0]}
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg mb-3"
                            required
                        />

                        <input type="number" value={minimumOrderValue} onChange={(e) => setMinimumOrderValue(e.target.value)}
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg mb-3" placeholder="Min Order Value" required />
                        <input type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)}
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg mb-3" placeholder="Max Discount (optional)" />
                        <input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)}
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg mb-3" placeholder="Usage Limit" required />
                        <input type="text" value={applicableProducts} onChange={(e) => setApplicableProducts(e.target.value)}
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg mb-3" placeholder="Applicable Products (comma separated) optional" />

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-brandyellow text-white px-4 py-2 rounded"
                            >
                                {couponToEdit ? "Update" : "Add"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default CouponForm
