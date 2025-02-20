import React, { useEffect, useState } from 'react'
import { database } from '../../FirebaseConfig';
import { onValue, ref, remove, update } from 'firebase/database';
import ReactQuill from 'react-quill';
import { toast, ToastContainer } from 'react-toastify';

function ViewBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [showModal, setShowModal] = useState(false);
        const [selectedBlogId, setSelectedBlogId] = useState(null);
    

    useEffect(() => {
        const blogsRef = ref(database, 'blogs');
        onValue(blogsRef, (snapshot) => {
            const data = snapshot.val();
            const blogList = data ? Object.entries(data).map(([id, blog]) => ({ id, ...blog })) : [];
            setBlogs(blogList);
        });
    }, []);

    const confirmDelete = (blogId) => {
        setSelectedBlogId(blogId);
        setShowModal(true);
    };

    // const handleRemove = (blogId) => {
    //     const blogRef = ref(database, `blogs/${selectedBlogId}`);
    //     remove(blogRef)
    //         .then(() => {

    //             setBlogs(blogs.filter((blog) => blog.id !== blogId));
    //         })
    //         .catch((error) => {
    //             console.error("Error removing blog: ", error);
    //         });
    // };
    const handleRemove = async () => {
            if (!selectedBlogId) return;
    
            try {
                await remove(ref(database, `users/${selectedBlogId}`));
                setUsers(users.filter(user => user.id !== selectedUserId));
                setShowModal(false);
                setSelectedUserId(null);
                toast.success("User deleted successfully!");
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        };

    const handleEditToggle = (blogId) => {
        setBlogs(blogs.map(blog => blog.id === blogId ? { ...blog, isEditing: !blog.isEditing } : blog));
    };

    const handleSave = async (blogId, updatedBlog) => {
        try {
            const blogRef = ref(database, `blogs/${blogId}`);
            await update(blogRef, updatedBlog);

            setBlogs(blogs.map(blog => blog.id === blogId ? { ...updatedBlog, id: blogId, isEditing: false } : blog));
            toast.success("Blog updated successfully!");
        } catch (error) {
            console.error("Error updating blog:", error);
            toast.error("Failed to update the blog. Please try again.");
        }
    };
    return (
        <div className='md:ml-44 md:p-6 p-2 min-h-screen'>
           <p className='md:text-3xl text-xl font-bold md:ml-24 p-2'>Blogs</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:p-20">
            
                {blogs.map((blog) => (
                    
                    <div key={blog.id} className="flex md:h-96 bg-white border rounded-lg overflow-hidden md:p-5 p-2">
                        <img
                            src={blog.image}
                            className="w-1/3 h-64 object-cover"

                        />

                        <div className="p-6 w-2/3 flex flex-col justify-center">
                            {blog.isEditing ? (
                                <>

                                    <input
                                        type="date"
                                        value={blog.date}
                                        onChange={(e) => setBlogs(blogs.map(b => b.id === blog.id ? { ...b, date: e.target.value } : b))}
                                        className="mb-4 w-full p-2 border rounded"
                                        placeholder="Date"
                                    />
                                    <div className="mb-4 h-40 overflow-y-auto border rounded">
                                        <ReactQuill
                                            value={blog.description}
                                            onChange={(value) => setBlogs(blogs.map(b => b.id === blog.id ? { ...b, description: value } : b))}
                                            className="mb-4 w-full"
                                        /></div>
                                    <input
                                        type="text"
                                        value={blog.image}
                                        onChange={(e) => setBlogs(blogs.map(b => b.id === blog.id ? { ...b, image: e.target.value } : b))}
                                        className="mb-4 w-full p-2 border rounded"
                                        placeholder="Image URL"
                                    />
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleSave(blog.id, {
                                                date: blog.date,
                                                description: blog.description,
                                                image: blog.image,
                                            })}
                                            className="bg-green-600 text-white px-4 py-2 rounded"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => handleEditToggle(blog.id)}
                                            className="bg-gray-400 text-white px-4 py-2 rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-400 self-start text-sm mb-2">{new Date(blog.date).toLocaleDateString("en-GB")}</p>
                                    <div
                                        className="text-gray-700 text-base mb-4 line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: blog.description }}
                                    />
                                    <a
                                        href={`/fullblog/${blog.id}`}
                                        className="text-yellow-600 self-start font-semibold hover:underline"
                                    >
                                        Read More
                                    </a>
                                    <div className="flex gap-4 mt-4 self-start">
                                        <button
                                            onClick={() => handleEditToggle(blog.id)}
                                            className="bg-yellow-600  text-white px-4 py-2 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(blog.id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {showModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                                <p className="text-lg font-semibold">Do you really want to delete this blog?</p>
                                <div className="mt-4 flex justify-center gap-4">
                                    <button
                                        onClick={handleRemove}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg">
                                        Yes, Delete
                                    </button>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="bg-gray-400 text-white px-4 py-2 rounded-lg">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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

export default ViewBlogs