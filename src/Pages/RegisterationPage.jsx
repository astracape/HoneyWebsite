import React, { useState } from "react";
import { auth, provider, database } from "../FirebaseConfig";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  browserLocalPersistence,
  setPersistence,
  getAuth,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

function RegisterationPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
// const auth = getAuth();

  const validatePhoneNumber = (num) => /^[6-9]\d{9}$/.test(num);
const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      }
    );
  }
  return window.recaptchaVerifier;
};




  const sendOtp = async () => {
  if (!validatePhoneNumber(phone)) {
    toast.error("Enter a valid 10-digit number");
    return;
  }

  setOtpLoading(true);

  try {
    const fullPhone = "+91" + phone;
    const appVerifier = setupRecaptcha();

    // send OTP
    const confirmation = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
    window.confirmationResult = confirmation;

    toast.success("OTP sent!");
    setGeneratedOtp(true);
  } catch (err) {
    console.error("sendOtp error", err);
    toast.error(err.code === "auth/invalid-recaptcha-token"
      ? "reCAPTCHA failed, please refresh and try again"
      : "Failed to send OTP"
    );
  } finally {
    setOtpLoading(false);
  }
};


  const verifyOtp = async () => {
    if (!otp) return;
    setOtpLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);

      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;
      const uid = user.uid;

      const userRef = doc(database, "users", uid);
      const userSnap = await getDoc(userRef);

      let isNewUser = false;
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
        });
      } else {
        isNewUser = true;
        await setDoc(userRef, {
          phone: "+91" + phone,
          name: "",
          email: "",
          role: "user",
          method:"phone",
          firstLogin: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      }

      localStorage.setItem("uid", uid);
      toast.success("Login Successful!");

      setTimeout(() => {
        if (isNewUser) navigate("/profile");
        else navigate("/");
      }, 800);

    } catch (err) {
      toast.error("Invalid OTP");
      console.error("OTP Error:", err);
    } finally {
      setOtpLoading(false);
    }
  };

  // const handleGoogleLogin = async () => {
  //   setGoogleLoading(true);
  //   try {
  //      provider.setCustomParameters({
  //     prompt: "select_account",
  //   });
  //     const result = await signInWithPopup(auth, provider);
  //     const user = result.user;
  //     const uid = user.uid;

  //     const userRef = doc(database, "users", uid);
  //     const userSnap = await getDoc(userRef);
  //     let isNewUser = false;
  //     if (!userSnap.exists()) {
  //       isNewUser = true;
  //       await setDoc(userRef, {
  //         name: user.displayName,
  //         email: user.email,
  //         createdAt: serverTimestamp(),
  //         method:"google"
  //       });
  //     } else {
  //       await updateDoc(userRef, { lastLogin: serverTimestamp() });
  //     }

  //     localStorage.setItem("uid", user.uid);
  //     toast.success("Welcome!");

  //     if (isNewUser) navigate("/profile");
  //     else navigate("/");

  //   } catch (err) {
  //     toast.error("Google login failed");
  //   } finally {
  //     setGoogleLoading(false);
  //   }
  // };
  const handleGoogleLogin = async () => {
  setGoogleLoading(true);

  try {
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const uid = user.uid;

    const userRef = doc(database, "users", uid);
    const snap = await getDoc(userRef);

    let role = "user";

    if (!snap.exists()) {

      await setDoc(userRef, {
        name: user.displayName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        photoURL: user.photoURL || "",
        role: role,
        method: "google",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

    } else {

      const data = snap.data();
      role = data.role || "user";

      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
    }

    localStorage.setItem("uid", uid);
    localStorage.setItem("role", role);

    toast.success("Welcome!");

    if (role === "admin") navigate("/dashboard");
    else navigate("/");

  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    toast.error("Google login failed");
  } finally {
    setGoogleLoading(false);
  }
};

const resetOtpFlow = () => {
  setGeneratedOtp(false);
  setOtp("");
  window.recaptchaVerifier?.clear?.();
  window.recaptchaVerifier = null;
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-8">
      <div id="recaptcha-container"></div>
      {/* <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-8"> */}
       <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-amber-100">
         <div className="text-center bg-gradient-to-r from-amber-500 to-amber-600 p-8">
           <h1 className="text-3xl font-bold text-white mb-1">CapeNaturals</h1>
           <p className="text-amber-100 text-sm">Welcome to our honey community 🍯</p>
         </div>

         <div className="p-8">
           <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">
            Login or Register
          </h2>

          {!generatedOtp ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex items-center border-2 border-gray-200 rounded-xl mb-4 focus:ring-0 focus:outline-none">
                <span className="pl-4 text-gray-600">+91</span>
                <input
                  type="tel"
                  placeholder="Enter your number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="w-full px-4 py-3 outline-none text-lg"
                  disabled={otpLoading}
                />
              </div>

              <button
                onClick={sendOtp}
                disabled={otpLoading || phone.length !== 10}
                className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-amber-700 transition-all duration-200 disabled:opacity-50"
              >
                {otpLoading ? "Sending OTP..." : "Send OTP"}
              </button>

              <div className="my-6 text-center text-gray-500 text-sm">
                or
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3  py-3 rounded-xl hover:bg-gray-50 transition"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span className="font-medium text-gray-700">
                  Continue with Google
                </span>
              </button>
              <div className="text-center mt-4">
  <p className="text-sm text-gray-600">
    Already have an account?{" "}
    <span
      onClick={() => navigate("/login")}
      className="text-amber-600 font-semibold cursor-pointer hover:underline"
    >
      Login
    </span>
  </p>
</div>

            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full text-center text-2xl tracking-widest font-bold border-2 border-gray-200 rounded-xl py-3 mb-4"
                maxLength={6}
              />

              <button
                onClick={verifyOtp}
                disabled={otpLoading || otp.length !== 6}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
              >
                {otpLoading ? "Verifying..." : "Verify & Continue"}
              </button>

              <button
                onClick={resetOtpFlow}
                className="w-full text-sm text-amber-600 mt-3 hover:text-amber-800"
              >
                Use different number
              </button>
              
            </>
          )}
        </div>
      </div>

     
      <ToastContainer position="bottom-center" autoClose={4000} />
    </div>
  );
}

export default RegisterationPage;
