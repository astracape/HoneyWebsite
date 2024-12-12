import React, { useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { database, storage } from '../../FirebaseConfig';
import { ref, set } from 'firebase/database';

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
                console.log("Image uploaded successfully:", downloadURL);

                const newBlogRef = ref(database, `blogs/${Date.now()}`);
                const newBlog = {
                    date: date,
                    description: description,
                    image: downloadURL, 
                };

                set(newBlogRef, newBlog)
                    .then(() => {
                        console.log("Blog added to database:", newBlog);

                        // Clear the form fields after submission
                        setDate('');
                        setDescription('');
                        setNewImage(null);
                        setPreviewImage('');
                    })
                    .catch(error => {
                        console.error("Error adding blog to database:", error);
                    });
            });
        }
    );
};

    
  return (
    <div>
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-lg">
            <h2 className="text-3xl font-semibold mb-6">Add Blog Post</h2>
            {/* <form onSubmit={handleSubmit} className="space-y-6"> */}
                
                {/* Date Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <ReactQuill
                        rows="4"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Add a description..."
                        value={description}
                        // onChange={(e) => setDescription(e.target.value)}
                        onChange={(value) => setDescription(value)}
                        required
                    ></ReactQuill>
                </div>
                {previewImage && (
                <img
                    src={previewImage}
                    alt="Product Preview"
                    className="w-96 h-2/4 object-cover mb-4 rounded-full border-4 border-yellow-600 mx-auto xl:mx-48"
                />
            )}
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 ">Add Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                {/* Submit Button */}
                <div className="text-right mt-5">
                    <button
                    onClick={addBlog}
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Publish Blog
                    </button>
                </div>
            {/* </form> */}
        </div>
    </div>
  )
}

export default AddBlogs