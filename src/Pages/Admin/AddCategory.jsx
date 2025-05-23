import { addDoc, collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState ,useRef} from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { database, storage } from '../../FirebaseConfig';
import { ref as storageRef, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

function AddCategory() {
    const [categoryName, setCategoryName] = useState('');
    const [headerDescription, setHeaderDescription] = useState('');
    const [categoryImage, setCategoryImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([])
    const [editingCategory, setEditingCategory] = useState(null);

    const fileInputRef = useRef(null);

    const fetchCategories = async () => {
        try {
            const querySnapshot = await getDocs(collection(database, "categories"));
            const categoryList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(categoryList);
        } catch (error) {
            toast.error("Error fetching categories.");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);
   
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCategoryImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setCategoryName('');
        setHeaderDescription('');
        setCategoryImage(null);
        setPreviewImage('');
        setEditingCategory(null);
        // document.getElementById("categoryImageInput").value = "";
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

   
    const handleSubmit = async () => {
        if (!categoryName || (!categoryImage && !editingCategory)) {
            toast.error("Please enter all required fields.");
            return;
        }
    
        setUploading(true);
    
        const uploadImageAndGetUrl = async () => {
            const imageRef = storageRef(storage, `category_images/${categoryImage.name}`);
            const uploadTask = uploadBytesResumable(imageRef, categoryImage);
            await new Promise((resolve, reject) => {
                uploadTask.on('state_changed', null, reject, resolve);
            });
            return await getDownloadURL(uploadTask.snapshot.ref);
        };
    
        try {
            let imageUrl = editingCategory?.imageUrl;
            if (categoryImage) {
                imageUrl = await uploadImageAndGetUrl();
            }
    
            if (editingCategory) {
                // UPDATE
                const docRef = doc(database, 'categories', editingCategory.id);
                await updateDoc(docRef, {
                    category: categoryName,
                    description: headerDescription,
                    imageUrl
                });
    
                toast.success("Category updated!");
            } else {
                // CREATE NEW
                const categoryId = categoryName.replace(/\s+/g, '-');
    
                // const categoryRef =await addDoc(collection(database, "categories"));//instead of const categoryRef = doc(database, "categories", categoryId);
                // await setDoc(categoryRef, {
                //     category: categoryName,
                //     description: headerDescription,
                //     imageUrl
                // });
                const categoryRef = await addDoc(collection(database, "categories"), {
                    category: categoryName,
                    description: headerDescription,
                    imageUrl
                });
                
                // Also create matching product doc
                // const productRef = doc(database, "products", categoryId);
                // await setDoc(productRef, {
                //     products: [] // You can modify this to hold an empty array or leave blank
                // });
                await setDoc(doc(database, "products", categoryRef.id), {
                    products: []
                });
                toast.success("Category added!");
            }
    
            fetchCategories();
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.");
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (category) => {
        setCategoryName(category.category);
        setHeaderDescription(category.description);
        setPreviewImage(category.imageUrl);
        setEditingCategory(category);
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm("Are you sure you want to delete this category and all its products?")) {
            try {
                // Delete the category
                await deleteDoc(doc(database, "categories", categoryId));
    
                // Delete the matching products document
                await deleteDoc(doc(database, "products", categoryId));
    
                toast.success("Category and related products deleted!");
                fetchCategories();
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete category and products.");
            }
        }
    };
    
    return (
        <div className='lg:ml-64'>


            <div className='p-5 grid lg:grid-cols-2 max-w-3xl mx-auto bg-white gap-5'>

                <div>
                    <h2 className='text-2xl font-semibold text-gray-800 py-3'>Add New Category</h2>
                    <div className='mb-6'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Category Name</label>
                        <input
                            type='text'
                            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all'
                            placeholder='Enter category name'
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Header Description */}
                    <div className='mb-6'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
                        <textarea
                            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all resize-none'
                            rows='4'
                            placeholder='Tell customers what this category is about...'
                            value={headerDescription}
                            onChange={(e) => setHeaderDescription(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div>
                    <div className='lg:mt-14'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Category Image</label>
                        <div className='flex items-center justify-center w-full'>
                            <label className='flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-500 transition-all'>
                                <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                                    <svg className='w-8 h-8 text-gray-400 mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'></path>
                                    </svg>
                                    <p className='text-sm text-gray-500'>
                                        <span className='font-semibold text-yellow-600'>Click to upload</span> or drag and drop
                                    </p>
                                    <p className='text-xs text-gray-500'>PNG, JPG, or JPEG (MAX. 800x400px)</p>
                                </div>
                                <input
                               ref={fileInputRef}
                                    type='file'
                                    className='hidden'
                                    onChange={handleImageChange}
                                    required
                                />
                            </label>
                        </div>
                    </div>

                    {/* Image Preview */}
                    {previewImage && (
                        <div className='mt-3'>
                            <img
                                src={previewImage}
                                alt='Preview'
                                className='w-24 h-24 object-cover rounded-lg border-2 border-gray-200'
                            />
                        </div>
                    )}
                </div>
                {/* Submit Button */}
                {/* <button
                    className=' w-full bg-yellow-600 text-white font-semibold py-3 rounded-lg hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all'
                    onClick={addCategory}
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Create Category'}

                </button> */}
                 <div className="col-span-2 flex gap-3">
                    <button
                        className='flex-1 bg-yellow-600 text-white font-semibold py-3 rounded-lg hover:bg-yellow-700'
                        onClick={handleSubmit}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : editingCategory ? 'Update Category' : 'Create Category'}
                    </button>

                    {editingCategory && (
                        <button
                            onClick={resetForm}
                            className='flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300'
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                {/* Toast Container */}
                <ToastContainer position='bottom-center' autoClose={1200} limit={1} hideProgressBar={false} />
            </div>
           
             <div className="p-5 max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-800 my-4">All Categories</h2>
                {categories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        {categories.map(category => (
                            <div key={category.id} className="p-4 border border-gray-300 rounded-lg text-center shadow-md relative">
                                <img src={category.imageUrl} alt={category.name} className="w-full h-32 rounded-full object-cover  mb-2 p-5" />
                                <h3 className="text-lg font-semibold">{category.category}</h3>
                                <p className="text-sm text-gray-600">{category.description}</p>
                                <div className='absolute top-2 right-2 flex gap-1'>
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className='text-xs text-yellow-600 font-bold hover:underline'
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className='text-xs text-red-600 font-bold hover:underline ml-2'
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No categories available.</p>
                )}
            </div>
        </div>
    )
}

export default AddCategory