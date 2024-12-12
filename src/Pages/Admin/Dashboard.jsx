import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { database } from '../../FirebaseConfig';
import { get, ref } from 'firebase/database';
// import { Bar } from 'react-chartjs-2';

function Dashboard() {
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalBlogs, setTotalBlogs]=useState(0);
    const [totalUsers, setTotalUsers]=useState(0)
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        const fetchTotalProducts = async () => {
            try {
                const productsRef = ref(database, 'products/categories');
                const snapshot = await get(productsRef);
                if (snapshot.exists()) {
                    const products = snapshot.val();
                    const productCount = Object.keys(products).reduce((count, category) => count + Object.keys(products[category]).length, 0);
                    setTotalProducts(productCount); 
                }
            } catch (error) {
                console.error("Error fetching total products:", error);
            }
        };

        fetchTotalProducts();
    }, []);

    useEffect(() => {
        const fetchTotalBlogs = async () => {
            try {
                const blogRef = ref(database, 'blogs');
                const snapshot = await get(blogRef);
                if (snapshot.exists()) {
                    const blogs = snapshot.val();
                    const blogCount = Object.keys(blogs).length;
                    setTotalBlogs(blogCount); // Calculate total products
                }
            } catch (error) {
                console.error("Error fetching total products:", error);
            }
        };

        fetchTotalBlogs();
    }, []);

    useEffect(() => {
        const fetchTotalUsers = async () => {
            try {
                const userRef = ref(database, 'users');
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    const userCount = Object.keys(users).length;
                    setTotalUsers(userCount); // Calculate total products
                }
            } catch (error) {
                console.error("Error fetching total products:", error);
            }
        };

        fetchTotalUsers();
    }, []);

 
  return (
    <div>
        <div className="flex flex-col">
            

            {/* <div className="flex-1 p-4"> */}
                

                <div className="mt-4">
                    {/* <Bar data={data} /> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 p-10 mx-auto">
                    <div className="bg-white p-4 rounded shadow w-64 flex flex-col items-center border border-b-4 border-yellow-600">
                        <h3 className="text-xl">Total Products</h3>
                        <p className="text-3xl">{totalProducts}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow w-64 flex flex-col items-center border border-b-4 border-yellow-600">
                        <h3 className="text-xl">Total Blogs</h3>
                        <p className="text-3xl">{totalBlogs}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow w-64 flex flex-col items-center border border-b-4 border-yellow-600">
                        <h3 className="text-xl">Total Users</h3>
                        <p className="text-3xl">{totalUsers}</p>
                    </div>
                </div>
            {/* </div> */}
            
        
      
    </div>
    </div>
  )
}

export default Dashboard