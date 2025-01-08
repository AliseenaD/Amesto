import React, { useEffect, useState } from "react";
import { CartContextType, CartItem } from "../../types/productTypes.ts";
import { useAuthToken } from "../../AuthTokenContext.js";
import { updateCartItem, deleteCartItem, getAllCart } from "../../utility/shoppingCartApi.js";
import Footer from "../elements/Footer.tsx";
import CartCard from "../elements/CartElements/CartCard.tsx";
import { submitOrder } from "../../utility/profileApi.js";
import { toast } from "react-toastify";
import { useCart } from "../../CartContext.js";

export default function Cart() {
    const [userCart, setUserCart] = useState<CartItem[]>([]);
    const { accessToken } = useAuthToken();
    const [totalCost, setTotalCost] = useState(0);
    const { updateCartCount } = useCart() as CartContextType;
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Get the cart upon change in access token
    useEffect(() => {
        getCart();
    }, [accessToken]);

    // Get the total cost and also change the cart count whenever user cart changes
    useEffect(() => {
        if (userCart) {
            getCost();
            // Update the cart count in context whenever cart changes
            const totalItems = userCart.reduce((sum, item) => sum + item.quantity, 0);
            updateCartCount(totalItems);
        }
    }, [userCart]);

    // Function to get the cart
    async function getCart() {
        setIsLoading(true);
        try {
            const cart = await getAllCart(accessToken);
            setUserCart(cart);
        }
        catch (error) {
            console.error("An error occurred while fetching cart:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Function to set the total cost
    function getCost() {
        const value = userCart.reduce((sum, item) => sum + item.quantity * Number(item.variant.price), 0);
        setTotalCost(value);
    }

    // Function to update a cart item when incremented on the individual product level
    async function updateCart(cartId: number, newQuantity: number) {
        try {
            const response = await updateCartItem(cartId, newQuantity, accessToken);
            // If response successful then update cart locally to match
            if (response!.success) {
                setUserCart(prevCart => prevCart.map(item => Number(item.id) === cartId ? 
                    { ...item, quantity: newQuantity } : item));
                getCost();
            } 
        }
        catch (error) {
            console.error("Error updating cart:", error)
        }
    }

    // Function to delete a cart product
    async function deleteCartProduct(cartId: number) {
        try {
            const response = await deleteCartItem(cartId, accessToken)
            if (response!.success) {
                setUserCart(prevCart => prevCart.filter(item => 
                    Number(item.id) !== cartId
                ));
            }
        }
        catch (error) {
            console.error('Error while deleting item from cart:', error);
        }
    }

    // Function that orders all of the cart items
    async function orderCart() {
        try {
            const result = await submitOrder(accessToken);
            if (result && result.success) {
                toast.success("Successfully submitted all items to cart");
                setUserCart([]);
                setTotalCost(0);
                updateCartCount(0);
            }
            else {
                // Notify user if it was a stock number issue
                if (result!.error.includes("Not enough in stock")) {
                    toast.error(result?.error || 'Not enough in stock');
                }
                else {
                    toast.error("Items were not submitted to cart");
                }
            }
        }
        catch (error) {
            console.error('Error while deleting item from cart:', error);
        }
    }

    return (
        <>
            <CartCard products={userCart} isLoading={isLoading} orderCart={orderCart} updateCartItem={updateCart} totalCost={totalCost} deleteCartItem={deleteCartProduct} />
            <Footer />
        </>
    )
}