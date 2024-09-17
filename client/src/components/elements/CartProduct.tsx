import React from "react";
import { CiCircleRemove } from "react-icons/ci";
import '../styles/elementStyles.css';
import { Fade } from "react-awesome-reveal";

export default function CartProduct({ product, updateCartItem, deleteCartItem }) {

    // Correct the name of models
    function fixCountry() {
        let country = '';
        let title = product.productId.model;
        if (product.productId.model.toLowerCase().includes('vit')) {
            country = 'Vietnam';
            title = product.productId.model.replace(/vit/i, '').trim();
        }
        else if (product.productId.model.toLowerCase().includes('ind')) {
            country = 'India';
            title = product.productId.model.replace(/ind/i, '').trim();
        }
        return (
            <div className="cart-product-info">
                <p className="cart-label">{product.productId.brand}</p>
                <p className="cart-label">{title}</p>
                <p className="cart-specifics">{country}</p>
                {product.productId.storage ? <p className="cart-specifics">{product.productId.storage} GB</p> : ''}
                <div className="cart-color">
                    <p id="product-color">رنگ ها:</p>
                    <div className="color-square" id="cart-color-box" style={{backgroundColor: `${product.variantId.color}`}}></div>
                </div>
            </div>
        );
    }

    // Update the quantity of the product
    async function handleQuantityChange(amount: number) {
        const newQuantity = product.quantity + amount;
        if (newQuantity < 1 || newQuantity > product.variantId.quantity) {
            return;
        }
        try {
            updateCartItem(product.productId._id, product.variantId._id, newQuantity);
        }
        catch (error) {
            console.error('Failed to update qyantity:', error)
        }
    }

    return (
        <Fade triggerOnce direction="up">
            <div className="cart-product-content">
                <img src={product.productId.picture} alt={product.productId.model}></img>
                {fixCountry()}
                <div className="price-section">
                    <p className="cart-label">هر کدام</p>
                    <p className="cart-specifics">{product.variantId.price} ریال</p>
                </div>
                <div className="quantity-section">
                    <p className="cart-label">مقدار</p>
                    <div className="update-quantity">
                        <div className="value-increment" onClick={() => handleQuantityChange(-1)}>-</div>
                        <p className="cart-specifics">{product.quantity}</p>
                        <div className="value-increment" onClick={() => handleQuantityChange(1)}>+</div>
                    </div>
                </div>
                <div className="total-price">
                    <p className="cart-label">مجموع</p>
                    <p className="cart-specifics">{product.variantId.price * product.quantity} ریال</p>
                </div>
                <CiCircleRemove className="delete-item-logo" size={30} color="black" onClick={() => deleteCartItem(product.productId._id, product.variantId._id)} />
            </div>
        </Fade>
    );
}