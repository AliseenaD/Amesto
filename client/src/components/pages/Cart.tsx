import React, { useEffect, useState } from "react";
import NavBar from "../elements/NavBar.tsx";
import { Product } from "../../types/productTypes.ts";
import { useAuthToken } from "../../AuthTokenContext.js";
import { getAllCart } from "../../utility/api.js";
import Footer from "../elements/Footer.tsx";
import CartProduct from "../elements/CartProduct.tsx";
import { Fade } from "react-awesome-reveal";

export default function Cart() {
    const [userCart, setUserCart] = useState<Product[]>([]);
    const { accessToken } = useAuthToken();

    useEffect(() => {
        getCart();
    }, [accessToken]);

    // Function to get the cart
    async function getCart() {
        const cart = await getAllCart(accessToken);
        setUserCart(cart);
    }

    console.log(userCart);
    return (
        <>
            <NavBar />
            <Fade triggerOnce direction="up">
                <div className="cart-content">
                    {userCart && userCart.map((item) => (
                        <CartProduct product={item} />
                    ))}
                </div>
            </Fade>
            <Footer />
        </>
    )
}