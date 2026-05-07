import React, { useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../../FirebaseConfig'
import { toast, ToastContainer } from 'react-toastify';
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

function AddProduct() {
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [productImage, setProductImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [productWeightValue, setProductWeightValue] = useState('');
    const [productWeightUnit, setProductWeightUnit] = useState('g');
    const [isGift, setIsGift] = useState(false);
    const [isPreorder, setIsPreorder] = useState(false);
    const [stockStatus, setStockStatus] = useState("in-stock");



    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductImage(file);
            setPreviewImage(URL.createObjectURL(file)); // Update the preview image
        }
    };
    useEffect(() => {
        const fetchCategories = async () => {
            const categoryCollection = collection(database, "categories");
            const categorySnapshot = await getDocs(categoryCollection);
            const categoryList = categorySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(categoryList);
        };

        fetchCategories();
    }, []);

    const addProduct = async () => {
        if (!productImage || !productCategory || !productWeightValue || !productWeightUnit || !productPrice) {
            toast.error("Please enter all details");
            return;
        }

        const trimmedName = productName.trim();
        const trimmedWeight = `${productWeightValue}${productWeightUnit}`.trim().toLowerCase();

        if (!trimmedName) {
            toast.error("Product name cannot be empty");
            return;
        }
        if (productPrice <= 0 || productPrice > 100000) {
            toast.info("Price must be between 1 and 100000.");
            return;
        }
        const weightValue = parseFloat(productWeightValue);
        if (isNaN(weightValue)) {
            toast.error("Please enter a valid weight value");
            return;
        }
        const validUnits = ['g', 'kg', 'l', 'ml'];
        if (!validUnits.includes(productWeightUnit.toLowerCase())) {
            toast.error("Invalid weight unit. Please use g, kg, l, or ml");
            return;
        }
        let maxWeight;
        switch (productWeightUnit.toLowerCase()) {
            case 'g':
                maxWeight = 10000; // 10kg in grams
                break;
            case 'kg':
                maxWeight = 100; // 100kg
                break;
            case 'l':
                maxWeight = 100; // 100 liters
                break;
            case 'ml':
                maxWeight = 100000; // 100 liters in ml
                break;
            default:
                maxWeight = 10000;
        }

        if (weightValue <= 0) {
            toast.error("Weight must be greater than 0");
            return;
        }

        if (weightValue > maxWeight) {
            toast.error(`Weight cannot exceed ${maxWeight}${productWeightUnit}`);
            return;
        }

        try {
            setUploading(true);

            // Step 1: Reference to the category document in Firestore
            const categoryRef = doc(database, "products", productCategory);
            const categorySnapshot = await getDoc(categoryRef);


            // Step 2: Check if the product already exists in the `products` array
            if (categorySnapshot.exists()) {
                const existingProducts = categorySnapshot.data().products || [];

                const isNameExists = existingProducts.some(
                    (product) => product.name === trimmedName &&
                        product.weight.toLowerCase() === trimmedWeight
                );

                if (isNameExists) {
                    toast.error("A product and size already exists in this category.");
                    setUploading(false);
                    return;
                }
            }


            // Step 3: Upload image to Firebase Storage
            const imageRef = storageRef(storage, `product_images/${productImage.name}`);
            const uploadTask = uploadBytesResumable(imageRef, productImage);

            uploadTask.on(
                'state_changed',
                null,
                (error) => {
                    console.error("Upload failed", error);
                    setUploading(false);
                    toast.error("Image upload failed");
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        const timestamp = new Date().getTime();
                        const newProduct = {
                            id: crypto.randomUUID(),
                            name: trimmedName,
                            weight: trimmedWeight,
                            price: productPrice,
                            description: productDescription,
                            imageUrl: downloadURL,
                            timestamp,
                            categoryId: productCategory,
                            isGift,
                            isPreorder,
                            stock: stockStatus
                        };

                        // Step 4: Add the product to the category document in Firestore
                        if (!categorySnapshot.exists()) {
                            await setDoc(categoryRef, { products: [newProduct] });
                        } else {
                            await updateDoc(categoryRef, {
                                products: arrayUnion(newProduct),
                            });
                        }

                        toast.success("Product added successfully");


                        setProductName('');
                        setProductWeightValue('');
                        setProductPrice('');
                        setProductDescription('');
                        setProductCategory('');
                        setProductImage(null);
                        setPreviewImage(null);
                        setIsPreorder(false);
                        setIsGift(false);
                        document.getElementById("productImageInput").value = "";
                        setUploading(false);

                    } catch (error) {
                        console.error("Error details:", error.message);
                        toast.error("Error adding product");
                        setUploading(false);
                    }
                }
            );
        } catch (error) {
            console.error("Firestore error:", error.message);
            toast.error("Error checking product name");
            setUploading(false);
        }
    };

    return (
        <div>
            <div className='lg:ml-64'>
                <div className=' mx-auto p-6'>
                    {/* Header Section */}
                    <div className='mb-8'>
                        <div className='flex items-center gap-3 mb-2'>
                            <div className='w-8 h-8 bg-brandyellow rounded-lg flex items-center justify-center'>
                                <svg className='w-5 h-5 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h1 className='text-2xl lg:text-3xl font-bold text-gray-800'>Add New Product</h1>
                        </div>
                        <p className='text-gray-600 ml-11'>Fill in the product details below to add a new item to your inventory</p>
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
                                        placeholder="e.g., Organic Honey 500g"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        required
                                        className='w-full rounded-xl p-4 border border-gray-200 focus:border-brandyellow focus:ring-2 focus:ring-brandyellow/20 transition-all duration-200'
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
                                            placeholder="Enter weight"
                                            value={productWeightValue}
                                            onChange={(e) => setProductWeightValue(e.target.value)}
                                            required
                                            className='flex-1 rounded-xl p-4 border border-gray-200 focus:border-brandyellow focus:ring-2 focus:ring-brandyellow/20 transition-all duration-200'
                                        />
                                        <select
                                            value={productWeightUnit}
                                            onChange={(e) => setProductWeightUnit(e.target.value)}
                                            className='w-32 rounded-xl p-4 border border-gray-200 bg-gray-50 focus:border-brandyellow focus:ring-2 focus:ring-brandyellow/20 transition-all duration-200'
                                            required
                                        >
                                            <option value="g">Gram (g)</option>
                                            <option value="kg">Kilogram (kg)</option>
                                            <option value="l">Liter (l)</option>
                                            <option value="ml">Milliliter (ml)</option>
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
                                            placeholder="0.00"
                                            value={productPrice}
                                            onChange={(e) => setProductPrice(e.target.value)}
                                            required
                                            className='w-full rounded-xl p-4 pl-10 border border-gray-200 focus:border-brandyellow focus:ring-2 focus:ring-brandyellow/20 transition-all duration-200'
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Category <span className='text-red-500'>*</span>
                                    </label>
                                    <select
                                        value={productCategory}
                                        onChange={(e) => setProductCategory(e.target.value)}
                                        className="w-full rounded-xl p-4 border border-gray-200 bg-white focus:border-brandyellow focus:ring-2 focus:ring-brandyellow/20 transition-all duration-200"
                                        required
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map((catry) => (
                                            <option key={catry.id} value={catry.id}>{catry.category}</option>
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
                                        placeholder="Describe your product features, benefits, and details..."
                                        value={productDescription}
                                        onChange={(e) => setProductDescription(e.target.value)}
                                        rows="4"
                                        className='w-full rounded-xl p-4 border border-gray-200 focus:border-brandyellow focus:ring-2 focus:ring-brandyellow/20 transition-all duration-200 resize-none'
                                        required
                                    />
                                </div>

                                {/* Status Switches */}
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='bg-gray-50 rounded-xl p-4'>
                                        <label className='flex items-center justify-between cursor-pointer'>
                                            <span className='font-medium text-gray-700'>Gift Item</span>
                                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isGift ? 'bg-brandyellow' : 'bg-gray-300'}`}>
                                                <input
                                                    type='checkbox'
                                                    checked={isGift}
                                                    onChange={(e) => setIsGift(e.target.checked)}
                                                    className='sr-only'
                                                />
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isGift ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </div>
                                        </label>
                                        <p className='text-xs text-gray-500 mt-2'>Check if product is suitable for gifting</p>
                                    </div>

                                    <div className='bg-gray-50 rounded-xl p-4'>
                                        <label className='flex items-center justify-between cursor-pointer'>
                                            <span className='font-medium text-gray-700'>Preorder</span>
                                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPreorder ? 'bg-brandyellow' : 'bg-gray-300'}`}>
                                                <input
                                                    type='checkbox'
                                                    checked={isPreorder}
                                                    onChange={(e) => setIsPreorder(e.target.checked)}
                                                    className='sr-only'
                                                />
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPreorder ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </div>
                                        </label>
                                        <p className='text-xs text-gray-500 mt-2'>Available for pre-order</p>
                                    </div>
                                </div>

                                {/* Stock Status */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Stock Status
                                    </label>
                                    <div className='flex gap-2'>
                                        <button
                                            type="button"
                                            onClick={() => setStockStatus('in-stock')}
                                            className={`flex-1 rounded-xl p-4 font-medium transition-all duration-200 ${stockStatus === 'in-stock' ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                                        >
                                            <div className='flex items-center justify-center gap-2'>
                                                <div className={`w-3 h-3 rounded-full ${stockStatus === 'in-stock' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                In Stock
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStockStatus('out-of-stock')}
                                            className={`flex-1 rounded-xl p-4 font-medium transition-all duration-200 ${stockStatus === 'out-of-stock' ? 'bg-red-100 text-red-700 border-2 border-red-500' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                                        >
                                            <div className='flex items-center justify-center gap-2'>
                                                <div className={`w-3 h-3 rounded-full ${stockStatus === 'out-of-stock' ? 'bg-red-500' : 'bg-gray-400'}`} />
                                                Out of Stock
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Product Image <span className='text-red-500'>*</span>
                                    </label>
                                    <div className='flex flex-col lg:flex-row gap-6'>
                                        <div className='flex-1'>
                                            <label className={`block cursor-pointer ${previewImage ? 'h-auto' : 'h-32'} border-2 border-dashed border-gray-300 rounded-2xl hover:border-brandyellow transition-all duration-200 hover:bg-gray-50`}>
                                                <input
                                                    type="file"
                                                    id="productImageInput"
                                                    className='hidden'
                                                    onChange={handleImageChange}
                                                    required
                                                />
                                                <div className='p-6 text-center'>
                                                    {!previewImage ? (
                                                        <>
                                                            <svg className='w-12 h-12 mx-auto text-gray-400' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <p className='mt-2 text-sm text-gray-600'>Click to upload product image</p>
                                                            <p className='text-xs text-gray-500 mt-1'>PNG, JPG, WebP up to 5MB</p>
                                                        </>
                                                    ) : (
                                                        <div className='text-left'>
                                                            <p className='text-sm font-medium text-gray-700'>Image Selected ✓</p>
                                                            <p className='text-xs text-gray-500 mt-1'>Click to change image</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        </div>

                                        {previewImage && (
                                            <div className='flex-shrink-0'>
                                                <div className='relative w-32 h-32'>
                                                    <img
                                                        src={previewImage}
                                                        alt="Product Preview"
                                                        className="w-full h-full object-cover rounded-2xl border-4 border-white shadow-md"
                                                    />
                                                    <div className='absolute -top-2 -right-2 w-6 h-6 bg-brandyellow rounded-full flex items-center justify-center'>
                                                        <svg className='w-4 h-4 text-white' fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className='mt-8 pt-6 border-t border-gray-100'>
                            <button
                                onClick={addProduct}
                                disabled={uploading}
                                className={`w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-brandyellow to-yellow-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {uploading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Uploading Product...
                                    </>
                                ) : (
                                    <>
                                        <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Product to Inventory
                                    </>
                                )}
                            </button>
                            {uploading && (
                                <p className='text-sm text-gray-500 text-center mt-3'>Please wait while we save your product details...</p>
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
            />

        </div>
    )
}

export default AddProduct