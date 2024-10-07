import React, { useEffect, useState } from "react";
import NavBar from "../elements/NavBar.tsx";
import { CartItem, Product, Variants } from "../../types/productTypes.ts";
import { useAuthToken } from "../../AuthTokenContext.js";
import { updateCartItem, deleteCartItem, getAllCart } from "../../utility/shoppingCartApi.js";
import Footer from "../elements/Footer.tsx";
import CartList from "../elements/CartList.tsx";

export default function Cart() {
    const [userCart, setUserCart] = useState<CartItem[]>([]);
    const { accessToken } = useAuthToken();
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => {
        getCart();
    }, [accessToken]);

    useEffect(() => {
        if (userCart) {
            getCost();
        }
    }, [userCart]);

    // Function to get the cart
    async function getCart() {
        const cart = await getAllCart(accessToken);
        setUserCart(cart);
    }

    // Function to set the total cost
    function getCost() {
        const value = userCart.reduce((sum, item) => sum + item.quantity * Number(item.variant.price), 0);
        setTotalCost(value);
    }

    // Function to update a cart item when incremente on the individual product level
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

    return (
        <>
            <NavBar />
            <CartList products={userCart} updateCartItem={updateCart} totalCost={totalCost} deleteCartItem={deleteCartProduct} />
            <Footer />
        </>
    )
}