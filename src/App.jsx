import { lazy, Suspense, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AOS from "aos";
import "aos/dist/aos.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './index.css';

import NavBar from './Pages/NavBar';
import HomePage from './Pages/Users/HomePage'
const Footer = lazy(() => import('./layouts/Footer'))
import SideBar from './Pages/Admin/SideBar';
const AddProduct = lazy(() => import('./Pages/Admin/AddProduct'))
import ProductPage from './Pages/Users/ProductPage'
const SingleProduct = lazy(() => import('./Pages/Users/SingleProduct'))
const ViewProduct = lazy(() => import('./Pages/Admin/ViewProduct'))
import AboutUs from './Pages/Users/AboutUs'
const EditProduct = lazy(() => import('./Pages/Admin/EditProduct'))
import BlogPage from './Pages/Users/BlogPage'
const AddBlogs = lazy(() => import('./Pages/Admin/AddBlogs'))
const Loginpage = lazy(() => import('./Pages/Loginpage'))
const RegisterationPage = lazy(() => import('./Pages/RegisterationPage'))
import { onAuthStateChanged } from 'firebase/auth'
import { auth, database } from './FirebaseConfig'
const AdminRoute = lazy(() => import('./Pages/AdminRoute'))
import Dashboard from './Pages/Admin/Dashboard';
import FullBlogPage from './Pages/Users/FullBlogPage'
import ViewBlogs from './Pages/Admin/ViewBlogs'
import { BounceLoader } from "react-spinners";
import Cart from './Pages/Users/Cart'
const Checkout = lazy(() => import('./Pages/Users/Checkout'))
const ForgotPassword = lazy(() => import('./Pages/ForgotPassword'))
const SuccessPage = lazy(() => import('./Pages/SuccessPage'));
import OrderDetails from './Pages/Admin/OrderDetails';
const OrderHistory = lazy(() => import('./Pages/OrderHistory'));
import OrderManagement from './Pages/Admin/OrderManagement';
import UsersTable from './Pages/Admin/UsersTable';
import { doc, getDoc } from 'firebase/firestore';
import AddCategory from './Pages/Admin/AddCategory';
import ShippingMethod from './Pages/Admin/ShippingMethod';
import ShippingType from './Pages/Admin/ShippingType';
import CouponForm from './Pages/Admin/CouponForm';
import CouponList from './Pages/Users/CouponList';
import CouponBanner from './layouts/CouponBanner';
import ViewCoupons from './Pages/Admin/ViewCoupons';
import ContactRequest from './Pages/Admin/ContactRequest';
import BillingDetails from './Pages/Users/BillingDetailsForm';
import BillingDetailsForm from './Pages/Users/BillingDetailsForm';
import BillingWrapper from './Pages/Users/BillingWrapper';
import GiftHamper from './Pages/Users/GiftHamper';
import Reviews from './Pages/Users/Reviews';
import AddReviews from './Pages/Admin/AddReviews';
import ScrollToTop from './Components/ScrollToTop';
import Profile from './Pages/Users/Profile';
import TermsOfUse from './Pages/Users/TermsOfUse';



function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName,setUserName]= useState()

  useEffect(() => {
    AOS.init({ once: false });
  }, []);
 
