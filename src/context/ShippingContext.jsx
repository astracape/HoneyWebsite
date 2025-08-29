import { createContext, useState, useEffect, useContext } from 'react';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { database } from '../FirebaseConfig';
import { CartContext } from './CartContext';

export const ShippingContext = createContext();

export const ShippingProvider = ({ children }) => {
    const { getCartTotalWeight, cart } = useContext(CartContext);
    const [shippingTypes, setShippingTypes] = useState([]);
    const [shippingMethods, setShippingMethods] = useState([]);
    const [shippingRate, setShippingRate] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchShippingTypes = async () => {
        try {
            const querySnapshot = await getDocs(collection(database, "shipping_types"));
            const types = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setShippingTypes(types);
        } catch (error) {
            console.error("Error fetching shipping types:", error);
        }
    };

    const resetShippingRate = () => {
        setShippingRate(0);
    };

    const addShippingMethod = async (newMethod) => {
        try {
            const methodToSave = { ...newMethod };

            const docRef = await addDoc(collection(database, "shipping_methods"), methodToSave);

            setShippingMethods((prevMethods) => [
                ...prevMethods,
                { id: docRef.id, ...methodToSave },
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

    const fetchShippingRate = async (stateName, shippingType) => {
        const productWeightKg = getCartTotalWeight(cart);

        if (!stateName || !shippingType) {
            console.warn("Missing state or shipping type:", stateName, shippingType);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const cleanState = stateName.trim();
            const cleanType = shippingType.trim();
            let q = query(
                collection(database, "shipping_methods"),
                where("region", "==", cleanState),
                where("type", "==", cleanType)
            );

            let snapshot = await getDocs(q);
            if (snapshot.empty) {
                console.log(`No shipping found for ${cleanState}, falling back to Others`);
                q = query(
                    collection(database, "shipping_methods"),
                    where("region", "==", "Others"),
                    where("type", "==", cleanType)
                );
                snapshot = await getDocs(q);
            }

            if (!snapshot.empty) {
                const method = snapshot.docs[0].data();

                const baseWeight = parseFloat(method.weight) || 0;
                const baseRate = Number(method.rate) || 0;
                const extraRate = Number(method.extraRate) || 0;

                let totalRate = baseRate;

                if (productWeightKg > 5) {
                    totalRate = 0; // free shipping > 5kg
                } else if (productWeightKg > baseWeight) {
                    const extraWeight = Math.ceil(productWeightKg - baseWeight);
                    totalRate += extraWeight * extraRate;
                }

                console.log("Calculated Shipping:", {
                    baseWeight,
                    baseRate,
                    extraRate,
                    productWeightKg,
                    totalRate
                });

                setShippingRate(totalRate);
            } else {
                setShippingRate(0);
                setError("No shipping rate found");
            }
        } catch (err) {
            console.error("Error in fetchShippingRate:", err);
            setShippingRate(0);
            setError("Error fetching rate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ShippingContext.Provider value={{
            shippingTypes,
            shippingMethods,
            addShippingMethod,
            fetchShippingRate,
            fetchShippingMethods,
            fetchShippingTypes,
            shippingRate,
            loading,
            resetShippingRate,
            error,
        }}>
            {children}
        </ShippingContext.Provider>
    );
};
