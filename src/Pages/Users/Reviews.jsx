// import React, { useEffect, useState } from "react";
// import { collection, getDocs, query, orderBy, onSnapshot } from "firebase/firestore";
// import { database } from "../../FirebaseConfig";
// import img from "../../assets/honey-823614_1280.jpg"
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
// import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';



// function Reviews() {
//   const [reviews, setReviews] = useState([]);


//   useEffect(() => {
//     const q = query(collection(database, "reviews"), orderBy("date", "desc"));

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const reviewList = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       setReviews(reviewList);
//     }, (error) => {
//       console.error("Error fetching real-time reviews:", error);
//     });

//     return () => unsubscribe();
//   }, []);


//   return (
//     <div>
//       <div className="relative h-96 bg-cover bg-center" loading='lazy' style={{ backgroundImage: `url(${img})` }}>
//         <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
//         <div className='relative p-10 flex justify-center md:justify-start items-center h-full'>
//           <div className='font-thin text-7xl bebas-neue-regular text-white'>Reviews</div>
//         </div>
//       </div>
//       <section className="py-16 text-yellow-900 sm:py-20 lg:py-24">
//         <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col items-center">
//             <div className="text-center max-w-3xl">
//               <p className="text-lg font-semibold text-yellow-500 tracking-wide uppercase">
//                 Client Experiences
//               </p>
//               <h2 className="mt-4 text-4xl font-bold text-yellow-900 sm:text-5xl lg:text-6xl">
//                 What Our Clients Say
//               </h2>
//               <div className="mt-6 h-1.5 w-20 bg-yellow-400 rounded-full mx-auto"></div>
//             </div>

//             <div className="relative mx-auto mt-16 grid  grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
//               {reviews.length > 0 ? (
//                 reviews.map((review) => (
//                   <div
//                     key={review.id}
//                     className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
//                   >
//                     <div className="flex flex-1 border-b border-b-brandyellow justify-between flex-col p-8 lg:p-10 w-full">
//                       <div className="flex-1 w-full">
//                         <div className="flex items-center justify-center mb-6 w-full">

//                           <p className="text-sm text-yellow-500">
//                             {[1, 2, 3, 4, 5].map((star) => (
//                               <FontAwesomeIcon
//                                 key={star}
//                                 icon={star <= review.rating ? solidStar : regularStar}
//                               />
//                             ))}
//                           </p>

//                         </div>
//                         <blockquote className="mt-2 flex-1">
//                           <p className="text-lg leading-relaxed text-yellow-800 italic relative">
//                             <span className="absolute -left-4 -top-2 text-4xl text-yellow-200 font-serif">"</span>
//                             {review.review}
//                           </p>
//                         </blockquote>
//                       </div>
//                       <div className="mt-8 flex justify-start items-start self-start space-x-4 border-t border-yellow-100 pt-6">
//                         <div className="flex-shrink-0">
//                           <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 text-yellow-800 font-bold">
//                             {review.name.split(' ').map(n => n[0]).join('')}
//                           </div>
//                         </div>
//                         <div>
//                           <p className="text-base font-bold text-yellow-900">{review.name}</p>
//                           <p className="mt-0.5 text-sm text-yellow-600">{review.place}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="col-span-3 text-center py-12">
//                   <div className="inline-flex items-center justify-center rounded-full bg-yellow-100 p-4 mb-4">
//                     <svg className="h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//                     </svg>
//                   </div>
//                   <h3 className="text-2xl font-bold text-yellow-800">No reviews yet</h3>
//                   <p className="mt-2 text-yellow-600">Be the first to share your experience!</p>
//                 </div>
//               )}
//             </div>

