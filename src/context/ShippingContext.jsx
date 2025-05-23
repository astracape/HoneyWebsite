import { createContext, useState, useEffect } from 'react';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { database } from '../FirebaseConfig';

export const ShippingContext = createContext();

export const ShippingProvider = ({ children }) => {
    const [shippingTypes, setShippingTypes] = useState([]);
    const [shippingMethods, setShippingMethods] = useState([])
    const [shippingRate, setShippingRate] = useState(0);
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const fetchShippingTypes = async () => {
        try {
            console.log("Fetching shipping types...");
            const querySnapshot = await getDocs(collection(database, "shipping_types"));
            console.log("QuerySnapshot:", querySnapshot);

            const types = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setShippingTypes(types);
        } catch (error) {
            console.error("Error fetching shipping types:", error);
        }
    };

    const addShippingMethod = async (newMethod) => {
        try {
            const docRef = await addDoc(collection(database, "shipping_methods"), newMethod);
            
            // Update local state immediately after adding
            setShippingMethods((prevMethods) => [
                ...prevMethods,
                { id: docRef.id, ...newMethod },
            ]);

            return { success: true, message: "Shipping method added successfully!" };
        } catch (error) {
            console.error("Error adding shipping method:", error);
            return { success: false, message: "Failed to add shipping method." };
        }
    };

    const fetchShippingMethods = async () => {
        try {
            const querySnapshot = await getDocs(collection(database, "shipping_methods"));
            const methods = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setShippingMethods(methods);
        } catch (error) {
            console.error("Error fetching shipping methods:", error);
        }
    };
    
     
    const fetchShippingRate = async (state, shippingType) => {
        if (!state || !shippingType) {
            console.warn("Missing state or shipping type:", state, shippingType);
            return;
        }
        
        setLoading(true);
        setError(null);
    
        try {
            console.log("Fetching rate for:", state, shippingType);
            console.log("Trying to match region:", state, "type:", `"${shippingType}"`);

            // Querying Firestore based on region (state) and type
            const q = query(
                
                collection(database, "shipping_methods"),
                
                where("region", "==", state),
                where("type", "==", shippingType) // Ensure no trailing spaces
            );
    
            const snapshot = await getDocs(q);
            console.log("Documents found:", snapshot.size);
    
            if (!snapshot.empty) {
                snapshot.forEach((doc) => {
                    console.log("Matched doc:", doc.id, doc.data());
                });
    
                // Assuming we want the first matched document's rate
                const method = snapshot.docs[0].data();
                setShippingRate(method.rate); // Assuming 'rate' is the field you want
            } else {
                console.warn("No match found for", state, shippingType);
                setShippingRate(0);
                setError("No shipping rate found");
            }
        } catch (err) {
            console.error("Error fetching shipping rate:", err);
            setShippingRate(0);
            setError("Error fetching rate");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <ShippingContext.Provider value={{ shippingTypes ,shippingMethods,addShippingMethod,fetchShippingRate,fetchShippingMethods,fetchShippingTypes,shippingRate,
            loading,
            error,}}>
            {children}
        </ShippingContext.Provider>
    );
};
