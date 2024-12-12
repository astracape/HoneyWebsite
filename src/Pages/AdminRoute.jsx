import React from 'react'
import { Navigate } from 'react-router-dom';


    const AdminRoute = ({ element, isAuth, isAdmin }) => {
        return isAuth && isAdmin ? element : <Navigate to="/" />;
   
    return element;
      };
  


export default AdminRoute