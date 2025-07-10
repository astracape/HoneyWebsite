import { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, setDoc, updateDoc, increment, deleteDoc, onSnapshot, getDoc } from "firebase/firestore";
import { database } from "../FirebaseConfig";

// Create Context
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const auth = getAuth();

    useEffect(() => {
        let unsubscribe; 

        const fetchCart = (userId) => {
            const cartRef = collection(database, `users/${userId}/cart`);

            unsubscribe = onSnapshot(cartRef, (snapshot) => {
                const cartItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCart(cartItems);
            });
        };
        const mergeLocalStorageToFirestore = async (userId) => {
            const localCart = JSON.parse(localStorage.getItem("cart")) || [];

            if (localCart.length > 0) {
                for (const item of localCart) {
                    const productRef = doc(database, `users/${userId}/cart`, item.id);
                    const productSnapshot = await getDoc(productRef);

                    if (productSnapshot.exists()) {
                        // If item exists, increment quantity
                        await updateDoc(productRef, {
                            quantity: increment(item.quantity),
                        });
                    } else {
                        // If item does not exist, add it
                        await setDoc(productRef, { ...item, quantity: item.quantity });
                    }
                }
                localStorage.removeItem("cart"); // Clear local storage after merging
            }
        };

        const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await mergeLocalStorageToFirestore(user.uid);
                fetchCart(user.uid);
            } else {
                setCart([]);
                localStorage.removeItem("cart"); // Clear local storage on logout
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
            authUnsubscribe();
        };
    }, []);

  
    
    const addToCart = async (product) => {
        const user = auth.currentUser;
    
        if (user) {
            const userId = user.uid;
            const productRef = doc(database, `users/${userId}/cart`, product.id);
    
            try {
                const productSnapshot = await getDoc(productRef);
                if (productSnapshot.exists()) {
                    // If product exists, increment quantity
                    await updateDoc(productRef, {
                        quantity: increment(1),
                    });
                } else {
                    // If product does not exist, add it with quantity 1
                    await setDoc(productRef, { ...product, quantity: 1 }, { merge: true });
                }
            } catch (error) {
                console.error("Error updating cart:", error);
            }
        } else {
            const localCart = JSON.parse(localStorage.getItem("cart")) || [];
            const existingProductIndex = localCart.findIndex((item) => item.id === product.id);
    
            if (existingProductIndex > -1) {
                // If product exists, increment quantity
                localCart[existingProductIndex].quantity += 1;
            } else {
                // If product does not exist, add with quantity 1
                localCart.push({ ...product, quantity: 1 });
            }
    
            localStorage.setItem("cart", JSON.stringify(localCart));
            setCart([...localCart]);
        }
    };
    
    
    const updateQuantity = async (productId, change) => {
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            const productRef = doc(database, `users/${userId}/cart`, productId);
    
            try {
                const productSnapshot = await getDoc(productRef);
                if (productSnapshot.exists()) {
                    const currentQuantity = productSnapshot.data().quantity || 1;
                    if (currentQuantity + change > 0) {
                        await updateDoc(productRef, {
                            quantity: increment(change),
                        });
                    }
                }
            } catch (error) {
                console.error("Error updating quantity:", error);
            }
        } else {
            let localCart = JSON.parse(localStorage.getItem("cart")) || [];
            const itemIndex = localCart.findIndex((item) => item.id === productId);
    
            if (itemIndex !== -1) {
                localCart[itemIndex].quantity = Math.max(1, localCart[itemIndex].quantity + change);
            }
    
            localStorage.setItem("cart", JSON.stringify(localCart));
            setCart([...localCart]);
        }
    };
    
  
    const removeFromCart = async (productId) => {
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            const productRef = doc(database, `users/${userId}/cart`, productId);

            try {
                await deleteDoc(productRef);
            } catch (error) {
                console.error("Error removing product:", error);
            }
        } else {
            let localCart = JSON.parse(localStorage.getItem("cart")) || [];
            localCart = localCart.filter((item) => item.id !== productId);
            localStorage.setItem("cart", JSON.stringify(localCart));
            setCart([...localCart]);
        }
    };

    const getTotalWeight = (weightString, quantity) => {
    if (!weightString || !quantity) return '0';

    const unit = weightString.replace(/[0-9.]/g, '').toLowerCase(); // g, kg, ml, or l
    const value = parseFloat(weightString);

    if (isNaN(value)) return '0';

    let weightInGramsOrMl;

    if (unit === 'kg') {
        weightInGramsOrMl = value * 1000;
    } else if (unit === 'g') {
        weightInGramsOrMl = value;
    } else if (unit === 'l') {
        weightInGramsOrMl = value * 1000; // convert to ml
    } else if (unit === 'ml') {
        weightInGramsOrMl = value;
    } else {
        return '0'; 
    }

    const total = weightInGramsOrMl * quantity;

    if (unit === 'g' || unit === 'kg') {
        return total >= 1000 ? `${(total / 1000).toFixed(2)}kg` : `${total}g`;
    } else {
        return total >= 1000 ? `${(total / 1000).toFixed(2)}l` : `${total}ml`;
    }
};

 const getCartTotalWeight = (cartItems) => {
    let totalGrams = 0;
    let totalMilliliters = 0;

    cartItems.forEach(item => {
        if (!item.weight || !item.quantity) return;

        const unit = item.weight.replace(/[0-9.]/g, '').toLowerCase(); // Extract unit (g/kg/ml/l)
        const value = parseFloat(item.weight); // Extract numeric value
        if (isNaN(value)) return;

        if (unit === 'kg') {
            totalGrams += value * 1000 * item.quantity;
        } else if (unit === 'g') {
            totalGrams += value * item.quantity;
        } else if (unit === 'l') {
            totalMilliliters += value * 1000 * item.quantity;
        } else if (unit === 'ml') {
            totalMilliliters += value * item.quantity;
        }
    });

    const weightString = totalGrams >= 1000
        ? `${(totalGrams / 1000).toFixed(2)}kg`
        : `${totalGrams}g`;

    const volumeString = totalMilliliters >= 1000
        ? `${(totalMilliliters / 1000).toFixed(2)}l`
        : `${totalMilliliters}ml`;

    if (totalGrams > 0 && totalMilliliters > 0) {
        return `${weightString} + ${volumeString}`;
    } else if (totalGrams > 0) {
        return weightString;
    } else if (totalMilliliters > 0) {
        return volumeString;
    } else {
        return '0';
    }
};

    
    return (
        <CartContext.Provider value={{ cart, addToCart,updateQuantity, removeFromCart,getTotalWeight,getCartTotalWeight }}>
            {children}
        </CartContext.Provider>
    );
};
