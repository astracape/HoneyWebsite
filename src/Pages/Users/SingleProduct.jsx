import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { getDatabase, ref, get, set } from "firebase/database";
import img from "../../assets/productpage.jpg"
import { getAuth } from 'firebase/auth';
import { database } from '../../FirebaseConfig';
import { ToastContainer, toast } from 'react-toastify';

function SingleProduct() {
  const { productId } = useParams(); // Get productId from URL
  console.log("Product ID from URL:", productId);
  const [product, setProduct] = useState(null);
  const db = getDatabase(); // Initialize the Firebase database

  useEffect(() => {
    const fetchProduct = async () => {
      try {

        const categories = ['honey', 'spices', 'oil', 'coconut','nuts','wholesale'];
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
      const userCartRef = ref(database, `users/${userId}/cart`);

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
      const localCart = JSON.parse(sessionStorage.getItem("cart")) || [];
      const existingProductIndex = localCart.findIndex((item) => item.id === product.id);

      if (existingProductIndex > -1) {
          // If the product is already in the cart, increment its quantity
          localCart[existingProductIndex].quantity += 1;
      } else {
          // Otherwise, add the product with a default quantity of 1
          localCart.push({ ...product, quantity: 1 });
      }

      sessionStorage.setItem("cart", JSON.stringify(localCart));
      toast.success("Product added to your cart!");
    }
  };
  return (
    <div>
      <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
        <div className='p-10 flex justift-center items-center h-full'>
          <div className='font-thin text-7xl bebas-neue-regular'>{product.name}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 p-8 gap-12 max-w-6xl mx-auto mt-10">
        <div className='flex justify-center items-center'>
          <img src={product.imageUrl} alt={product.name} className="w-full h-auto max-w-md object-cover rounded-lg" />
        </div>
        <div className=' flex flex-col justify-center items-start space-y-6 border-l-2 pl-8'>
          <h1 className="text-3xl font-bold ">{product.name}</h1>
          <p className="text-xl font-semibold mt-4 ">__</p>
          <p className="text-gray-500 mt-2">Category: {product.category}</p>

          <button
            className="mt-4 px-4 py-2 bg-[#9C3618] text-white rounded-md" onClick={() => addToCart(product)}>

            Add to Cart
          </button>
        </div>
      </div>
     
      <div className='p-10 font-semibold max-w-6xl mx-auto'>
        <h1 className='text-4xl font-bold'>Description</h1>
        <p className="text-gray-600 mt-2 leading-relaxed">{product.description}</p>
        <p className='font-bold mt-5 italic'>Try it today!</p>
      </div>

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