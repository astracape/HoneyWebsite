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
    switch(productWeightUnit.toLowerCase()) {
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
                            isGift
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
                <div className='flex flex-col gap-4 md:p-5'>

                    <h1 className='text-2xl lg:text-3xl font-bold px-3 border-l-4 border-brandyellow'>Add Your Products Here! </h1>

                    <input type="text"
                        placeholder="Name"
                        value={productName}
                        name='productName'
                        onChange={(e) => setProductName(e.target.value)}
                        required
                        className=' w-3/4 rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500' />
                    <div className='w-3/4 flex gap-2'>
                        <input
                            type="number"
                            placeholder="Enter weight"
                            value={productWeightValue}
                            onChange={(e) => setProductWeightValue(e.target.value)}
                            className='w-3/4 rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500'
                            required
                        />
                        <select
                            value={productWeightUnit}
                            onChange={(e) => setProductWeightUnit(e.target.value)}
                            className="w-1/4 rounded-lg p-3 border border-gray-300"
                            required
                        >
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="l">l</option>
                            <option value="ml">ml</option>

                        </select>
                    </div>

                    <input type="number"
                        placeholder="Price"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        name='productPrice'
                        className=' w-3/4 rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500'
                        required />
                    <textarea
                        placeholder="Description"
                        name='productDescription'
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        className=' h-44 w-3/4 rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500'
                        required />

                    <select

                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        className="w-3/4 rounded-lg p-3 border border-gray-300"
                        required
                    >
                        <option value="" disabled>Select a Category</option>
                        {categories.map((catry) => (
                            <option key={catry.id} value={catry.id}>{catry.category}</option>
                        ))}
                    </select>
                    <div className='w-3/4 mb-4'>
                        <p className='text-gray-700 font-semibold mb-2'>Please select if this is a gift</p>
                        <label className='flex items-center gap-2'>
                            <input
                                type='checkbox'
                                checked={isGift}
                                onChange={(e) => setIsGift(e.target.checked)}
                                required
                            />
                            Is Gift?
                        </label>
                    </div>



                    <div className='w-3/4 flex justify-between'>

                        <input type="file"
                            id="productImageInput"
                            className='rounded-lg w-3/4  focus:outline-none focus:ring-2 focus:ring-yellow-500'
                            placeholder="Image URL"
                            name='productImage'
                            onChange={handleImageChange}
                            required />
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Product Preview"
                                className="w-24 h-24 object-cover mb-4 rounded-lg border-4 border-yellow-600 mx-auto xl:mx-48"
                            />
                        )}
                    </div>
                    <button
                        onClick={addProduct}
                        className={`px-4 py-2  w-3/4 bg-brandyellow text-white rounded-lg ${uploading && 'opacity-50'}`}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Add Product'}
                    </button>
                </div>
            </div>
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