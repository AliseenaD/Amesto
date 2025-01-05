import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthToken } from "./AuthTokenContext";
import { getAllCart } from "./utility/shoppingCartApi";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
    const [cartCount, setCartCount] = useState(0);
    const { isAuthenticated } = useAuth0();
    const { accessToken } = useAuthToken();

    // Update the cart count
    const updateCartCount = (count) => {
        setCartCount(count);
    } 

    // Increment cart
    const incrementCart = () => {
        setCartCount(prev => prev + 1);
    }

    // Decrement cart
    const decrementCart = () => {
        setCartCount(prev => prev - 1);
    }

    // Refresh the cart count based off of api call to set to the number of items
    async function refreshCartCount() {
        if (isAuthenticated && accessToken) {
            try {
                const cartData = await getAllCart(accessToken);
                const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(totalItems);
            }
            catch (error) {
                console.error("Failed to get cart count:", error);
            }
        }
    }

    // Initial cart count fetch when user authenticates
    useEffect(() => {
        if (isAuthenticated) {
            refreshCartCount();
        }
        else {
            setCartCount(0);
        }
    }, [accessToken]);

    return (
        <CartContext.Provider value={{
            cartCount,
            updateCartCount,
            incrementCart,
            decrementCart,
            refreshCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within CartProvider");
    }
    return context;
}