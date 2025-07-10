import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react'
import { database } from '../../FirebaseConfig';

function ShippingType({fetchShippingTypes}) {
    const [shippingType, setShippingType] = useState("");
   const [description, setDescription] = useState("");
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");

   const handleAddShippingType = async () => {
      if (!shippingType) {
         setMessage("Shipping type is required!");
         return;
      }
      
      setLoading(true);
      try {
         await addDoc(collection(database, "shipping_types"), {
            name: shippingType,
            description: description,
         });

         setMessage("Shipping type added successfully!");
         setShippingType("");
         setDescription("");
            fetchShippingTypes();
      } catch (error) {
         console.error("Error adding shipping type:", error);
         setMessage("Error adding shipping type.");
      } finally {
         setLoading(false);
      }
   };

  return (
    <div>
 <div className="md:p-6 ">
  <h2 className="md:text-2xl font-bold text-gray-800 mb-6">Add Shipping Type</h2>

  {/* Success Message */}
  {message && (
    <p className="text-green-600 text-sm mb-4">{message}</p>
  )}

  {/* Shipping Type Name Field */}
  <div className="mb-6">
    <label className="block text-gray-700 text-sm font-medium mb-2">Shipping Type Name</label>
    <input
      type="text"
      value={shippingType}
      onChange={(e) => setShippingType(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
      placeholder="Enter shipping type (e.g., Express)"
      required
    />
  </div>

  {/* Description Field (Optional) */}
  <div className="mb-6">
    <label className="block text-gray-700 text-sm font-medium mb-2">Description (Optional)</label>
    <textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
      placeholder="Short description"
      rows="3"
    />
  </div>

  {/* Submit Button */}
  <button
    onClick={handleAddShippingType}
    className="md:w-2/4 w-full px-4 py-2 bg-brandyellow text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all"
    disabled={loading}
  >
    {loading ? "Adding..." : "Add Shipping Type"}
  </button>
</div>
    </div>
  )
}

export default ShippingType