import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import 'react-toastify/dist/ReactToastify.css';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

function EditProduct() {
    const { productId } = useParams();
    const [productData, setProductData] = useState({
        name: '', weight: '', price: '', description: '', category: '', imageUrl: ''
    });
    const [newImage, setNewImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [productWeightValue, setProductWeightValue] = useState('');
    const [productWeightUnit, setProductWeightUnit] = useState('g');

    useEffect(() => {
        if (productData.weight) {
            const unit = productData.weight.includes('kg') ? 'kg' : 'g';
            const value = parseFloat(productData.weight.replace(unit, ''));
            setProductWeightValue(value);
            setProductWeightUnit(unit);
        }
    }, [productData.weight]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, "categories"));
                const categoryList = querySnapshot.docs.map(doc => doc.data()?.category).filter(name => name);;
                setCategories(categoryList);
            } catch (error) {
                toast.error("Error fetching categories.");
            }
        };
        fetchCategories();
    }, []);
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const categoriesRef = collection(database, "products");
                const categoryDocs = await getDocs(categoriesRef);

                for (let categoryDoc of categoryDocs.docs) {
                    const category = categoryDoc.id;
                    const categoryData = categoryDoc.data();
                    const productsArray = categoryData.products || [];

                    const foundProduct = productsArray.find(prod => prod.id === productId);
                    if (foundProduct) {
                        setProductData({ ...foundProduct, category });
                        setPreviewImage(foundProduct.imageUrl);
                        break;
                    }
                }
            } catch (error) {
                toast.error("Error fetching product.");
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

    
    const updateProduct = async () => {
    setUploading(true);

    try {
        let imageUrl = productData.imageUrl;

        if (newImage) {
            const imageRef = storageRef(storage, `product_images/${newImage.name}`);
            const uploadTask = await uploadBytesResumable(imageRef, newImage);
            imageUrl = await getDownloadURL(uploadTask.ref);
        }

        const categoryRef = doc(database, "products", productData.category);
        const categorySnapshot = await getDoc(categoryRef);

        if (!categorySnapshot.exists()) {
            toast.error("Category not found!");
            setUploading(false);
            return;
        }

        const categoryData = categorySnapshot.data();

        const updatedProducts = categoryData.products.map(prod =>
            prod.id === productId
                ? {
                    ...prod,
                    ...productData,
                    weight: `${productWeightValue}${productWeightUnit}`,
                    imageUrl
                }
                : prod
        );

        await updateDoc(categoryRef, { products: updatedProducts });

        setUploading(false);
        toast.success('Product updated successfully!');
    } catch (error) {
        toast.error("Failed to update product.");
        setUploading(false);
    }
};


    return (
        <div>
            <div className=" lg:ml-44 flex flex-col p-10 gap-5">
                <h1 className="text-4xl font-bold">Edit Product</h1>

                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={productData.name}
                    onChange={handleInputChange}
                    className="w-3/4 rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
            
                <div className="w-3/4 flex gap-2">
                    <input
                        type="number"
                        name="weightValue"
                        placeholder="Enter weight"
                        value={productWeightValue}
                        onChange={(e) => setProductWeightValue(e.target.value)}
                        className="w-3/4 rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        required
                    />
                    <select
                        value={productWeightUnit}
                        onChange={(e) => setProductWeightUnit(e.target.value)}
                        className="w-3/4 rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        required
                    >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                    </select>
                </div>

                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={productData.price}
                    onChange={handleInputChange}
                    className="w-3/4 rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={productData.description}
                    onChange={handleInputChange}
                    className="w-3/4 rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <select
                    name="category"
                    value={productData.category}
                    onChange={handleInputChange}
                    className="w-3/4 rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >

                    <option value="" disabled>Select a Category</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                    ))}
                </select>


                {previewImage && (
                    <img
                        src={previewImage}
                        alt="Product Preview"
                        className="w-24 h-24 object-cover rounded-lg border-4 border-yellow-600"
                    />
                )}
                <input
                    type="file"
                    onChange={handleImageChange}
                    className="w-3/4 rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                    onClick={updateProduct}
                    className={`px-4 py-2 w-3/4 bg-yellow-600 text-white rounded-lg ${uploading && 'opacity-50'}`}
                    disabled={uploading}
                >
                    {uploading ? 'Updating...' : 'Update Product'}
                </button>
            </div>
            <ToastContainer
                position="bottom-center"
                autoClose={1200}
                hideProgressBar={false}
                limit={1}
                pauseOnHover
            />
        </div>
    )
}

export default EditProduct