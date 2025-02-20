import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AOS from "aos";
import "aos/dist/aos.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import NavBar from './Pages/NavBar'
import HomePage from './Pages/Users/HomePage'
import Footer from './layouts/Footer'
import SideBar from './Pages/Admin/SideBar'
import AddProduct from './Pages/Admin/AddProduct'
import ProductPage from './Pages/Users/ProductPage'
import SingleProduct from './Pages/Users/SingleProduct'
import ViewProduct from './Pages/Admin/ViewProduct'
import AboutUs from './Pages/Users/AboutUs'
import EditProduct from './Pages/Admin/EditProduct'
import BlogPage from './Pages/Users/BlogPage'
import AddBlogs from './Pages/Admin/AddBlogs'
import Loginpage from './Pages/Loginpage'
import RegisterationPage from './Pages/RegisterationPage'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, database } from './FirebaseConfig'
import { get, ref } from 'firebase/database'
import AdminRoute from './Pages/AdminRoute'
import Dashboard from './Pages/Admin/Dashboard'
import FullBlogPage from './Pages/Users/FullBlogPage'
import ViewBlogs from './Pages/Admin/ViewBlogs'
import { BounceLoader } from "react-spinners";
import Cart from './Pages/Users/Cart'
import Checkout from './Pages/Users/Checkout';
import ForgotPassword from './Pages/ForgotPassword';
import SuccessPage from './Pages/SuccessPage';
import OrderDetails from './Pages/Admin/OrderDetails';
import OrderHistory from './Pages/OrderHistory';
import OrderManagement from './Pages/Admin/OrderManagement';
import UsersTable from './Pages/Admin/UsersTable';



function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  // const location = useLocation();


  // const isAdminPage = location.pathname.includes("/admin");
  useEffect(() => {
    AOS.init({ once: false });
  }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User is logged in:", user);

        setIsAuth(true);

        // Fetch user role from Firebase Database
        console.log('Logged in:', user);
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        console.log("User role data:", userData);
        setIsAdmin(userData?.role === 'admin');
      }
      else {
        console.log("User is logged out");
        setIsAuth(false);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <BounceLoader color="#FFA500" size={50} />
    </div>
  );
  console.log("isAuth:", isAuth); // Check if this is true when you manually type the URL

  return (
    <>
      <BrowserRouter>
        <NavBar isAuth={isAuth} setIsAuth={setIsAuth} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
        <Routes>
          {/* Admin Routes */}
          <Route
            path="/sidebar"
            element={
              <AdminRoute element={<><SideBar /></>} isAuth={isAuth} isAdmin={isAdmin} />
            }
          />
          <Route
            path="/addproduct"
            element={
              <AdminRoute element={<><SideBar /><AddProduct /></>} isAuth={isAuth} isAdmin={isAdmin} />
            }
          />
           <Route
            path="/users"
            element={
              <AdminRoute element={<><SideBar /><UsersTable /></>} isAuth={isAuth} isAdmin={isAdmin} />
            }
          />
           <Route
            path="/orders"
            element={
              <AdminRoute element={<><SideBar /><OrderManagement /></>} isAuth={isAuth} isAdmin={isAdmin} />
            }
          />
          {/* <Route
            path="/orders1"
            element={
              <AdminRoute element={<><Orders /></>} isAuth={isAuth} isAdmin={isAdmin} />
            }
          /> */}
          <Route
            path="/viewproduct"
            element={
              <AdminRoute element={<><SideBar /><ViewProduct /></>} isAuth={isAuth} isAdmin={isAdmin} />
            }
          />
          <Route
            path="/viewblog"
            element={
              <AdminRoute element={<><SideBar /><ViewBlogs /></>} isAuth={isAuth} isAdmin={isAdmin} />
            }
          />
          <Route
            path="/dashboard"
            element={
              <AdminRoute element={<><SideBar /><Dashboard /></>} isAuth={isAuth} isAdmin={isAdmin} />
            }
          />
          <Route
            path="/editproductbyid/:productId"
            element={
              <AdminRoute element={<><SideBar /><EditProduct /></>} isAuth={isAuth} isAdmin={isAdmin} />
            }
          />
          <Route
            path="/orderdetails/:userId/:orderId"
            element={
              <AdminRoute element={<><SideBar /><OrderDetails /></>} isAuth={isAuth} isAdmin={isAdmin} />
            }
          />
          <Route
            path="/addblog"
            element={
              <AdminRoute element={<><SideBar /><AddBlogs /></>} isAuth={isAuth} isAdmin={isAdmin} />
            }
          />

          {/* Public and User Routes */}

          <Route
            path="/login"
            element={isAuth ? <Navigate to="/" /> : <><Loginpage /><Footer /></>}
          />
          <Route
            path="/forgotpwd"
            element={isAuth ? <Navigate to="/" /> : <><ForgotPassword /><Footer /></>}
          />
          <Route
            path="/reg"
            element={isAuth ? <Navigate to="/" /> : <><RegisterationPage /><Footer /></>}
          />
          <Route
            path="/successpage"
            element={isAuth ? <SuccessPage /> : <Navigate to="/" />}
          />

          <Route
            path="/"
            element={<><HomePage /><Footer /></>}
          />
          <Route
            path="/productpage"
            element={<><ProductPage /><Footer /></>}
          />
          <Route
            path="/oh"
            element={isAuth ? <OrderHistory /> : <Navigate to="/login" />}
          />

          <Route
            path="/singleproduct/:productId"
            element={<><SingleProduct /><Footer /></>}
          />
          <Route
            path="/aboutus"
            element={<><AboutUs /><Footer /></>}
          />
          <Route
            path="/blog"
            element={<><BlogPage /><Footer /></>}
          />
          <Route
            path="/cart"
            element={<><Cart /><Footer /></>}
          />
          <Route
            path="/checkout"
            element={<><Checkout /><Footer /></>}
          />
          <Route
            path="/fullblog/:id"
            element={<><FullBlogPage /><Footer /></>}
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
