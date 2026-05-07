import { onValue, query, ref, remove, update } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css';
import { database } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import { collection, deleteDoc, doc, onSnapshot, orderBy, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from 'firebase/auth';

function UsersTable() {
    const [users, setUsers] = useState([]);
    const [searchquery, setSearchquery] = useState("")
    const [showModal, setShowModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [editUserData, setEditUserData] = useState({ name: "", email: "", phone: "", role: "" });


    useEffect(() => {
        const usersRef = collection(database, "users");
        const usersQuery = query(usersRef, orderBy("timestamp", "desc"));

        // Listen for real-time updates
        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
            if (!snapshot.empty) {
                const usersList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Filter out admins
                const otherUsers = usersList.filter(user => user.role !== "admin");

                setUsers(otherUsers);
            } else {
                setUsers([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const searchedOrders = users.filter((user) => {
        return (
            user.id.toLowerCase().includes(searchquery.toLowerCase()) || // Check user ID
            user.name.toLowerCase().includes(searchquery.toLowerCase())  // Check user name
        );
    });
    const openEditModal = (user) => {
        setEditUserData(user);
        setEditModal(true);
    };
    // const confirmDelete = (userId) => {
    //     console.log("🧼 Confirm Delete Clicked:", userId);
    //     setSelectedUserId(userId);
    //     setShowModal(true);
    // };
    const confirmDelete = (userId) => {
  if (!userId || typeof userId !== "string") {
    console.error("❌ Invalid userId passed to confirmDelete:", userId);
    return;
  }

  console.log("🧼 Confirm Delete Clicked:", userId);
  setSelectedUserId(userId);
  setShowModal(true);
};

const handleDelete = async () => {
  if (!selectedUserId) {
    console.error("🚫 No user ID selected!");
    return;
  }

  console.log(" Selected UID to delete:", selectedUserId);

  try {
    const response = await fetch("https://us-central1-honey-8e04f.cloudfunctions.net/deleteUserCompletelyv2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ uid: selectedUserId })
    });

    const result = await response.json();
    console.log("Delete result:", result);
     await deleteDoc(doc(database, "users", selectedUserId));

    if (response.ok) {
         setUsers(users.filter(u => u.id !== selectedUserId));
      setShowModal(false);
      setSelectedUserId(null);
     
      toast.success("User deleted successfully.");
    } else {
      toast.error(result.error || "Failed to delete user.");
    }

  } catch (error) {
    console.error("🔥 Error:", error);
    toast.error(`Failed to delete user:`);
  }
};



    // const handleDelete = async () => {
    //     if (!selectedUserId) return;

    //     try {
    //         const userRef = doc(database, "users", selectedUserId);
    //         // Delete user from Firestore
    //         await deleteDoc(userRef);

    //         // Remove from Firebase Authentication
    //         const auth = getAuth();
    //         const user = auth.currentUser 

    //         if (user && user.uid === selectedUserId) {
    //             await deleteUser(user); // Delete user from Firebase Authentication
    //         }
    //         setUsers(users.filter(user => user.id !== selectedUserId));
    //         setShowModal(false);
    //         setSelectedUserId(null);
    //         toast.success("User deleted successfully!");
    //     } catch (error) {
    //         toast.error("Error deleting user",error)
    //     }
    // };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!editUserData.id) return;
         const isEmailValid = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(editUserData.email);
    const isPhoneValid = /^\d{10}$/.test(editUserData.phone);
      const isNameValid = editUserData.name.trim() !== "";

    if (!isNameValid) {
        toast.error("Name is required.");
        return;
    }

    if (!isEmailValid) {
        toast.error("Invalid email format.");
        return;
    }

    if (!isPhoneValid) {
        toast.error("Phone must be 10 digits.");
        return;
    }

        try {
            await updateDoc(doc(database, `users/${editUserData.id}`), {
                name: editUserData.name,
                email: editUserData.email,
                phone: editUserData.phone,
                role: editUserData.role
            });
            toast.success("User updated successfully!");
            setEditModal(false);
            setShowModal(false);
        } catch (error) {
            toast.error("Error updating user",error)
        }
    };
    return (
        <div>
        <div className='md:ml-44 md:p-6 p-2 min-h-screen'>
            <div className=" max-w-screen-xl md:ml-20">
                <h1 className=" mb-10 text-2xl font-bold text-gray-900">Users</h1>
                <form className="relative flex w-full md:max-w-2xl items-center p-1">
                    <svg className="absolute left-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx={11} cy={11} r={8} />
                        <line x1={21} y1={21} x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        name="search"
                        className="h-14 w-full rounded-md py-4 pr-40 pl-12 focus:outline-none border-none focus:ring-0 focus:border-b-2 focus:border-yellow-600"
                        placeholder="Search with userId or Name"
                        value={searchquery}
                        onChange={(e) => setSearchquery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brandyellow px-6 py-2 text-white rounded-md">
                        Search
                    </button>
                </form>
                <div className=" bg-white overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-brandyellow">
                                <th className="md:px-6 md:py-3 text-left text-sm font-semibold text-black">
                                    User ID
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                                    User Name
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                                    Phone No
                                </th>

                                <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {searchedOrders.length > 0 ? (
                                searchedOrders.map((user) => (
                                    <tr key={user.id} className="border-b">
                                        <td className="px-6 py-4 text-sm text-gray-800">{user.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800">{user.role}</td>

                                        <td className="px-6 py-4 text-sm text-gray-800">{user.phone}</td>
                                        <td className="px-6 py-4 text-sm text-yellow-700 cursor-pointer">
                                            <div className='flex gap-3'>
                                                <button
                                                    onClick={() => confirmDelete(user.id)}
                                                    className="bg-red-600 rounded-lg text-white h-8 w-24"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(user)} className="bg-brandyellow rounded-lg text-white h-8 w-24">
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-700">
                                        No Users Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {showModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                                <p className="text-lg font-semibold">Do you really want to delete this user?</p>
                                <div className="mt-4 flex justify-center gap-4">
                                    <button
                                        onClick={handleDelete}
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
                    {editModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h2 className="text-xl font-semibold mb-4">Edit User</h2>
                                <input type="text" name="name" value={editUserData.name} onChange={handleEditChange} className="block w-full mb-2 p-2 border rounded" placeholder="Name" />
                                <input type="email" name="email" value={editUserData.email} onChange={handleEditChange} className="block w-full mb-2 p-2 border rounded" placeholder="Email" />{editUserData.email &&
  !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(editUserData.email) && (
    <p className="text-red-500 text-sm mb-2">Invalid email format</p>
  )}
                                <input type="text" name="phone" value={editUserData.phone} onChange={handleEditChange} className="block w-full mb-2 p-2 border rounded" placeholder="Phone" />{editUserData.phone &&
  !/^\d{10}$/.test(editUserData.phone) && (
    <p className="text-red-500 text-sm mb-2">Phone must be 10 digits</p>
  )}
                                <div className='flex justify-between'>
                                    <button onClick={handleUpdate} className="bg-yellow-600 text-white px-4 py-2 rounded-lg">Update</button>
                                    <button
                                        onClick={() => setEditModal(false)}
                                        className="bg-gray-400 text-white px-4 py-2 rounded-lg">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <ToastContainer
                        position="bottom-center"
                        autoClose={1200}
                        limit={1}
                        hideProgressBar={false}
                    />
                </div>
            </div>
            
        </div>
        
        </div>
        
    )
}

export default UsersTable