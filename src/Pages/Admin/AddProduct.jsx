import React, { useEffect, useState } from 'react'

import { ref, set, onValue } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../../FirebaseConfig'
import { toast, ToastContainer } from 'react-toastify';

function AddProduct() {
    const [products, setProducts] = useState([]);
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [productImage, setProductImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [newImage, setNewImage] = useState(null);




    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductImage(file);
            setPreviewImage(URL.createObjectURL(file)); // Update the preview image
        }
    };

    const addProduct = () => {
        // if (productImage) {
        if (!productImage || !productCategory) {
            toast.error("Please select an image and category");
            return;
        }
        // const user = firebase.auth().currentUser; // Adjust according to your Firebase auth setup
        // if (!user) {
        //     toast.error("You must be logged in to add a product.");
        //     return;
        // }
        // for image storage
        const imageRef = storageRef(storage, `product_images/${productImage.name}`);
        const uploadTask = uploadBytesResumable(imageRef, productImage);

        setUploading(true);


        uploadTask.on(
            'state_changed',
            null,
            (error) => {
                console.error("Upload failed", error);
                setUploading(false);
            },
            () => {

                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    toast.success("Image uploaded successfully:", downloadURL);

                    // Store the product 
                    const newProductRef = ref(database, `products/categories/${productCategory}/` + Date.now());
                    const newProduct = {
                        name: productName,
                        price: productPrice,
                        description: productDescription,
                        // category: productCategory,
                        imageUrl: downloadURL,
                        timestamp: Date.now() 
                    };

                    set(newProductRef, newProduct)
                        .then(() => {
                            console.log("Product added to database:", newProduct);


                            setProductName('');
                            setProductPrice('');
                            setProductDescription('');
                            setProductCategory('');
                            setProductImage('');
                            setPreviewImage(null);

                            document.getElementById("productImageInput").value = ""; // <--- Simple Reset
                            setUploading(false);
                          



                        })
                        .catch(error => {
                            console.error("Error adding product to database:", error);
                        });
                }
                );
            }
        );
        // } 
        // else {
        //     alert("Please select an image and category");
        //     console.log("error")
        // }
    };
    return (
        <div>

            <div className='flex flex-col md:p-10 gap-5 mb-10 mt-5'>
                <h1 className='text-2xl md:text-4xl font-bold '>Add Your Products Here! </h1>
                <input type="text"
                    placeholder="Name"
                    value={productName}
                    name='productName'
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    className='md:w-2/4 w-3/4 rounded-lg p-3' />
                <input type="number"
                    placeholder="Price"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    name='productPrice'
                    className='md:w-2/4 w-3/4 rounded-lg p-3'
                    required />
                <textarea
                    placeholder="Description"
                    name='productDescription'
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    className='md:w-2/4 h-44 w-3/4 rounded-lg p-3'
                    required />

                <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="md:w-2/4 w-3/4 rounded-lg p-3"
                    required
                >
                    <option value="" disabled>Select a Category</option>
                    <option value="honey">Honey</option>
                    <option value="spices">Spices</option>
                    <option value="oil">Oil</option>
                    <option value="coconut">Coconut</option>
                    <option value="nuts">Nuts</option>
                    <option value="wholesale">Wholesale</option>

                </select>

                {previewImage && (
                    <img
                        src={previewImage}
                        alt="Product Preview"
                        className="w-96 h-2/4 object-cover mb-4 rounded-full border-4 border-yellow-600 mx-auto xl:mx-48"
                    />
                )}
                <input type="file"
                 id="productImageInput" 
                    className='rounded-lg md:w-2/4 w-3/4'
                    placeholder="Image URL"
                    name='productImage'
                    onChange={handleImageChange}
                    required />

                <button
                    onClick={addProduct}
                    className={`px-4 py-2 md:w-2/4 w-3/4 bg-yellow-600 text-white rounded-lg ${uploading && 'opacity-50'}`}
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Add Product'}
                </button>
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

export default AddProduct