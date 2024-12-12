import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { getDatabase, ref, get, set } from "firebase/database";
import img from "../assets/productpage.jpg"
import { getAuth } from 'firebase/auth';
import { database } from '../FirebaseConfig';
import { ToastContainer, toast } from 'react-toastify';

function SingleProduct() {
  const { productId } = useParams(); // Get productId from URL
  console.log("Product ID from URL:", productId);
  const [product, setProduct] = useState(null);
  const db = getDatabase(); // Initialize the Firebase database

  useEffect(() => {
    const fetchProduct = async () => {
      try {

        const categories = ['honey', 'spices', 'oil', 'coconut'];
        let foundProduct = null;

        for (let category of categories) {
          const productRef = ref(db, `products/categories/${category}/${productId}`);
          const snapshot = await get(productRef);

          if (snapshot.exists()) {
            foundProduct = snapshot.val();
            foundProduct.category = category;
            setProduct(foundProduct);
            break;
          }
        }

        if (!foundProduct) {
          toast.error("No data available for this product ID in any category");
        }
      } catch (error) {
        toast.error("Error fetching product:", error);
      }
    };
    fetchProduct()
  }, [productId, db]);

  if (!product) {
    return <p>Loading...</p>; // Loading state while fetching
  }

  const auth = getAuth();

  const addToCart = async (product) => {
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid;
      const userCartRef = ref(database, `users/${userId}/details/cart`);

      try {
        // Get the current cart for the user
        const snapshot = await get(userCartRef);
        const currentCart = snapshot.val() || [];


        const updatedCart = [...currentCart, product];
        await set(userCartRef, updatedCart);

        toast.success("The product added to cart successfully")
      } catch (error) {
        toast.error("Error updating cart:", error);
      }
    } else {
      // Prompt login if user is not authenticated
      navigate('/login');
    }
  };
  return (
    <div>
      <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}>
        {/* <div className="absolute inset-0 bg-black opacity-50"></div> */}
        <div className='p-10 flex justift-center items-center h-full'>
          <div className='font-thin text-7xl bebas-neue-regular'>{product.name}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-20 w-full h-auto">
        <div className='flex justify-end items-end'>
          <img src={product.imageUrl} alt={product.name} className="w-96 h-96 object-cover mb-4 rounded" />
        </div>
        <div className='my-auto flex flex-col justify-start items-start'>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-xl font-semibold mt-4">₹{product.price}</p>
          <p className="text-gray-500 mt-2">Category: {product.category}</p>

          <button
            className="mt-4 px-4 py-2 bg-[#9C3618] text-white rounded-md" onClick={() => addToCart(product)}>

            Add to Cart
          </button>
        </div>
      </div>
      <div className='p-10 font-semibold'>
        <h1 className='text-4xl font-bold'>Description</h1>
        <p className="text-gray-600 mt-2">{product.description}</p>
      </div>
      <p className='font-bold p-10 italic'>Try it today!</p>
      <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
    </div>
  )
}

export default SingleProduct