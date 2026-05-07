import React, { useState, useEffect, useRef } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { database, storage } from "../../FirebaseConfig"; // Make sure storage is exported from FirebaseConfig
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddReviews() {
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerPlace, setReviewerPlace] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewImage, setReviewImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const fileInputRef = useRef(null);

  const confirmDelete = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const fetchReviews = async () => {
    try {
      const querySnapshot = await getDocs(collection(database, "reviews"));
      const reviewList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(reviewList);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleImageUpload = async (file) => {
    if (!file) return null;
    
    try {
      setUploadingImage(true);
      const storageRef = ref(storage, `reviews/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteImageFromStorage = async (imageUrl) => {
    if (!imageUrl) return;
    
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error("Error deleting image from storage:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    // if (file.size > 5 * 1024 * 1024) {
    //   toast.error("Image size should be less than 5MB");
    //   return;
    // }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setReviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submitReview = async () => {
    // if (!reviewerName.trim() || !reviewerPlace.trim() || !reviewContent.trim()) {
    //   toast.error("Please fill in all required fields");
    //   return;
    // }

    // if (rating === 0) {
    //   toast.error("Please select a rating");
    //   return;
    // }

    setSubmitting(true);

    try {
      let imageUrl = reviewImage; // Keep existing image if editing and no new image selected
      
      // Upload new image if selected
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
        if (!imageUrl) {
          setSubmitting(false);
          return;
        }
        
        // Delete old image if editing
        if (editingId && reviewImage) {
          await deleteImageFromStorage(reviewImage);
        }
      }

      const reviewData = {
        name: reviewerName,
        place: reviewerPlace,
        review: reviewContent,
        rating: rating,
        date: new Date().toISOString(),
        imageUrl: imageUrl || null,
      };

      if (editingId) {
        // Update existing review
        const reviewRef = doc(database, "reviews", editingId);
        await updateDoc(reviewRef, reviewData);
        toast.success("Review updated successfully!");
        setEditingId(null);
        resetform();
      } else {
        await addDoc(collection(database, "reviews"), reviewData);
        toast.success("Review submitted successfully!");
        resetform();
      }

      fetchReviews();
    } catch (error) {
      toast.error("Error submitting review. Please try again.");
      console.error("Submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetform = () => {
    setReviewerName("");
    setReviewerPlace("");
    setReviewContent("");
    setReviewImage("");
    setImageFile(null);
    setImagePreview("");
    setRating(0);
    setHoverRating(0);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const editReview = (review) => {
    setReviewerName(review.name);
    setReviewerPlace(review.place);
    setReviewContent(review.review);
    setRating(review.rating);
    setReviewImage(review.imageUrl || "");
    setImagePreview(review.imageUrl || "");
    setEditingId(review.id);
    setImageFile(null);
    
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const deleteReview = async (id) => {
    try {
      // Find the review to delete its image
      const reviewToDelete = reviews.find(review => review.id === id);
      
      // Delete image from storage if exists
      if (reviewToDelete?.imageUrl) {
        await deleteImageFromStorage(reviewToDelete.imageUrl);
      }
      
      // Delete from Firestore
      await deleteDoc(doc(database, "reviews", id));
      toast.success("Review deleted successfully!");
      fetchReviews();
    } catch (error) {
      toast.error("Error deleting review");
      console.error("Delete error:", error);
    } finally {
      setShowModal(false);
      setSelectedReview(null);
    }
  };

  return (
    <div>
      <div className="lg:ml-64">
        <div ref={formRef} className="flex flex-col gap-4 md:p-5">
          <h1 className="text-2xl lg:text-3xl font-bold px-3 border-l-4 border-brandyellow">
            {editingId ? "Edit Review" : "Add Review"}
          </h1>

          <input
            type="text"
            placeholder="Your Name *"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            className="w-3/4 rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />

          <input
            type="text"
            placeholder="Your Location (City, Country) *"
            value={reviewerPlace}
            onChange={(e) => setReviewerPlace(e.target.value)}
            className="w-3/4 rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
          
          {/* Image Upload Section */}
          <div className="w-3/4">
            <p className="text-gray-700 font-semibold mb-2">Reviewer Photo (Optional)</p>
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {uploadingImage ? "Uploading..." : "Choose Image"}
              </label>
              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Max file size: 5MB. Supported formats: JPG, PNG, WebP</p>
          </div>

          <div className='w-3/4'>
            <p className='text-gray-700 font-semibold mb-2'>Your Rating *</p>
            <div className='flex items-center gap-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type='button'
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className='text-3xl focus:outline-none transition-transform hover:scale-110'
                  aria-label={`Rate ${star} stars`}
                >
                  <span className={star <= (hoverRating || rating) ? 'text-yellow-500' : 'text-gray-300'}>
                    {star <= (hoverRating || rating) ? '★' : '☆'}
                  </span>
                </button>
              ))}
              <span className="ml-2 text-gray-600">{rating > 0 ? `${rating}/5` : ''}</span>
            </div>
          </div>
          
          <textarea
            placeholder="Your Review *"
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            className="h-44 w-3/4 rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />

          <div className="flex gap-4 w-3/4">
            {editingId ? (
              <>
                <button
                  onClick={submitReview}
                  className={`flex-1 px-4 py-2 bg-brandyellow text-white rounded-lg ${(submitting || uploadingImage) && "opacity-50"}`}
                  disabled={submitting || uploadingImage}
                >
                  {submitting ? "Updating..." : "Update Review"}
                </button>
                <button
                  onClick={resetform}
                  className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg"
                  disabled={submitting || uploadingImage}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={submitReview}
                className={`px-4 py-2 w-full bg-brandyellow text-white rounded-lg ${(submitting || uploadingImage) && "opacity-50"}`}
                disabled={submitting || uploadingImage}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            )}
          </div>
        </div>

        <div className="p-5 lg:p-10">
          <h2 className="text-xl font-bold mb-4">All Reviews</h2>
          <ul className="space-y-6">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="border rounded-lg p-6 flex flex-col md:flex-row gap-6"
              >
                {/* Review Image */}
                {review.imageUrl && (
                  <div className="md:w-1/6 flex-shrink-0">
                    <img 
                      src={review.imageUrl} 
                      alt={review.name}
                      className="w-full h-48 md:h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {/* Review Content */}
                <div className={`flex-1 ${review.imageUrl ? 'md:w-5/6' : 'w-full'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{review.name}</p>
                        <label className="text-sm text-yellow-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star}>
                              {star <= review.rating ? '★' : '☆'}
                            </span>
                          ))}
                        </label>
                      </div>
                      <p className="text-sm text-gray-600">{review.place}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 mt-3 md:mt-0">
                      <button
                        className="px-4 py-2 bg-brandyellow text-white rounded-md hover:bg-yellow-600 transition-colors"
                        onClick={() => editReview(review)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        onClick={() => confirmDelete(review)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-gray-700 leading-relaxed">{review.review}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black opacity-50"></div>

            <div className="inline-block bg-white rounded-lg p-6 shadow-lg text-left transform transition-all sm:max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to delete the review by "{selectedReview?.name}"? This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  onClick={() => deleteReview(selectedReview.id)}
                >
                  Delete
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-center" autoClose={3000} limit={1} />
    </div>
  );
}

export default AddReviews;

