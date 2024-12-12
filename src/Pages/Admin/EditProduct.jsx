import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';

function EditProduct() {
    const { productId } = useParams();
    const [productData, setProductData] = useState({
        name: '', price: '', description: '', category: '', imageUrl: ''
    });
    const [newImage, setNewImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            const categories = ['honey', 'spices', 'oil', 'coconut'];
            for (let category of categories) {
                const productRef = ref(database, `products/categories/${category}/${productId}`);
                const snapshot = await get(productRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setProductData({ ...data, category });
                    setPreviewImage(data.imageUrl); // Set the preview image
                    break;
                }
            }
        };
        fetchProduct();
    }, [productId]);

    const handleInputChange = (e) => {
        setProductData({ ...productData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setNewImage(e.target.files[0]);
            setPreviewImage(URL.createObjectURL(e.target.files[0])); // Update the preview image
        }
    };

    const updateProduct = () => {
        setUploading(true);

        const saveProduct = (imageUrl) => {
            const productRef = ref(database, `products/categories/${productData.category}/${productId}`);
            set(productRef, { ...productData, imageUrl })
                .then(() => {
                    setUploading(false);
                    toast.success('Product updated successfully!');
                })
                .catch((error) => toast.error("Error updating product:", error));
        };

        if (newImage) {
            const imageRef = storageRef(storage, `product_images/${newImage.name}`);
            const uploadTask = uploadBytesResumable(imageRef, newImage);
            uploadTask.on('state_changed', null, console.error, () => {
                getDownloadURL(uploadTask.snapshot.ref).then(saveProduct);
            });
        } else {
            saveProduct(productData.imageUrl);
        }
    };

  return (
    <div>
<div className="flex flex-col p-10 gap-5">
            <h1 className="text-4xl font-bold">Edit Product</h1>
            
            <input
                type="text"
                name="name"
                placeholder="Name"
                value={productData.name}
                onChange={handleInputChange}
                className="xl:w-2/4"
            />
            <input
                type="number"
                name="price"
                placeholder="Price"
                value={productData.price}
                onChange={handleInputChange}
                className="xl:w-2/4"
            />
            <textarea
                name="description"
                placeholder="Description"
                value={productData.description}
                onChange={handleInputChange}
                className="xl:w-2/4 h-44"
            />
            <select
                name="category"
                value={productData.category}
                onChange={handleInputChange}
                className="xl:w-2/4"
            >
                <option value="" disabled>Select a Category</option>
                <option value="honey">Honey</option>
                <option value="spices">Spices</option>
                <option value="oil">Oil</option>
                <option value="coconut">Coconut</option>
            </select>

            
            {previewImage && (
                <img
                    src={previewImage}
                    alt="Product Preview"
                    className="w-96 h-2/4 object-cover mb-4 rounded-full border-4 border-yellow-600 mx-auto xl:mx-48"
                />
            )}
            <input
                type="file"
                onChange={handleImageChange}
                className="w-2/4 rounded-lg"
            />
            <button
                onClick={updateProduct}
                className={`px-4 py-2 xl:w-2/4 bg-yellow-600 text-white rounded ${uploading && 'opacity-50'}`}
                disabled={uploading}
            >
                {uploading ? 'Updating...' : 'Update Product'}
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

export default EditProduct