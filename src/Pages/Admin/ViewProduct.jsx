import React, { useEffect, useState } from 'react'
import { ref, onValue, remove } from 'firebase/database';
import { database } from '../../FirebaseConfig'
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactPaginate from 'react-paginate';

function ViewProduct() {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    const location = useLocation();


    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const category = queryParams.get('category') || 'all';  // Default to 'all'
        setSelectedCategory(category);
    }, [location]);



    useEffect(() => {
        const productsRef = ref(database, 'products/categories');
        onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const productList = Object.entries(data)
                    .flatMap(([category, productByCategory]) =>
                        Object.entries(productByCategory).map(([id, product]) => ({
                            id,
                            category,
                            ...product,
                        }))
                    );
                setProducts(productList);
            }
        });
    }, []);
    const removeProduct = (productId, category) => {
        const productRef = ref(database, `products/categories/${category}/${productId}`);
        remove(productRef)
            .then(() => {
                toast.success("Product removed successfully");
                setProducts(products.filter(product => product.id !== productId));
            })
            .catch((error) => {
                toast.error("Error removing product:", error);
            });
    };


    const categories = ["all", "honey", "spices", "oil", "coconut", "nuts", "wholesale"];

    const filteredProducts = products.filter(product =>
        selectedCategory === "all" || product.category === selectedCategory
    );

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortOrder === "lowToHigh") return a.price - b.price;
        if (sortOrder === "highToLow") return b.price - a.price;
        return 0;
    });
    const offset = currentPage * itemsPerPage;
    const paginatedProducts = sortedProducts.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(sortedProducts.length / itemsPerPage);
    return (
        <div className='md:ml-52 md:p-6 p-2 min-h-screen'>

            <div class="relative  shadow-md sm:rounded-lg p-4 md:p-10">
            
                <div className="flex  mb-8 gap-4">
                    <div className='flex justify-end items-end gap-4 flex-col  md:flex-row'>
                        <div className='flex gap-2'>
                            <p>category:</p>
                            <select
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                value={selectedCategory}
                                className="px-4 py-3 border-2 border-yellow-600 rounded-lg text-gray-900 bg-white shadow-md focus:outline-none focus:ring-2 focus:border-transparent focus:ring-yellow-600"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='flex gap-2'>
                            <p>sort:</p>
                            <select
                                onChange={(e) => setSortOrder(e.target.value)}
                                value={sortOrder}
                                className="px-4 py-3 border-2 border-yellow-600 rounded-lg text-gray-900 bg-white shadow-md focus:outline-none focus:border-transparent focus:ring-2 focus:ring-yellow-600"
                            >
                                <option value="">Sort by</option>
                                <option value="lowToHigh" >Price: Low to High</option>
                                <option value="highToLow">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                   
         
                </div>
                <div className="overflow-x-auto w-full">
                <table class="w-full border text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-200 uppercase bg-black text-center">
                        <tr>
                            <th scope="col" class="px-16 py-3">
                                <span class="sr-only">Image</span>
                            </th>
                            <th scope="col" class="px-6 py-3">
                                ProductName
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Category
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Price
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProducts.length > 0 ? (
                            paginatedProducts.map(product => (
                                <tr class=" border bg-white dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-50 text-center">
                                    <td class="p-4">
                                        <div className='flex justify-center items-center'>
                                            <img src={product.imageUrl} alt={product.name} className="w-24 h-36 object-cover" />
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 font-semibold text-gray-900 ">

                                        <h2 className="font-bold mt-2 text-black">{product.name}</h2>

                                    </td>
                                    <td class="px-6 py-4 text-black font-semibold">
                                        <p>{product.category}</p>
                                    </td>
                                    <td class="px-6 py-4 font-semibold text-black">

                                        <p>{product.price}</p>

                                    </td>
                                    <td class="px-6 py-4">
                                        <div className='flex  justify-center items-center'>
                                            <div className='bg-red-600 w-24 h-10 rounded-md flex justify-center items-center'>
                                                <button onClick={() => removeProduct(product.id, product.category)} class="font-medium text-white hover:underline">Remove</button>
                                            </div>
                                            <div className='bg-yellow-600 w-24 h-10 rounded-md ml-5 flex justify-center items-center'>
                                                <a href={`/editproductbyid/${product.id}`} class="font-medium text-white hover:underline">Edit</a>
                                            </div>
                                        </div>


                                    </td>
                                </tr>
                            ))
                        ) : (
                            <p className="col-span-3 text-center mt-16 font-bold">No products available</p>
                        )}


                    </tbody>
                </table>
                </div>
                <div className="mt-6 flex justify-center">
                        <ReactPaginate
                            previousLabel={"← Previous"}
                            nextLabel={"Next →"}
                            pageCount={pageCount}
                            onPageChange={({ selected }) => setCurrentPage(selected)}
                            containerClassName={"flex space-x-2"}
                            pageClassName={"px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-200"}
                            previousClassName={"px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-200"}
                            nextClassName={"px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-200"}
                            activeClassName={"bg-yellow-600 text-white"}
                        />
                    </div>
            </div>
        </div>
    )
}

export default ViewProduct