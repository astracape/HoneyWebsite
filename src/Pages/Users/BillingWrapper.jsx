import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import BillingDetailsForm from './BillingDetailsForm';

function BillingWrapper() {
    const location = useLocation();  
    const navigate = useNavigate(); 
  return (
    <div>
 <BillingDetailsForm
      shippingData={location.state?.shippingData}
      onComplete={(billingData) => {
        navigate('/checkout', { state: { billingData } });
      }}
    />
    </div>
  )
}

export default BillingWrapper