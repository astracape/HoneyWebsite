import React, { useState } from 'react';
import CouponList from '../Pages/Users/CouponList';

function CouponBanner() {
  const [hasCoupons, setHasCoupons] = useState(true); // Default to true to initially render

  return (
    <div className={`fixed top-0 left-0 w-screen ${hasCoupons ? 'h-6' : 'h-0'} z-50 transition-all duration-300`}>
      <CouponList onCheckValid={(isValid) => setHasCoupons(isValid)} />
    </div>
  );
}

export default CouponBanner;