//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// export default Reviews;
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, onSnapshot } from "firebase/firestore";
import { database } from "../../FirebaseConfig";
import img from "../../assets/honey-823614_1280.jpg"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(database, "reviews"), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReviews(reviewList);
    }, (error) => {
      console.error("Error fetching real-time reviews:", error);
    });

    return () => unsubscribe();
  }, []);

  const openImageModal = (imageUrl) => {
    setActiveImage(imageUrl);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setActiveImage(null);
    document.body.style.overflow = 'unset';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      {/* Image Modal */}
      {isModalOpen && activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 text-white text-3xl hover:text-yellow-400 transition-colors z-10"
            >
              ✕
            </button>
            <img
              src={activeImage}
              alt="Reviewer"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="relative h-96 bg-cover bg-center" loading='lazy' style={{ backgroundImage: `url(${img})` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
        <div className='relative p-10 flex justify-center md:justify-start items-center h-full'>
          <div className='font-thin text-7xl bebas-neue-regular text-white'>Reviews</div>
        </div>
      </div>

      <section className="py-16 text-yellow-900 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="text-center max-w-3xl">
              <p className="text-lg font-semibold text-yellow-500 tracking-wide uppercase">
                Client Experiences
              </p>
              <h2 className="mt-4 text-4xl font-bold text-yellow-900 sm:text-5xl lg:text-6xl">
                What Our Clients Say
              </h2>
              <div className="mt-6 h-1.5 w-20 bg-yellow-400 rounded-full mx-auto"></div>
            </div>

            <div className="relative mx-auto mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-8">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Review Image Section */}
                    {review.imageUrl && (
                      <div className="relative h-40 w-32 overflow-hidden">
                        <img
                          src={review.imageUrl}
                          alt={review.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                          onClick={() => openImageModal(review.imageUrl)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        <button
                          onClick={() => openImageModal(review.imageUrl)}
                          className="absolute bottom-4 right-4 bg-white/90 text-yellow-800 p-2 rounded-full hover:bg-white transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                          title="View larger"
                        >
                          🔍
                        </button>
                      </div>
                    )}

                    <div className={`flex flex-1 border-b border-b-brandyellow justify-between flex-col ${review.imageUrl ? 'p-6' : 'p-8 lg:p-10'} w-full`}>
                      <div className="flex-1 w-full">
                        {/* Rating */}
                        <div className="flex items-center justify-center mb-4">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FontAwesomeIcon
                                key={star}
                                icon={star <= review.rating ? solidStar : regularStar}
                                className={`${star <= review.rating ? 'text-yellow-500' : 'text-yellow-200'} text-sm`}
                              />
                            ))}
                            <span className="ml-2 text-sm font-semibold text-yellow-700">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>

                        {/* Review Text */}
                        <blockquote className="mt-2 flex-1">
                          <p className={`${review.imageUrl ? 'text-base' : 'text-lg'} leading-relaxed text-yellow-800 italic relative line-clamp-4`}>
                            <span className="absolute -left-3 -top-2 text-3xl text-yellow-200 font-serif">"</span>
                            {review.review}
                          </p>
                        </blockquote>

                      </div>

                      {/* Reviewer Info */}
                      <div className="mt-6 flex items-start self-start space-x-4 border-t border-yellow-100 pt-4">
                        <div className="flex-shrink-0">
                          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 text-yellow-800 font-bold text-lg">
                            {review.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-yellow-900 truncate">
                            {review.name}
                          </p>
                          <p className="mt-0.5 text-sm text-yellow-600 truncate">
                            {review.place}
                          </p>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="inline-flex items-center justify-center rounded-full bg-yellow-100 p-6 mb-4">
                    <div className="h-16 w-16 text-yellow-400">
                      <FontAwesomeIcon icon={faUser} size="2x" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-yellow-800">No reviews yet</h3>
                  <p className="mt-2 text-yellow-600 max-w-md mx-auto">
                    Be the first to share your experience with our products!
                  </p>
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                      {/* Placeholder reviews for empty state */}
                      <div className="border border-dashed border-yellow-300 rounded-2xl p-6 bg-yellow-50/50">
                        <div className="flex justify-center mb-4">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FontAwesomeIcon
                                key={star}
                                icon={regularStar}
                                className="text-yellow-200"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-yellow-700 italic text-center">
                          "Your review could be here..."
                        </p>
                      </div>
                      <div className="border border-dashed border-yellow-300 rounded-2xl p-6 bg-yellow-50/50">
                        <div className="flex justify-center mb-4">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FontAwesomeIcon
                                key={star}
                                icon={regularStar}
                                className="text-yellow-200"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-yellow-700 italic text-center">
                          "Share your experience with us..."
                        </p>
                      </div>
                      <div className="border border-dashed border-yellow-300 rounded-2xl p-6 bg-yellow-50/50">
                        <div className="flex justify-center mb-4">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FontAwesomeIcon
                                key={star}
                                icon={regularStar}
                                className="text-yellow-200"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-yellow-700 italic text-center">
                          "Tell us what you think..."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>



          </div>
        </div>
      </section>
    </div>
  );
}

export default Reviews;