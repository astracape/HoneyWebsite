import React, { useEffect, useState } from 'react'
import { database, storage } from '../../FirebaseConfig';
import { onValue, ref, remove, update } from 'firebase/database';
import ReactQuill from 'react-quill';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowRight} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { uploadBytesResumable } from 'firebase/storage';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';

function ViewBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedBlogId, setSelectedBlogId] = useState(null);


    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const blogsRef = collection(database, 'blogs'); // Correct reference to collection
                const snapshot = await getDocs(blogsRef); // Correct way to fetch data

                if (!snapshot.empty) {
                    const blogList = snapshot.docs.map(doc => ({
                        id: doc.id, // Extract document ID
                        ...doc.data(),
                        isEditing: false,
                    }));
                    setBlogs(blogList);
                } else {
                    setBlogs([]);
                }
            } catch (error) {
                toast.error("Error fetching blogs")
            }
        };

        fetchBlogs();
    }, []);


    const confirmDelete = (blogId) => {
        setSelectedBlogId(blogId);
        setShowModal(true);
    };


    const handleRemove = async () => {
        if (!selectedBlogId) return;

        try {
            await deleteDoc(doc(database, "blogs", selectedBlogId));
            setBlogs(prev => prev.filter(blog => blog.id !== selectedBlogId));
            setShowModal(false);
            setSelectedBlogId(null);
            toast.success("Blog deleted successfully!");
        } catch (error) {
            toast.error("Failed to delete the blog")
        }
    };

    const handleEditToggle = (blogId) => {
        setBlogs(prevBlogs => prevBlogs.map(blog => blog.id === blogId ? { ...blog, isEditing: !blog.isEditing } : blog));
    };


//    const handleImageUpload = (e, blogId) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const fileRef = storageRef(storage, `blog_images/${blogId}_${file.name}`);
//     const uploadTask = uploadBytesResumable(fileRef, file);

//     uploadTask.on(
//         "state_changed",
//         null,
//         () => toast.error("Image upload failed."),
//         async () => {
//             try {
//                 const url = await getDownloadURL(uploadTask.snapshot.ref);

//                 // Update local state
//                 setBlogs(prevBlogs =>
//                     prevBlogs.map(blog =>
//                         blog.id === blogId ? { ...blog, image: url } : blog
//                     )
//                 );

//                 // 🔥 Update in Firestore
//                 const blogRef = doc(database, "blogs", blogId);
//                 await updateDoc(blogRef, { image: url });

//                 toast.success("Image uploaded and saved!");
//             } catch (err) {
//                 toast.error("Failed to update blog image in database.");
//             }
//         }
//     );
// };

const handleImageUpload = (e, blogId) => {
    const file = e.target.files[0];
    if (!file) return;

    // 👉 Preview image immediately using a temporary URL
    const localImageUrl = URL.createObjectURL(file);

    // Set temporary preview
    setBlogs(prevBlogs =>
        prevBlogs.map(blog =>
            blog.id === blogId ? { ...blog, image: localImageUrl } : blog
        )
    );

    // Continue with Firebase upload
    const fileRef = storageRef(storage, `blog_images/${blogId}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
        "state_changed",
        null,
        () => toast.error("Image upload failed."),
        async () => {
            try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);

                // Update with real Firebase URL after upload
                setBlogs(prevBlogs =>
                    prevBlogs.map(blog =>
                        blog.id === blogId ? { ...blog, image: url } : blog
                    )
                );

                // Save to Firestore
                const blogRef = doc(database, "blogs", blogId);
                await updateDoc(blogRef, { image: url });

                toast.success("Image uploaded and saved!");
            } catch (err) {
                toast.error("Failed to update blog image in database.");
            }
        }
    );
};


    const handleSave = async (blogId, updatedBlog) => {
        try {
            const blogRef = doc(database, "blogs", blogId);
            await updateDoc(blogRef, updatedBlog);

            setBlogs(prevBlogs =>
                prevBlogs.map(blog =>
                    blog.id === blogId
                        ? { ...updatedBlog, id: blogId, isEditing: false }
                        : blog
                )
            );
            toast.success("Blog updated successfully!");
        } catch (error) {
            toast.error("Failed to update the blog. Please try again.");
        }
    };
    return (
       
        <div className='md:ml-64 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
  <h1 className='text-2xl font-bold text-gray-900 px-3 border-l-4 border-brandyellow'>Our Blogs</h1>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-5">
    {blogs.map((blog) => (
      <div key={blog.id} className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
        {/* Image Section with overlay for editing */}
        <div className="relative h-48 md:h-96 w-72">
          <img
            src={blog.image}
            alt='Blog'
            className="w-full h-full object-cover rounded-2xl"
          />
          {blog.isEditing && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <label className="cursor-pointer bg-white px-4 py-2 rounded-md font-medium text-gray-800 hover:bg-gray-100 transition-colors">
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, blog.id)}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow">
          {blog.isEditing ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                <input
                  type="date"
                  value={blog.date}
                  onChange={(e) => setBlogs(blogs.map(b => b.id === blog.id ? { ...b, date: e.target.value } : b))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4 flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <div className="border border-gray-300 rounded-md h-48 overflow-hidden">
                  <ReactQuill
                    value={blog.description}
                    onChange={(value) => setBlogs(blogs.map(b => b.id === blog.id ? { ...b, description: value } : b))}
                    className="h-40"
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        ['link'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-auto">
                <button
                  onClick={() => handleSave(blog.id, {
                    date: blog.date,
                    description: blog.description,
                    image: blog.image,
                  })}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => handleEditToggle(blog.id)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-500 mb-2">
                {new Date(blog.date).toLocaleDateString("en-US", { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              
              <div
                className="prose prose-sm text-gray-700 mb-4 line-clamp-4"
                dangerouslySetInnerHTML={{ __html: blog.description }}
              />
              
              <div className="flex gap-28 md:gap-80">
                <Link
                  to={`/fullblog/${blog.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-start"
                >
                  Read more
                  <FaArrowRight className="w-4 h-4 ml-1" />
                </Link>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditToggle(blog.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(blog.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    ))}
  </div>
  {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
      <h2 className="text-lg font-semibold mb-4">Are you sure you want to delete this blog?</h2>
      <div className="flex justify-center gap-4">
        <button
          onClick={handleRemove}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Yes, Delete
        </button>
        <button
          onClick={() => setShowModal(false)}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

</div>
    )
}

export default ViewBlogs
