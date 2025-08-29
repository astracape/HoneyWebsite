import { createContext, useContext, useState } from 'react';

const CheckoutContext = createContext();

export function CheckoutProvider({ children }) {
  const [checkoutData, setCheckoutData] = useState({
    shipping: {},  // Stores shipping form data
    billing: {},   // Stores billing form data
     useSameAddress: true,
     billingComplete: false
  });
const resetCheckout = () => {
  setCheckoutData({
    shipping: {},
    billing: {},
    useSameAddress: true,
    billingComplete: false,
  });
};

  const updateShipping = (data) => {
    setCheckoutData(prev => ({ ...prev, shipping: data }));
  };

  const updateBilling = (data) => {
    setCheckoutData(prev => ({ ...prev, billing: data }));
  };
 const setUseSameAddress = (value) => {
    setCheckoutData(prev => ({ ...prev, useSameAddress: value }));
  };
    const setBillingComplete = (value) => {
    setCheckoutData(prev => ({ ...prev, billingComplete: value }));
  };
  return (
    <CheckoutContext.Provider
      value={{ checkoutData, updateShipping, updateBilling,setUseSameAddress ,setBillingComplete,resetCheckout}}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => useContext(CheckoutContext);