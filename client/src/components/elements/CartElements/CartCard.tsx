import React from "react";
import '../../styles/cartStyles.css';
import { CartListType } from "../../../types/productTypes.ts";
import CartProduct from "./CartProduct.tsx";
import { TiShoppingCart } from "react-icons/ti";
import { Fade } from "react-awesome-reveal";
import numeral from 'numeral';


export default function CartList({ products, updateCartItem, deleteCartItem, orderCart, totalCost }: CartListType) {

    // Formats the cost to be more readable
    function formatNumber(price: number) {
        const formattedNumber = numeral(price).format('0,0');
        return formattedNumber;
    }

    return (
        <Fade triggerOnce direction="up">
            <div className="cart-card-content">
                <div className="cart-card-header">
                    <TiShoppingCart size={40} />
                    <p>AMESTO Cart</p>
                </div>
                <div className="cart-card-list">
                    {products.length > 0 ? products.map(prod => (
                        <>
                            <CartProduct key={prod.id} product={prod} updateCartItem={updateCartItem} deleteCartItem={deleteCartItem} />
                            { products.indexOf(prod) === products.length - 1 ? '' : <hr className="product-divider" /> }
                        </>
                    )) : <p style={{textAlign: 'center'}}>No current items in your cart!</p>}
                </div>
                <div className="checkout-section">
                    <div className="total-section">
                        <p id="total-label">مجموع:</p>
                        <div className="total-cost">
                            <p>ریال</p>
                            <p>
                                {formatNumber(totalCost)}
                            </p>
                        </div>
                    </div>
                    <button className="checkout-button" onClick={orderCart}>پرداخت</button>
                </div>
            </div>
        </Fade>
    );
}