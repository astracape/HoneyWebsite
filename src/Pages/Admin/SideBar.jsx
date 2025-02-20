import React, { useState } from 'react'
import 'flowbite';


function SideBar() {
   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
   const toggleDrawer = () => {
      setIsDrawerOpen(!isDrawerOpen);
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

               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
               </svg>
            </button>
         </div>

         {/* <!-- drawer component --> */}
         <div
            className="hidden md:fixed top-0 md:h-screen md:block left-0 z-40 w-64 h-screen p-4  bg-black"
         >
            <h5 className="text-base font-semibold text-yellow-600 uppercase">Menu</h5>

            <div className="py-4">
               <ul className="space-y-2 font-medium">
                  <li>
                     <a href="/dashboard" className="flex items-center p-2 text-white ">
                        <span className="ms-3">Overview</span>
                     </a>
                  </li>
                  <li>
                     <a href="/addproduct" className="flex items-center p-2 text-white">

                        <span className="flex-1 ms-3 whitespace-nowrap">Add Products</span>
                     </a>
                  </li>
                  <li>
                     <a href="/addblog" className="flex items-center p-2 text-white ">

                        <span className="flex-1 ms-3 whitespace-nowrap">Add Blog</span>
                     </a>
                  </li>
                  <li>
                     <a href="/viewblog" className="flex items-center p-2 text-white ">

                        <span className="flex-1 ms-3 whitespace-nowrap">All blogs</span>
                     </a>
                  </li>
                  <li>
                     <a href="/viewproduct" className="flex items-center p-2 text-white">

                        <span className="flex-1 ms-3 whitespace-nowrap">View Products</span>
                     </a>
                  </li>
                  <li>
                     <a href="/orders" className="flex items-center p-2 text-white">

                        <span className="flex-1 ms-3 whitespace-nowrap">Orders</span>
                     </a>
                  </li>
               </ul>
            </div>
         </div>
        


         {/* mobile screen */}
         <div id="drawer-navigation"
            className={`fixed top-0 left-0 z-40 w-64 h-screen p-4 overflow-y-auto transition-transform duration-300 bg-black text-white ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}
            tabIndex="-1"
            aria-labelledby="drawer-navigation-label"
         >
            <h5 id="drawer-navigation-label" className="text-base font-semibold text-yellow-600 uppercase">Menu</h5>
            <button
               type="button"
               onClick={toggleDrawer}
               className="absolute top-2.5 right-2.5 text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5"
            >
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
               </svg>
            </button>
            <div className="py-4">
               <ul className="space-y-2 font-medium">
                  <li><a href="/dashboard" className="flex items-center p-2 text-white">Overview</a></li>
                  <li><a href="/addproduct" className="flex items-center p-2 text-white">Add Products</a></li>
                  <li><a href="/addblog" className="flex items-center p-2 text-white">Add Blog</a></li>
                  <li><a href="/viewblog" className="flex items-center p-2 text-white">All Blogs</a></li>
                  <li><a href="/viewproduct" className="flex items-center p-2 text-white">View Products</a></li>
                  <li><a href="/viewproduct" className="flex items-center p-2 text-white">Orders</a></li>

               </ul>
            </div>
         </div>
      </div>
   )
}

export default SideBar