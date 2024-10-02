import React from "react";
import '../styles/cartStyles.css';
import { CartListType } from "../../types/productTypes";
import CartProduct from "./CartProduct.tsx";
import { Fade } from "react-awesome-reveal";

export default function CartList({ products, updateCartItem, deleteCartItem, totalCost }: CartListType) {

    if (products.length === 0) {
        return (
            <Fade triggerOnce direction="up">
                <div className="empty-cart-message">
                    <p>چیزی در سبد خرید شما وجود ندارد</p>
                </div>
            </Fade>
        );
    }
    else {
        return (
            <Fade triggerOnce direction="up">
                <div className="cart-content">
                    {products && products.map((item) => (
                        <CartProduct key={item._id} product={item} updateCartItem={updateCartItem} deleteCartItem={deleteCartItem} />
                    ))}
                </div>
                <div className="total-container">
                    <hr className="cost-line"></hr>
                    <div className="cart-info">
                        <div className="cart-cost-info">
                            <p id="total-cost-label">ارزش</p>
                            <p id="total-quantity">تداد</p>
                        </div>
                        <p id="total-cost-label">{totalCost} ریال</p>
                    </div>
                    <button className="checkout-button">تسویه حساب</button>
                </div>
            </Fade>
        );
    }
}