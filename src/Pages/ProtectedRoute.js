import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { auth } from '../FirebaseConfig';
import { Navigate } from 'react-router-dom';


const ProtectedRoute = ({ element, isAuth }) => {
    return isAuth ? element : <Navigate to="/reg" />;
  };

export default ProtectedRoute