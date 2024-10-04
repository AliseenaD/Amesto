import React from "react";
import '../styles/cartStyles.css';
import { Fade } from "react-awesome-reveal";

export default function CartProduct({ product, updateCartItem, deleteCartItem }) {

    // Correct the name of models
    function fixCountry() {
        let country = '';
        let title = product.product.model;
        if (product.product.model.toLowerCase().includes('vit')) {
            country = 'Vietnam';
            title = product.product.model.replace(/vit/i, '').trim();
        }
        else if (product.product.model.toLowerCase().includes('ind')) {
            country = 'India';
            title = product.product.model.replace(/ind/i, '').trim();
        }
        return (
            <div className="cart-product-info">
                <p className="cart-label">{product.product.brand}</p>
                <p className="cart-label">{title}</p>
                <p className="cart-specifics">{country}</p>
                {product.product.storage ? <p className="cart-specifics">{product.product.storage} GB</p> : ''}
                <div className="cart-color">
                    <p id="product-color">رنگ ها:</p>
                    <div className="color-square" id="cart-color-box" style={{backgroundColor: `${product.variant.color}`}}></div>
                </div>
            </div>
        );
    }

    // Update the quantity of the product
    async function handleQuantityChange(amount: number) {
        const newQuantity = product.quantity + amount;
        if (newQuantity < 1 || newQuantity > product.variant.quantity) {
            return;
        }
        try {
            updateCartItem(product.product, product.variant, newQuantity);
        }
        catch (error) {
            console.error('Failed to update qyantity:', error)
        }
    }

    console.log(product)
    return (
        <Fade triggerOnce direction="up">
            <div className="cart-product-content">
                <img src={product.product.picture} alt={product.product.model}></img>
                {fixCountry()}
                <div className="price-section">
                    <p className="cart-label">قیمت</p>
                    <p className="cart-specifics">{product.variant.price} ریال</p>
                </div>
                <div className="quantity-section">
                    <p className="cart-label">تداد</p>
                    <div className="update-quantity">
                        <div className="value-increment" onClick={() => handleQuantityChange(-1)}>-</div>
                        <p className="cart-specifics">{product.quantity}</p>
                        <div className="value-increment" onClick={() => handleQuantityChange(1)}>+</div>
                    </div>
                </div>
                <div className="total-price">
                    <p className="cart-label">مجموع</p>
                    <p className="cart-specifics">{product.variant.price * product.quantity} ریال</p>
                </div>
                <button className="delete-item-logo" onClick={() => deleteCartItem(product.product.id, product.variant.id)}>حذف کنید</button>
            </div>
        </Fade>
    );
}