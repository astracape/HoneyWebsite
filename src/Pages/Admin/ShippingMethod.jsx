import React, { useContext, useEffect, useState } from 'react'
import ShippingType from './ShippingType'
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { database } from '../../FirebaseConfig';
import { ShippingContext } from '../../context/ShippingContext';
import CouponForm from './CouponForm';
import { Country, State } from "country-state-city";
import { Link } from 'react-router-dom';

function ShippingMethod() {

  const { shippingTypes, addShippingMethod, fetchShippingMethods, shippingMethods, fetchShippingTypes } = useContext(ShippingContext);
  const [selectedShippingType, setSelectedShippingType] = useState("")
  const [shippingRate, setShippingRate] = useState("");
  const [shippingTime, setShippingTime] = useState("");
  const [region, setRegion] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validCoupon, setValidCoupon] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editingTypeName, setEditingTypeName] = useState("");
  const [editingTypeDescription, setEditingTypeDescription] = useState("");
  const [shippingMethodSearch, setShippingMethodSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [states, setStates] = useState([]);
  const [activeTab, setActiveTab] = useState("types");
    const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    id: null,
    type: null, // 'method' or 'type'
    name: null
  });
  useEffect(() => {
    const indianStates = State.getStatesOfCountry("IN");
    setStates(indianStates);
  }, []);

  const handleCloseCouponModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchShippingTypes()
    fetchShippingMethods(); // Fetch shipping methods when the component mounts
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedShippingType || !shippingRate || !shippingTime || !weight) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    const newMethod = {
      type: selectedShippingType,
      region: selectedState,
      rate: Number(shippingRate),
      time: shippingTime,
      weight: weight + " kg",
    };

    if (editingId) {
      // If editing, update the existing record
      const methodRef = doc(database, "shipping_methods", editingId);
      await updateDoc(methodRef, newMethod);
      setMessage("Shipping method updated successfully!");
    } else {
      // Otherwise, create a new record
      const response = await addShippingMethod(newMethod);
      setMessage(response.message);
    }
    // Clear inputs and reset editing state
    setEditingId(null);
    setSelectedShippingType("");
    setRegion("");
    setShippingRate("");
    setShippingTime("");
    setWeight("");
    setLoading(false);
    fetchShippingMethods();
  };

  const handleEdit = (method) => {
    setEditingId(method.id);
    setSelectedShippingType(method.type);
    setRegion(method.region);
    setShippingRate(method.rate);
    setShippingTime(method.time);
    setWeight(String(method.weight).replace(" kg", ""));
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(database, "shipping_methods", id));
    fetchShippingMethods();
  };
  const handleEditType = (type) => {
    setEditingTypeId(type.id);
    setEditingTypeName(type.name);
    setEditingTypeDescription(type.description || "");
  };

  const handleDeleteType = async (id) => {
    try {
      await deleteDoc(doc(database, "shipping_types", id));
      fetchShippingTypes();
    } catch (error) {
      console.error("Error deleting shipping type:", error);
    }
  };

  const handleUpdateType = async () => {
    try {
      const typeRef = doc(database, "shipping_types", editingTypeId);
      await updateDoc(typeRef, {
        name: editingTypeName,
        description: editingTypeDescription
      });
      setEditingTypeId(null);
      fetchShippingTypes();
    } catch (error) {
      console.error("Error updating shipping type:", error);
    }
  };
  const filteredShippingMethods = shippingMethods.filter((method) =>
    method.type.toLowerCase().includes(shippingMethodSearch.toLowerCase()) ||
    method.region.toLowerCase().includes(shippingMethodSearch.toLowerCase())
  );
  const filteredShippingTypes = shippingTypes.filter((type) =>
    type.name.toLowerCase().includes(shippingMethodSearch.toLowerCase()) ||
    (type.description || "").toLowerCase().includes(shippingMethodSearch.toLowerCase())
  );

  return (

    <div className="lg:ml-64">
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-4">
              Are you sure you want to delete this {deleteConfirmation.type}? 
              {deleteConfirmation.name && ` (${deleteConfirmation.name})`}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation({ isOpen: false, id: null, type: null, name: null })}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (deleteConfirmation.type === 'method') {
                    await deleteDoc(doc(database, "shipping_methods", deleteConfirmation.id));
                    fetchShippingMethods();
                  } else if (deleteConfirmation.type === 'type') {
                    await deleteDoc(doc(database, "shipping_types", deleteConfirmation.id));
                    fetchShippingTypes();
                  }
                  setDeleteConfirmation({ isOpen: false, id: null, type: null, name: null });
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex space-x-4 border-b border-gray-200 px-4 pt-4">
        <button
          className={`px-4 py-2 font-medium ${activeTab === "types"
            ? "border-b-2 border-yellow-600 text-yellow-600"
            : "text-gray-600 hover:text-yellow-600"
            }`}
          onClick={() => setActiveTab("types")}
        >
          Shipping Types
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "methods"
            ? "border-b-2 border-yellow-600 text-yellow-600"
            : "text-gray-600 hover:text-yellow-600"
            }`}
          onClick={() => setActiveTab("methods")}
        >
          Shipping Methods
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "discounts"
            ? "border-b-2 border-yellow-600 text-yellow-600"
            : "text-gray-600 hover:text-yellow-600"
            }`}
          onClick={() => {
            setActiveTab("discounts");
            setIsModalOpen(true);
          }}
        >
          Discounts
        </button>

      </div>

      {activeTab === "types" && (
        <div className="p-4 space-y-6">
          <div className="bg-white p-4 rounded-lg">
            <ShippingType />
          </div>

          <div className="bg-white p-4 md:p-6 overflow-hidden border rounded-lg">
            <div className="flex justify-end mb-6">
              <div className="relative flex items-center">
                <input
                  type="name"
                  name="search"
                  className="h-10 w-full px-3 py-2 rounded-l-md border outline-none focus:ring-2 transition-all duration-200"
                  placeholder="Search..."
                  value={shippingMethodSearch}
                  onChange={(e) => setShippingMethodSearch(e.target.value)}
                />
                <button
                  type="submit"
                  className="h-10 px-3 rounded-r-md bg-yellow-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <h2 className="md:text-2xl font-bold text-gray-800 p-2">Available Shipping Types</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShippingTypes.map((type) => (
                    <tr key={type.id}>
                      <td className="px-6 py-4">
                        {editingTypeId === type.id ? (
                          <input className="border p-1 w-full" value={editingTypeName} onChange={(e) => setEditingTypeName(e.target.value)} />
                        ) : (
                          type.name
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs md:text-base">
                        {editingTypeId === type.id ? (
                          <input className="border p-1 w-full" value={editingTypeDescription} onChange={(e) => setEditingTypeDescription(e.target.value)} />
                        ) : (
                          type.description || "No description available"
                        )}
                      </td>
                      <td className="px-6 py-4 flex">
                        {editingTypeId === type.id ? (
                          <>
                            <button onClick={handleUpdateType} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Save</button>
                            <button onClick={() => setEditingTypeId(null)} className="ml-2 bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditType(type)} className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700">Edit</button>
                            <button onClick={() => handleDeleteType(type.id)} className="ml-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {isModalOpen && <CouponForm onClose={() => setIsModalOpen(false)} />}
        </div>
      )}

      {activeTab === "methods" && (
        <div className="p-4 space-y-6">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Add Shipping Method</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={selectedShippingType} onChange={(e) => setSelectedShippingType(e.target.value)} className="w-full border  border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all" required>
                <option value="">Select type</option>
                {shippingTypes.map((type) => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full border rounded p-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state.isoCode} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>

              <input type="number" value={shippingRate} onChange={(e) => setShippingRate(e.target.value)} placeholder="Shipping Rate (₹)" className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all" required />
              <input type="text" value={shippingTime} onChange={(e) => setShippingTime(e.target.value)} placeholder="Shipping Time" className="w-full border rounded  border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all" required />
              <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight (kg)" className="w-full border rounded p-2  border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all " required />
              <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Add Shipping Method</button>
            </form>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <div className="flex justify-end mb-6">
              <div className="relative flex items-center">
                <input
                  type="name"
                  name="search"
                  className="h-10 w-full px-3 py-2 rounded-l-md border outline-none focus:ring-2 transition-all duration-200"
                  placeholder="Search..."
                  value={shippingMethodSearch}
                  onChange={(e) => setShippingMethodSearch(e.target.value)}
                />
                <button
                  type="submit"
                  className="h-10 px-3 rounded-r-md bg-yellow-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Available Shipping Methods</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShippingMethods.map((method) => {
                    const isEditing = editingId === method.id;
                    return (
                      <tr key={method.id}>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select className="w-32" value={selectedShippingType} onChange={(e) => setSelectedShippingType(e.target.value)}>
                              <option value="">Select Type</option>
                              {shippingTypes.map((type) => (
                                <option key={type.id} value={type.name}>{type.name}</option>
                              ))}
                            </select>
                          ) : (
                            method.type
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input value={region} onChange={(e) => setRegion(e.target.value)} className="w-32" />
                          ) : (
                            method.region
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input value={shippingRate} onChange={(e) => setShippingRate(e.target.value)} className="w-32" />
                          ) : (
                            `₹${method.rate}`
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input value={shippingTime} onChange={(e) => setShippingTime(e.target.value)} className="w-32" />
                          ) : (
                            method.time
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input value={weight} onChange={(e) => setWeight(e.target.value)} className="w-32" />
                          ) : (
                            method.weight
                          )}
                        </td>
                        <td className="px-6 py-4 space-x-2">
                          {isEditing ? (
                            <>
                              <button onClick={handleSubmit} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Save</button>
                              <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(method)} className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700">Edit</button>
                              <button onClick={() => handleDelete(method.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === "discounts" && isModalOpen && (
        <div className="p-4">
          <CouponForm onClose={() => {
            setIsModalOpen(false);
            setActiveTab("types");
          }} />
        </div>
      )}

    </div>
  )
}
export default ShippingMethod