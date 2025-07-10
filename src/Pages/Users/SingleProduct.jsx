import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import img from "../../assets/productpage.jpg"
import { getAuth } from 'firebase/auth';
import { database } from '../../FirebaseConfig';
import { ToastContainer, toast } from 'react-toastify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { CartContext } from '../../context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/solid';

function SingleProduct() {
  const { productId } = useParams(); // Get productId from URL
  const { addToCart } = useContext(CartContext);
  const [showPopup, setShowPopup] = useState(false);
  const [product, setProduct] = useState(null);
 const navigate = useNavigate()

  // Initialize the Firebase database
 useEffect(() => {
        window.scrollTo(0, 0); // Scroll to the top when the component mounts
    }, []);
 
  useEffect(() => {
    const fetchProduct = async () => {
        try {
            const categoriesSnapshot = await getDocs(collection(database, "products")); // Fetch all category documents
            let foundProduct = null;

            for (let categoryDoc of categoriesSnapshot.docs) {
                const categoryData = categoryDoc.data();
                const productsArray = categoryData.products || [];

                // Find the product in the array
                const matchProduct = productsArray.find(prod => prod.id === productId);
                if (matchProduct) {
                  // Get the category name from the categories collection
                  const categoryDocSnap = await getDoc(doc(database, "categories", categoryDoc.id));
                  const categoryName = categoryDocSnap.exists() ? categoryDocSnap.data().category : "Unknown Category";
              
                  foundProduct = { ...matchProduct, category: categoryName };
                  break;
              }
              
            }

            if (foundProduct) {
                setProduct(foundProduct);
            } else {
                toast.error("Product not found");
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            toast.error("Error fetching product");
        }
    };

    fetchProduct();
}, [productId]);

  if (!product) {
    return <p>Loading...</p>; // Loading state while fetching
  }

  const cartview = () => {
    navigate('/cart')
}

  
  const handleAddToCart = (product) => {
   
    addToCart(product);
   setShowPopup(true);
};
  return (
    <div>
      <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
        <div className='p-10 flex justift-center items-center h-full'>
          <div className='font-thin text-5xl bebas-neue-regular'>{product.name}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 p-8 gap-12 max-w-6xl mx-auto mt-10">
        <div className='flex justify-center items-center'>
          <img src={product.imageUrl} alt={product.name} className="w-96 h-96 max-w-md object-cover rounded-lg" />
        </div>
        <div className=' flex flex-col justify-center items-start space-y-6 border-l-2 pl-8'>
          <h1 className="text-3xl font-bold ">{product.name}</h1>
          <p className="text-xl font-semibold mt-4 ">{product.price}</p>
          <p className="text-gray-500 font-semibold mt-4 ">Weight: {product.weight}</p>

          <p className="text-gray-500 mt-2">Category: {product.category}</p>

          <button
            className="mt-4 px-4 py-2 bg-[#9C3618] text-white rounded-md" onClick={() => handleAddToCart(product)}>

            Add to Cart
          </button>
        </div>
      </div>

      <div className='p-10 font-semibold max-w-6xl mx-auto'>
        <h1 className='text-4xl font-bold'>Description</h1>
        <p className="text-gray-600 mt-2 leading-relaxed">{product.description}</p>
        <p className='font-bold mt-5 italic'>Try it today!</p>
      </div>
      {showPopup && (
                <div
                    data-aos="fade-up"
                    data-aos-duration="600"
                    className="fixed bottom-0 left-0 w-full font-bold italic bg-gradient-to-r from-[#ffa600dc] to-[#8b4513df] text-white p-6 flex items-center justify-between shadow-lg transform transition-transform"
                >
                    <div className="flex items-center gap-2">
                        <ShoppingCartIcon className="h-6 w-6 text-gray-900" />
                        <span className="text-xl text-gray-900">
                            Item added to cart successfully!
                        </span>
                    </div>
                    <button
                        onClick={cartview}
                        className="bg-transparent text-white font-normal px-4 py-2 rounded-lg border-2 border-gray-900 hover:bg-red-900 hover:text-white transition-colors duration-300 ease-in-out transform hover:scale-105 shadow-md"
                    >
                        View Cart
                    </button>
                </div>
            )}
      <ToastContainer
        position="bottom-center"
        autoClose={1200}
        hideProgressBar={false}
       limit={1}
       />
    </div>
  )
}
export default SingleProduct