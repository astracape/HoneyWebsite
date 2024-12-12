import React, { useEffect, useState } from 'react'
import { ref, onValue,remove } from 'firebase/database';
import { database } from '../../FirebaseConfig'
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function ViewProduct() {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    
   
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

    
    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter((product) => product.category === selectedCategory);
  return (
    <div>
        
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg p-10">
        <div className="flex flex-col items-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Categories</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className="bg-transparent border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors duration-300 px-6 py-2 rounded-full shadow-md"
                    >
                        All
                    </button>
                    <button
                        onClick={() => setSelectedCategory('honey')}
                        className="bg-transparent border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors duration-300 px-6 py-2 rounded-full shadow-md"
                    >
                        Honey
                    </button>
                    <button
                        onClick={() => setSelectedCategory('spices')}
                        className="bg-transparent border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors duration-300 px-6 py-2 rounded-full shadow-md"
                    >
                        Spices
                    </button>
                    <button
                        onClick={() => setSelectedCategory('oil')}
                        className="bg-transparent border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors duration-300 px-6 py-2 rounded-full shadow-md"
                    >
                        Oil
                    </button>
                    <button
                        onClick={() => setSelectedCategory('coconut')}
                        className="bg-transparent border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors duration-300 px-6 py-2 rounded-full shadow-md"
                    >
                        Coconut
                    </button>
                </div>
            </div>
                <table class="w-full border text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 text-center">
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
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <tr class=" border bg-white dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-50 text-center">
                                    <td class="p-4">
                                        <div className='flex justify-center items-center'>
                                            <img src={product.imageUrl} alt={product.name} className="w-24 h-36 object-cover" />
                                        </div>
                                        {/* <img src="/docs/images/products/apple-watch.png" class="w-16 md:w-32 max-w-full max-h-full" alt="Apple Watch"/> */}
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
                                                <button  onClick={() => removeProduct(product.id, product.category)} class="font-medium text-white hover:underline">Remove</button>
                                            </div>
                                            <div className='bg-yellow-600 w-24 h-10 rounded-md ml-5 flex justify-center items-center'>
                                                <a href={`/editproductbyid/${product.id}`}  class="font-medium text-white hover:underline">Edit</a>
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
    </div>
  )
}

export default ViewProduct