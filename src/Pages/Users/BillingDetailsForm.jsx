import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Country, State, City } from 'country-state-city';
import { useCheckout } from '../../context/CheckoutContext';

function BillingDetailsForm({ shippingData, onComplete }) {
    const { checkoutData, updateBilling ,setBillingComplete } = useCheckout();
    const [country, setCountry] = useState(null); 
    const [state, setState] = useState(null); 
    const [city, setCity] = useState([]); 
    const navigate = useNavigate();
    const [formData, setFormData] = useState(checkoutData.shipping || {
        firstName: shippingData?.firstName || '',
        lastName: shippingData?.lastName || '',
        country: shippingData?.country || 'India',
        state: shippingData?.state || '',
        city: shippingData?.city || '',
        address: shippingData?.address || '',
        apartment: shippingData?.apartment || '',
        pinCode: shippingData?.pinCode || '',
        phone: shippingData?.phone || '',
        email: shippingData?.email || '',
    });

    const indianStates = State.getStatesOfCountry("IN");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCountryChange = (e) => {
        const selectedCountry = Country.getAllCountries().find(c => c.isoCode === e.target.value);
        setCountry(selectedCountry);
        setState(null);
        setCity([]);
        setFormData(prev => ({
            ...prev,
            country: selectedCountry ? selectedCountry.name : '',
            state: '',
            city: ''
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateBilling(formData);
        // onComplete(formData);
         setBillingComplete(true);
        navigate('/checkout');
    };

    return (
        <div className="container mx-auto p-8 md:w-2/3">
            <h2 className="text-2xl font-semibold mb-6">Billing Information</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col">
                        <label className="text-gray-700">First Name *</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="mt-2 px-4 py-2 border rounded-md w-full"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-700">Last Name *</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="mt-2 px-4 py-2 border rounded-md w-full"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
                    <div className="flex flex-col">
                        <label className="text-gray-700">Country *</label>
                        <select
                            name="country"
                            value={country?.isoCode || ""}
                            onChange={handleCountryChange}
                            className="mt-2 px-4 py-2 border rounded-md w-full"
                            required
                        >
                            <option value="">Select Country</option>
                            {Country.getAllCountries().map((c) => (
                                <option key={c.isoCode} value={c.isoCode}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-700">Address *</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="mt-2 px-4 py-2 border rounded-md w-full"
                            required
                        />
                    </div>
                    <div className="flex flex-col mt-4">
                                      <label htmlFor="apartment" className="text-gray-700 self-start">Apartment, Suite, Unit, etc. (optional)</label>                                        <input
                                           type="text"
                                           id="apartment" value={formData.apartment} name="apartment" onChange={handleInputChange} className="mt-2 px-4 py-2 border rounded-md w-full"
                                       />
                                   </div>
                    <div className="flex flex-col mt-4">
                                        <label htmlFor="state" className="text-gray-700 self-start">State *</label>
                                    
                                       <select
                                           name="state"
                                           value={formData.state}
                                           onChange={handleInputChange}
                                           className="mt-2 px-4 py-2 border rounded-md w-full"
                                           required
                                       >
                                           <option value="">Select State</option>
                                           {indianStates.map((state) => (
                                               <option key={state.isoCode} value={state.name}>
                                                   {state.name}
                                               </option>
                                           ))}
                                       </select>
                                   </div>
                               </div>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                   <div className="flex flex-col mt-4">
                                       <label htmlFor="city" className="text-gray-700 self-start">Town / City *</label>
       
                                       <input
                                           type="text"
                                           id="city" value={formData.city} name="city" onChange={handleInputChange} className="mt-2 px-4 py-2 border rounded-md w-full"
                                       />
                                   </div>
       
       
       
                                   <div className="flex flex-col mt-4">
                                       <label htmlFor="pinCode" className="text-gray-700 self-start">PIN Code *</label>
                                       <input
                                           type="text"
                                           id="pinCode"
                                           name="pinCode"
                                           onChange={handleInputChange}
                                           className="mt-2 px-4 py-2 border rounded-md w-full"
                                           required
                                       />
       
                                   </div>
                               </div>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                   <div className="flex flex-col mt-4">
                                       <label htmlFor="phone" className="text-gray-700 self-start">Phone *</label>
                                       <input
                                           type="text"
                                           id="phone"
                                           name="phone"
                                           placeholder='+91 Phone Number'
                                           onChange={handleInputChange}
                                           className="mt-2 px-4 py-2 border rounded-md w-full"
                                           maxLength={14}
                                           minLength={10}
                                           pattern="\+?[0-9\s\-\(\)]*"
                                           inputMode='numeric'
                                           required
                                       />
                                   </div>
       
       
                                   <div className="flex flex-col mt-4">
                                       <label htmlFor="email" className="text-gray-700 self-start">Email address *</label>
                                       <input
                                           type="email"
                                           id="email"
                                           name="email"
                                           onChange={handleInputChange}
                                           className="mt-2 px-4 py-2 border rounded-md w-full"
                                           required
                                       />
                                   </div>
                </div>

        
                <div className="mt-8 flex justify-between gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/checkout')}
                        className="px-6 py-3 border rounded-md"
                    >
                        Back to Shipping
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-yellow-600 text-white rounded-md"
                    >
                        Continue to Payment
                    </button>
                </div>
            </form>
        </div>
    );
}

export default BillingDetailsForm;