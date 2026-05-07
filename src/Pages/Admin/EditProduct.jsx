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
        name: '', weight: '', price: '', description: '', category: '', imageUrl: '', isPreorder: false, stockStatus: "in-stock"
    });
    const [newImage, setNewImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [productWeightValue, setProductWeightValue] = useState('');
    const [productWeightUnit, setProductWeightUnit] = useState('g');
    const [originalCategoryId, setOriginalCategoryId] = useState(null);
    // const [stockStatus, setStockStatus] = useState("in-stock");


    useEffect(() => {
        if (productData.weight) {
            let unit = '';
            if (productData.weight.includes('kg')) {
                unit = 'kg';
            } else if (productData.weight.includes('g')) {
                unit = 'g';
            } else if (productData.weight.includes('l')) {
                unit = 'l';
            } else if (productData.weight.includes('ml')) {
                unit = 'ml';
            }

            setProductWeightUnit(unit);
            setProductWeightValue(parseFloat(productData.weight.replace(unit, '')));
        }
    }, [productData.weight]);



    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const querySnapshot = await getDocs(collection(database, "categories"));
                // const categoryList = querySnapshot.docs.map(doc => doc.data()?.category).filter(name => name);;
                const categoryList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().category,
                }));
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
                const productsSnapshot = await getDocs(collection(database, "products"));

                for (let doc of productsSnapshot.docs) {
                    const productsArray = doc.data().products;

                    const foundProduct = productsArray.find((item) => item.id === productId);
                    if (foundProduct) {
                        // setProductData({ ...foundProduct });
                        //  setStockStatus(foundProduct.stockStatus || "in-stock");
                        setProductData({
                            ...foundProduct,
                            isPreorder: foundProduct.isPreorder || false,
                            stockStatus: foundProduct.stockStatus || "in-stock"
                        });
                        setOriginalCategoryId(foundProduct.categoryId);
                        setPreviewImage(foundProduct.imageUrl);
                        break;
                    }
                }
            } catch (error) {
                console.error("Error fetching product.", error);
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

            //  Upload new image if changed
            if (newImage) {
                const imageRef = storageRef(storage, `product_images/${Date.now()}_${newImage.name}`);
                const uploadTask = await uploadBytesResumable(imageRef, newImage);
                imageUrl = await getDownloadURL(uploadTask.ref);
            }

            const updatedProduct = {
                ...productData,
                weight: `${productWeightValue}${productWeightUnit}`,
                imageUrl,
                stockStatus: productData.stockStatus,
                categoryId: productData.categoryId
            };

            //  If category DID NOT change
            if (originalCategoryId === productData.categoryId) {
                const categoryRef = doc(database, "products", productData.categoryId);
                const categorySnap = await getDoc(categoryRef);

                const updatedProducts = categorySnap.data().products.map(p =>
                    p.id === productId ? updatedProduct : p
                );

                await updateDoc(categoryRef, { products: updatedProducts });
            }

            //  If category CHANGED
            else {
                const oldCategoryRef = doc(database, "products", originalCategoryId);
                const newCategoryRef = doc(database, "products", productData.categoryId);

                const oldSnap = await getDoc(oldCategoryRef);
                const newSnap = await getDoc(newCategoryRef);

                // remove from old
                const oldProducts = oldSnap.data().products.filter(p => p.id !== productId);
                await updateDoc(oldCategoryRef, { products: oldProducts });

                // add to new
                const newProducts = [...newSnap.data().products, updatedProduct];
                await updateDoc(newCategoryRef, { products: newProducts });
            }

            toast.success("Product updated successfully!");
            setUploading(false);

        } catch (error) {
            console.error(error);
            toast.error("Failed to update product");
            setUploading(false);
        }
    };


    return (
        <div>
            {/* <div className='min-h-screen bg-gray-50'> */}
            <div className='lg:ml-64'>
                <div className=' mx-auto p-6'>
                    {/* Header Section */}
                    <div className='mb-8'>
                        <div className='flex items-center gap-3 mb-2'>
                            <div className='w-8 h-8 mb-7 bg-brandyellow rounded-lg flex items-center justify-center'>
                                <svg className='w-5 h-5  text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className='text-2xl lg:text-3xl font-bold text-gray-800'>Edit Product</h1>
                                <p className=' text-gray-600 mt-1'>Update product details and inventory information</p>
                            </div>
                        </div>
                    </div>

                    {/* Product Form */}
                    <div className='bg-white rounded-2xl shadow-lg p-6 lg:p-8'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                            {/* Left Column */}
                            <div className='space-y-6'>
                                {/* Product Name */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Product Name <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g., Organic Honey 500g"
                                        value={productData.name}
                                        onChange={handleInputChange}
                                        className='w-full rounded-xl p-4 border border-gray-200 focus:border-yellow-600 focus:ring-2 focus:ring-yellow-600/20 transition-all duration-200'
                                    />
                                </div>

                                {/* Weight with Unit */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Weight <span className='text-red-500'>*</span>
                                    </label>
                                    <div className='flex gap-3'>
                                        <input
                                            type="number"
                                            name="weightValue"
                                            placeholder="Enter weight"
                                            value={productWeightValue}
                                            onChange={(e) => setProductWeightValue(e.target.value)}
                                            required
                                            className='flex-1 rounded-xl p-4 border border-gray-200 focus:border-yellow-600 focus:ring-2 focus:ring-yellow-600/20 transition-all duration-200'
                                        />
                                        <select
                                            value={productWeightUnit}
                                            onChange={(e) => setProductWeightUnit(e.target.value)}
                                            className='w-32 rounded-xl p-4 border border-gray-200 bg-gray-50 focus:border-yellow-600 focus:ring-2 focus:ring-yellow-600/20 transition-all duration-200'
                                            required
                                        >
                                            <option value="g">Gram (g)</option>
                                            <option value="kg">Kilogram (kg)</option>
                                            <option value="ml">Milliliter (ml)</option>
                                            <option value="l">Liter (l)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Price (₹) <span className='text-red-500'>*</span>
                                    </label>
                                    <div className='relative'>
                                        <span className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500'>₹</span>
                                        <input
                                            type="number"
                                            name="price"
                                            placeholder="0.00"
                                            value={productData.price}
                                            onChange={handleInputChange}
                                            className='w-full rounded-xl p-4 pl-10 border border-gray-200 focus:border-yellow-600 focus:ring-2 focus:ring-yellow-600/20 transition-all duration-200'
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Category <span className='text-red-500'>*</span>
                                    </label>
                                    <select
                                        name="categoryId"
                                        value={productData.categoryId}
                                        onChange={(e) => setProductData((prev) => ({
                                            ...prev,
                                            categoryId: e.target.value,
                                        }))}
                                        className="w-full rounded-xl p-4 border border-gray-200 bg-white focus:border-yellow-600 focus:ring-2 focus:ring-yellow-600/20 transition-all duration-200"
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className='space-y-6'>
                                {/* Description */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Description <span className='text-red-500'>*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        placeholder="Describe your product features, benefits, and details..."
                                        value={productData.description}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className='w-full rounded-xl p-4 border border-gray-200 focus:border-yellow-600 focus:ring-2 focus:ring-yellow-600/20 transition-all duration-200 resize-none'
                                    />
                                </div>

                                {/* Pre-order Toggle */}
                                <div className='bg-gray-50 rounded-xl p-5'>
                                    <label className='flex items-center justify-between cursor-pointer'>
                                        <div>
                                            <span className='font-medium text-gray-700'>Pre-order Product</span>
                                            <p className='text-sm text-gray-500 mt-1'>Check if this item is available for pre-order</p>
                                        </div>
                                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${productData.isPreorder ? 'bg-yellow-600' : 'bg-gray-300'}`}>
                                            <input
                                                type='checkbox'
                                                checked={productData.isPreorder}
                                                onChange={(e) =>
                                                    setProductData((prev) => ({
                                                        ...prev,
                                                        isPreorder: e.target.checked
                                                    }))
                                                }
                                                className='sr-only'
                                            />
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${productData.isPreorder ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </div>
                                    </label>
                                </div>

                                {/* Stock Status */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Stock Status
                                    </label>
                                    <div className='flex gap-2'>
                                        <button
                                            type="button"
                                            onClick={() => setProductData(prev => ({ ...prev, stockStatus: 'in-stock' }))}
                                            className={`flex-1 rounded-xl p-4 font-medium transition-all duration-200 ${productData.stockStatus === 'in-stock' ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                                        >
                                            <div className='flex items-center justify-center gap-2'>
                                                <div className={`w-3 h-3 rounded-full ${productData.stockStatus === 'in-stock' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                In Stock
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setProductData(prev => ({ ...prev, stockStatus: 'out-of-stock' }))}
                                            className={`flex-1 rounded-xl p-4 font-medium transition-all duration-200 ${productData.stockStatus === 'out-of-stock' ? 'bg-red-100 text-red-700 border-2 border-red-500' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                                        >
                                            <div className='flex items-center justify-center gap-2'>
                                                <div className={`w-3 h-3 rounded-full ${productData.stockStatus === 'out-of-stock' ? 'bg-red-500' : 'bg-gray-400'}`} />
                                                Out of Stock
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Image Upload Section */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Product Image
                                    </label>
                                    <div className='flex flex-col lg:flex-row gap-6'>
                                        {/* Image Preview Area */}
                                        {previewImage && (
                                            <div className='flex-shrink-0'>
                                                <div className='relative'>
                                                    <div className='bg-gray-50 rounded-xl p-3 mb-2'>
                                                        <p className='text-sm font-medium text-gray-700'>Current Preview</p>
                                                    </div>
                                                    <div className='relative w-32 h-32'>
                                                        <img
                                                            src={previewImage}
                                                            alt="Product Preview"
                                                            className="w-full h-full object-cover rounded-xl border-4 border-white shadow-md"
                                                        />
                                                        <div className='absolute -top-2 -right-2 w-6 h-6 bg-brandyellow rounded-full flex items-center justify-center'>
                                                            <svg className='w-4 h-4 text-white' fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload Area */}
                                        <div className='flex-1'>
                                            <label className='block cursor-pointer border-2 border-dashed border-gray-300 rounded-2xl hover:border-yellow-600 transition-all duration-200 hover:bg-gray-50'>
                                                <input
                                                    type="file"
                                                    onChange={handleImageChange}
                                                    className='hidden'
                                                />
                                                <div className='p-6 text-center'>
                                                    <svg className='w-12 h-12 mx-auto text-gray-400' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className='mt-2 text-sm text-gray-600'>Click to upload new image</p>
                                                    <p className='text-xs text-gray-500 mt-1'>Replace current product image (PNG, JPG, WebP)</p>
                                                    <p className='text-xs text-brandyellow mt-2'>Leave empty to keep current image</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='mt-8 pt-6 border-t border-gray-100'>
                            <div className='flex flex-col lg:flex-row gap-4'>
                                <button
                                    onClick={updateProduct}
                                    disabled={uploading}
                                    className={`flex-1 px-8 py-4 bg-gradient-to-r from-brandyellow to-yellow-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {uploading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Updating Product...
                                        </>
                                    ) : (
                                        <>
                                            <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Update Product Changes
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => window.history.back()}
                                    className='px-8 py-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3'
                                >
                                    <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                </button>
                            </div>

                            {uploading && (
                                <p className='text-sm text-gray-500 text-center mt-3'>Saving your changes. Please don't close this window...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* </div> */}
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