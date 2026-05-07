import { onAuthStateChanged, updateProfile } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, database, storage } from "../../FirebaseConfig";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";

function Profile() {
  const [user, setUser] = useState(null);
  const [phoneError, setPhoneError] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    photoURL: "",
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);


  const validatePhone = (value) => {
    if (!value) return "Phone number is required";
    if (!/^[6-9]\d{9}$/.test(value)) {
      return "Enter a valid 10-digit mobile number";
    }
    return "";
  };
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadProfile(currentUser.uid, currentUser);
      } else {
        window.location.href = "/reg";
      }
    });
    return () => unsub();
  }, []);

  const loadProfile = async (uid, authUser) => {
    const docRef = doc(database, "users", uid);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      setProfile(snap.data());
    } else {
      // Create profile if not exists
      const newProfile = {
        name: authUser.displayName || "",
        email: authUser.email || "",
        phone: authUser.phoneNumber || "",
        photoURL: authUser.photoURL || "",
        createdAt: serverTimestamp(),
      };
      await setDoc(docRef, newProfile);
      setProfile(newProfile);
    }
    setLoading(false);
  };

  // Upload Image to Firebase Storage
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploading(true);
    const imageRef = ref(storage, `profileImages/${user.uid}/${file.name}`);

    try {

      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      // Update Firestore and Firebase Auth profile
      const docRef = doc(database, "users", user.uid);
      await updateDoc(docRef, { photoURL: downloadURL });
      await updateProfile(user, { photoURL: downloadURL });


      setProfile((prev) => ({ ...prev, photoURL: downloadURL }));
      toast.success("Profile photo updated!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;
    const error = validatePhone(profile.phone);
    if (error) {
    setPhoneError(error);
    // toast.error("Please enter a valid phone number");
    return;
  }
    const docRef = doc(database, "users", user.uid);
    await updateDoc(docRef, {
      ...profile,
      updatedAt: serverTimestamp(),
    });
    toast.success("Profile updated!");
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings</p>
        </div>


        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-100">
          <div className="p-8">

            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <img
                  src={profile.photoURL || "https://via.placeholder.com/120"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                />
                <label
                  htmlFor="photoUpload"
                  className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                  <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {uploading ? "Uploading..." : "Change"}
                  </span>
                  <input
                    id="photoUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mt-4">
                {profile.name || "Your Name"}
              </h2>
              <p className="text-gray-500 text-sm">{profile.email}</p>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>


              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  value={profile.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // only digits
                    setProfile({ ...profile, phone: value });
                    setPhoneError(validatePhone(value));
                  }}
                  inputMode="numeric"
                  maxLength={10}
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 
    ${phoneError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-amber-500"
                    }`}
                  placeholder="Your phone number"
                />
{phoneError && (
  <p className="text-sm text-red-500 mt-1">{phoneError}</p>
)}

              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                  placeholder="Your email"
                />

              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleUpdate}
                disabled={uploading}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default Profile;