useEffect(() => {
  // Subscribe to Firebase auth state changes
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    console.log("Auth state changed user:", user?.uid, user?.email, user?.phoneNumber);

    try {
      if (!user) {
        console.log("User signed out or not available yet");
        setIsAuth(false);
        setIsAdmin(false);
        return;
      }

      // Reload ensures we have the latest status (optional, but safe)
      await user.reload();
      user = auth.currentUser;

      // Skip email verification only for phone logins
      if (user?.email && !user.emailVerified && !user.phoneNumber) {
        console.warn("Email user not verified → signing out");
        await signOut(auth);
        localStorage.removeItem("userId");
        sessionStorage.clear();
        setIsAuth(false);
        setIsAdmin(false);
        setAccountDropdownOpen(false);
        return;
      }

      // Proceed with logged-in user
      setIsAuth(true);
      localStorage.setItem("userId", user.uid);

      // Fetch user role
      const userRef = doc(database, "users", user.uid);
      const snapshot = await getDoc(userRef);
      const userData = snapshot.data();

      if (userData) {
        setIsAdmin(userData.role === "admin");
        setUserName(userData.name || "User");
      }
    } catch (err) {
      console.error("Error in onAuthStateChanged:", err);
    }
  });

  // Cleanup listener on unmount
  return () => unsubscribe();
}, []);




  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <CouponBanner />
        <NavBar isAuth={isAuth} setIsAuth={setIsAuth} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><BounceLoader color="#FFA500" size={50} /></div>}>
          <div className="pt-24">
            <Routes >
              {/* Admin Routes */}
              <Route path="/sidebar" element={<AdminRoute element={<><SideBar /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              <Route path="/addproduct" element={<AdminRoute element={<><SideBar /><AddProduct /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              <Route path="/users" element={<AdminRoute element={<><SideBar /><UsersTable /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              <Route path="/category" element={<AdminRoute element={<><SideBar /><AddCategory /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              <Route path="/shippingmethod" element={<AdminRoute element={<><SideBar /><ShippingMethod /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              <Route path="/shippingtypes" element={<AdminRoute element={<><SideBar /><ShippingType /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              <Route path="/coupon" element={<AdminRoute element={<><SideBar /><CouponForm /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              <Route path="/viewcoupons" element={<AdminRoute element={<><SideBar /><ViewCoupons /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              <Route path="/contactreq" element={<AdminRoute element={<><SideBar /><ContactRequest /></>} isAuth={isAuth} isAdmin={isAdmin} />} />




              <Route path="/orders" element={<AdminRoute element={<><SideBar /><OrderManagement /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              {/* <Route
            path="/orders1"
            element={
              <AdminRoute element={<><Orders /></>} isAuth={isAuth} isAdmin={isAdmin} />
            }
          /> */}
              <Route path="/viewproduct" element={<AdminRoute element={<><SideBar /><ViewProduct /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              <Route path="/viewblog" element={<AdminRoute element={<><SideBar /><ViewBlogs /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              <Route path="/dashboard" element={<AdminRoute element={<><SideBar /><Dashboard /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              <Route path="/editproductbyid/:productId" element={<AdminRoute element={<><SideBar /><EditProduct /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              <Route path="/orderdetails/:orderId" element={<AdminRoute element={<><SideBar /><OrderDetails /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              <Route path="/addblog" element={<AdminRoute element={<><SideBar /><AddBlogs /></>} isAuth={isAuth} isAdmin={isAdmin} />} />
              <Route path="/addreviews" element={<AdminRoute element={<><SideBar /><AddReviews /></>} isAuth={isAuth} isAdmin={isAdmin} />} />

              {/* Public and User Routes */}

              <Route
                path="/login"
                element={isAuth ? <Navigate to="/" /> : <><Loginpage /><Footer /></>}
              />
              <Route
                path="/profile"
                element={isAuth ? <Profile /> : <Navigate to="/reg" />}
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
                path="/termsofuse"
                element={<><TermsOfUse /><Footer /></>}
              />
              <Route
                path="/gifting"
                element={<><GiftHamper /><Footer /></>}
              />
              <Route
                path="/couponlist"
                element={<><CouponList /><Footer /></>}
              />
              <Route
                path="/oh"
                element={isAuth ? <OrderHistory /> : <Navigate to="/reg" />}
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
                path="/reviews"
                element={<><Reviews /><Footer /></>}
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
                path="/billing"
                element={
                  <BillingWrapper />
                }
              />
              <Route
                path="/fullblog/:id"
                element={<><FullBlogPage /><Footer /></>}
              />
            </Routes>
          </div>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
