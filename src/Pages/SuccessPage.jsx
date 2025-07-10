import React from 'react'
import { ToastContainer } from 'react-toastify'
import { useNavigate } from 'react-router-dom';
import imgSuccess from "../assets/success.png"

function SuccessPage() {
    const navigate = useNavigate();
  return (
    <div>
         <div className="h-screen flex items-center justify-center p-8">
            <div className="max-w-lg w-full rounded-md p-6">
                <div className="flex justify-center mb-6">
                    <img src={imgSuccess} alt="Success" className="w-64 h-64" />
                </div>
                <h2 className="text-3xl font-bold text-center text-green-700 mb-4">  Order confirmed! We're processing it now.</h2>
                <p className="text-center text-gray-600 mb-6">
                    Your order has been placed successfully. We will process it and notify you once it's on the way.
                </p>
                <div className="flex justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="py-4 px-8 bg-brandyellow text-white font-semibold rounded-md shadow-md transition duration-200 ease-in-out hover:shadow-xl hover:scale-95"
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
            <ToastContainer
                position="bottom-center"
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    </div>
  )
}

export default SuccessPage