import React, { useState } from 'react'
import 'flowbite';
import { Link } from 'react-router-dom';
import { FaBox, FaShippingFast, FaNewspaper, FaClipboardList, FaBars, FaTimes, FaProductHunt, FaBoxes, FaSms, FaVoicemail } from 'react-icons/fa';

function SideBar() {
   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
   const [isProductsOpen, setIsProductsOpen] = useState(false);
   const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
   const [isShippingOpen, setIsShippingOpen] = useState(false);
   const[isBlogOpen,setIsBlogOpen]=useState(false)
   const toggleDrawer = () => {
      setIsDrawerOpen(!isDrawerOpen);
   };
      const toggleProducts = () => setIsProductsOpen(!isProductsOpen);
      const toggleCategories = () => setIsCategoriesOpen(!isCategoriesOpen);
      const toggleShipping = () => setIsShippingOpen(!isShippingOpen);
 const toggleBlogs=()=>setIsBlogOpen(!isBlogOpen)

 const closeDrawer = () => {
   setIsDrawerOpen(false);
};
   return (
      <div>

         <div className="flex items-center mt-5 md:hidden">
            <div className="h-1 w-32 bg-gray-300"></div>


            <button className="ml-2 w-10 h-10 bg-yellow-600 text-white flex items-center justify-center rounded-full shadow-lg focus:outline-none"
               // data-drawer-target="drawer-navigation"
               // data-drawer-show="drawer-navigation"
               // aria-controls="drawer-navigation"
               onClick={toggleDrawer}

               aria-expanded={isDrawerOpen}>

               {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
               </svg> */}
                {isDrawerOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
         </div>

        
         <div
            className="hidden lg:fixed top-0  lg:block left-0 z-40 w-64 h-screen p-4  bg-black"
         >
            <h5 className="mt-6 text-base font-semibold text-yellow-600 uppercase">Menu</h5>

            <div className="py-4">
               <ul className="space-y-2 font-medium">
                  <li>
                     <Link to="/dashboard" className="flex items-center p-2 text-white ">
                     <FaClipboardList className="mr-2 text-white" />
                        <span className="ms-3">Overview</span>
                     </Link>
                  </li>
                 
                   <li>
                     <button onClick={toggleCategories} className="flex items-center w-full p-2 text-white focus:outline-none">
                        <FaBox className="mr-2" />
                        <span className='ms-3'>Categories</span>
                     </button>
                     {isCategoriesOpen && (
                        <ul className="ml-6 space-y-1">
                           <li><Link to="/category" className="block p-2 text-white">Add/View Category</Link></li>
                        </ul>
                     )}
                  </li>
                  <li>
                     <button onClick={toggleProducts} className="flex items-center w-full p-2 text-white focus:outline-none">
                        <FaBoxes className="mr-2" />
                        <span className='ms-3'>Products</span>
                     </button>
                     {isProductsOpen && (
                        <ul className="ml-6 space-y-1">
                           <li><Link to="/addproduct" className="block p-2 text-white">Add Product</Link></li>
                           <li><Link to="/viewproduct" className="block p-2 text-white">View Products</Link></li>
                        </ul>
                     )}
                  </li>
                  <li>
                     <button onClick={toggleBlogs} className="flex items-center w-full p-2 text-white focus:outline-none">
                        <FaNewspaper className="mr-2" />
                        <span className='ms-3'>Blogs</span>
                     </button>
                     {isBlogOpen && (
                        <ul className="ml-6 space-y-1">
                           <li><Link to="/addblog" className="block p-2 text-white">Add Blog</Link></li>
                           <li><Link to="/viewblog" className="block p-2 text-white">View Blogs</Link></li>
                        </ul>
                     )}
                  </li>
                
                  
                  <li>
                     <Link to="/orders" className="flex items-center p-2 text-white">
                     <FaClipboardList className="mr-2 inline" />
                        <span className="flex-1 ms-3 whitespace-nowrap">Orders</span>
                     </Link>
                  </li>
                  <li>
                     <Link to="/shippingmethod" className="flex items-center p-2 text-white">
                     <FaShippingFast className="mr-2" />
                        <span className="flex-1 ms-3 whitespace-nowrap"> Shipping Methods</span>
                     </Link>
                  </li>
                  <li>
                     <Link to="/contactreq" className="flex items-center p-2 text-white">
                     <FaVoicemail className="mr-2" />
                        <span className="flex-1 ms-3 whitespace-nowrap"> Contact Requests</span>
                     </Link>
                  </li>
               </ul>
            </div>
         </div>
        


         {/* mobile screen */}
         <div id="drawer-navigation "
            className={`fixed top-0 left-0 z-40 w-64 h-screen p-4 overflow-y-auto transition-transform duration-300 bg-black text-white ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden`}
            tabIndex="-1"
            aria-labelledby="drawer-navigation-label"
         >
            <h5 id="drawer-navigation-label" className="text-base font-semibold text-yellow-600 uppercase mt-5">Menu</h5>
            <button
               type="button"
               onClick={toggleDrawer}
               className="absolute top-2.5 right-2.5 text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5"
            >
               <svg className="w-5 h-5 mt-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
               </svg>
            </button>
            <div className="py-4">
            <ul className="space-y-2 font-medium">
                  <li>
                     <Link to="/dashboard" className="flex items-center p-2 text-white ">
                     <FaClipboardList className="mr-2 text-white" />
                        <span className="ms-3"  onClick={closeDrawer}>Overview</span>
                     </Link>
                  </li>
                 
                   <li>
                     <button onClick={toggleCategories} className="flex items-center w-full p-2 text-white focus:outline-none">
                        <FaBox className="mr-2" />
                        <span className='ms-3'>Categories</span>
                     </button>
                     {isCategoriesOpen && (
                        <ul className="ml-6 space-y-1">
                           <li><Link to="/category" onClick={closeDrawer} className="block p-2 text-white">Add/View Category</Link></li>
                        </ul>
                     )}
                  </li>
                  <li>
                     <button onClick={toggleProducts} className="flex items-center w-full p-2 text-white focus:outline-none">
                        <FaBoxes className="mr-2" />
                        <span className='ms-3'>Products</span>
                     </button>
                     {isProductsOpen && (
                        <ul className="ml-6 space-y-1">
                           <li><Link to="/addproduct" onClick={closeDrawer} className="block p-2 text-white">Add Product</Link></li>
                           <li><Link to="/viewproduct"  onClick={closeDrawer} className="block p-2 text-white">View Products</Link></li>
                        </ul>
                     )}
                  </li>
                  <li>
                     <button onClick={toggleBlogs} className="flex items-center w-full p-2 text-white focus:outline-none">
                        <FaNewspaper className="mr-2" />
                        <span className='ms-3'>Blogs</span>
                     </button>
                     {isBlogOpen && (
                        <ul className="ml-6 space-y-1">
                           <li><Link to="/addblog"  onClick={closeDrawer} className="block p-2 text-white">Add Blog</Link></li>
                           <li><Link to="/viewblog"  onClick={closeDrawer} className="block p-2 text-white">View Blogs</Link></li>
                        </ul>
                     )}
                  </li>
                
                  
                  <li>
                     <Link to="/orders" className="flex items-center p-2 text-white">
                     <FaClipboardList className="mr-2 inline" />
                        <span className="flex-1 ms-3 whitespace-nowrap"  onClick={closeDrawer}>Orders</span>
                     </Link>
                  </li>
                  <li>
                     <Link to="/shippingmethod" className="flex items-center p-2 text-white">
                     <FaShippingFast className="mr-2" />
                        <span  onClick={closeDrawer} className="flex-1 ms-3 whitespace-nowrap"> Shipping Methods</span>
                     </Link>
                  </li>
                  <li>
                     <Link to="/contactreq" className="flex items-center p-2 text-white">
                     <FaVoicemail className="mr-2" />
                        <span   onClick={closeDrawer} className="flex-1 ms-3 whitespace-nowrap"> Contact Requests</span>
                     </Link>
                  </li>
               </ul>
            </div>
         </div>
      </div>
   )
}

export default SideBar