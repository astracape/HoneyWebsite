import React, { useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import 'react-toastify/dist/ReactToastify.css';
import { database, storage } from '../../FirebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';

function AddBlogs() {
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');

    const [newImage, setNewImage] = useState(null);


    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setNewImage(e.target.files[0]);
            setPreviewImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const addBlog = () => {
        if (!date || !description || !newImage) {
            alert("Please fill out all fields, including selecting an image.");
            return;
        }

        const imageRef = storageRef(storage, `blog_images/${newImage.name}`);
        const uploadTask = uploadBytesResumable(imageRef, newImage);

        uploadTask.on(
            'state_changed',
            null,
            (error) => {
                console.log("Upload failed", error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {

                    const newBlogRef = doc(collection(database, "blogs"));
                    const newBlog = {
                        date: date,
                        description: description,
                        image: downloadURL,
                    };

                    setDoc(newBlogRef, newBlog)
                        .then(() => {
                            toast.success("blog added successfully!")
                            // Clear the form fields after submission
                            setDate('');
                            setDescription('');
                            setNewImage(null);
                            setPreviewImage('');
                            document.getElementById("blogImageInput").value = "";
                        })
                        .catch(error => {
                            console.error("Error adding blog to database:", error);
                        });
                });
            }
        );
    };


    return (
        <div className='lg:ml-44 md:p-6 p-2'>
            <div className=" mt-2 p-6">
                <h2 className="text-3xl font-semibold mb-6 ml-32">Add Blog Post</h2>
                {/* <form onSubmit={handleSubmit} className="space-y-6"> */}

                {/* Date Field */}
                <div className='ml-32 gap-3'>
                    <label className="block text-sm font-bold text-gray-700">Date</label>
                    <input
                        type="date"
                        className="mt-1 block lg:w-3/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-transparent sm:text-sm"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        max={new Date().toISOString().split("T")[0]}
                    />

                    <div>
                        <label className="block text-sm font-bold text-gray-700">Description</label>
                        <ReactQuill
                            rows="4"
                            className="mt-1 block lg:w-3/4 px-3 py-2 min-h-[150px] space-y-6  rounded-md shadow-sm focus:outline-none  sm:text-sm"
                            placeholder="Add a description..."
                            value={description}
                            // onChange={(e) => setDescription(e.target.value)}
                            onChange={(value) => setDescription(value)}
                            required
                        ></ReactQuill>
                    </div>
                    <div className='flex mt-3 w-full justify-around'>
                   
                    <div className='w-full'>
                        <label className=" text-sm font-bold text-gray-700 ">Add Image</label>
                        <input
                        id='blogImageInput'
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="mt-1 block lg:w-3/4 px-3 py-2  shadow-sm focus:outline-none sm:text-sm cursor-pointer"
                        />
                    </div>
                    {previewImage && (
                        <img
                            src={previewImage}
                            alt="Product Preview"
                            className="w-24 h-24 object-cover rounded-lg mr-72"
                        />
                    )}

                    </div>

                    {/* Submit Button */}
                    <div className=" mt-5">
                        <button
                            onClick={addBlog}
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brandyellow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                            Publish Blog
                        </button>
                    </div>
                </div>
                {/* </form> */}
            </div>
            <ToastContainer
                            position="bottom-center"
                            autoClose={1200}
                            limit={1}
                            hideProgressBar={false}
                        />
        </div>
    )
}

export default AddBlogs