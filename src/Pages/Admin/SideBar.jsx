import React, { useState } from 'react'
import 'flowbite';


function SideBar() {
   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
   const toggleDrawer = () => {
      setIsDrawerOpen(!isDrawerOpen);
   };
   return (
      <div>

         <div className="flex items-center mt-5">
            <div className="h-1 w-32 bg-gray-300"></div>


            <button className="ml-2 w-10 h-10 bg-yellow-600 text-white flex items-center justify-center rounded-full shadow-lg focus:outline-none"
               data-drawer-target="drawer-navigation"
               data-drawer-show="drawer-navigation"
               aria-controls="drawer-navigation"
               onClick={toggleDrawer}

               aria-expanded={isDrawerOpen}>

               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
               </svg>
            </button>
         </div>


         <div> </div>
         
         {/* <!-- drawer component --> */}
         <div id="drawer-navigation"
            className={`fixed top-0 left-0 z-40 w-64 h-screen p-4 overflow-y-auto transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} text-white bg-black`}
            tabIndex="-1"
            aria-labelledby="drawer-navigation-label">
            <h5 id="drawer-navigation-label" className="text-base font-semibold text-yellow-600 uppercase">Menu</h5>
            <button type="button" onClick={toggleDrawer} data-drawer-hide="drawer-navigation" aria-controls="drawer-navigation" className="text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 end-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" >
               <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
               <span className="sr-only">Close menu</span>
            </button>
            <div className="py-4 overflow-y-auto">
               <ul className="space-y-2 font-medium">
                  <li>
                     <a href="/dashboard" className="flex items-center p-2 text-white rounded-lg dark:text-white  group">
                        <span className="ms-3">Dashboard</span>
                     </a>
                  </li>
                  <li>
                     <a href="/addproduct" className="flex items-center p-2 text-white rounded-lg dark:text-white group">

                        <span className="flex-1 ms-3 whitespace-nowrap">Add Products</span>
                     </a>
                  </li>
                  <li>
                     <a href="/addblog" className="flex items-center p-2 text-white rounded-lg  group">

                        <span className="flex-1 ms-3 whitespace-nowrap">Add Blog</span>
                     </a>
                  </li>
                  <li>
                     <a href="/viewblog" className="flex items-center p-2 text-white rounded-lg  group">

                        <span className="flex-1 ms-3 whitespace-nowrap">All blogs</span>
                     </a>
                  </li>
                  <li>
                     <a href="/viewproduct" className="flex items-center p-2 text-white rounded-lg  group">

                        <span className="flex-1 ms-3 whitespace-nowrap">View Products</span>
                     </a>
                  </li>
               </ul>
            </div>
         </div>
      </div>
   )
}

export default SideBar