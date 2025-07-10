
import React, { useEffect, useState } from 'react'
import { database } from '../../FirebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/solid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartContext } from '../../context/CartContext';
import { useContext } from 'react';

function GiftHamper() {
  const [giftProducts, setGiftProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGiftProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoriesSnapshot = await getDocs(collection(database, "products"));
        const giftProductsArray = [];

        for (let categoryDoc of categoriesSnapshot.docs) {
          const categoryData = categoryDoc.data();
          const productsArray = categoryData.products || [];

          const categoryDocSnap = await getDoc(doc(database, "categories", categoryDoc.id));
          const categoryName = categoryDocSnap.exists()
            ? categoryDocSnap.data().category
            : "Gifting Options";

          if (categoryName === "Gifting Options") {
            productsArray.forEach((product) => {
              giftProductsArray.push({
                ...product,
                category: categoryName,
                categoryDocId: categoryDoc.id
              });
            });
          }
        }

        setGiftProducts(giftProductsArray);
      } catch (error) {
        console.error("Error fetching gift products.", error);
        setError(error);
        toast.error("Error fetching gift products.");
      } finally {
        setLoading(false);
      }
    };

    fetchGiftProducts();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setShowPopup(true);
  };

  const cartview = () => {
    navigate('/cart');
  };

  return (
    <div>
      <section className="bg-white py-12 text-gray-700 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md text-center">
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">Our Gift Hampers</h2>
            <p className="mt-4 text-base text-gray-700">Beautifully curated gift collections for your loved ones.</p>
          </div>

          {loading ? (

            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {/* skeleton method for loading products */}
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded-md">
                  <div className="bg-gray-300 h-40 rounded-md mb-4" ></div>
                  <div className="bg-gray-300 h-4 rounded-md mb-2 w-3/4" ></div>
                  <div className="bg-gray-300 h-4 rounded-md w-1/2" ></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center mt-10">
              <p>Error loading products</p>
            </div>
          ) : giftProducts.length === 0 ? (
            <div className="text-center mt-10">
              <p>No gift products available at the moment.</p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-6 lg:mt-16 lg:grid-cols-4 lg:gap-4">
              {giftProducts.map((product) => (
                <article key={product.id} className="relative">
                  <div className="aspect-square overflow-hidden">
                    <img
                      className="group-hover:scale-125 h-full w-full object-cover transition-all duration-300"
                      src={product.imageUrl}
                      alt={product.name}
                    />
                  </div>
                  <div className="mt-4 flex items-start justify-between h-24">
                    <div className='p-2'>
                      <h3 className="text-xs md:w-44 font-semibold sm:text-sm md:text-base">
                        {product.name} | {product.weight}
                      </h3>
                    </div>
                    <div className="text-right border-l-2 p-3">
                      <p className="text-xs font-normal sm:text-sm md:text-base">Rs. {product.price}</p>
                    </div>
                  </div>
                  <div className='flex gap-1'>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="mt-2 w-full md:h-auto px-4 py-2 bg-brandyellow text-white rounded-md text-sm">
                      Add to Cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

        </div>
      </section>

      {showPopup && (
        <div className="fixed bottom-0 left-0 w-full font-bold italic bg-gradient-to-r from-[#ffa600dc] to-[#8b4513df] text-gray-900 p-6 flex items-center justify-between shadow-lg transform transition-transform">
          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="h-6 w-6 text-gray-900" />
            <span className="text-xl">
              Item added to cart successfully!
            </span>
          </div>
          <button
            onClick={cartview}
            className="bg-transparent text-gray-900 font-normal px-4 py-2 rounded-lg border-2 border-gray-900 hover:bg-red-900 hover:text-gray-50 transition-colors duration-300 ease-in-out transform hover:scale-105 shadow-md">
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

export default GiftHamper;
