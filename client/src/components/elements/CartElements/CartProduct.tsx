import React from "react";
import "../../../components/styles/cartStyles.css";
import { CartProductType } from "../../../types/productTypes";
import { IoTrashOutline } from "react-icons/io5";
import { IoIosAdd } from "react-icons/io";
import { IoIosRemove } from "react-icons/io";
import numeral from 'numeral';

export default function CartProduct({ product, updateCartItem, deleteCartItem }: CartProductType) {

    // Update the quantity of the product
    async function handleQuantityChange(amount: number) {
        const newQuantity = product.quantity + amount;
        if (newQuantity < 1 || newQuantity > product.variant.quantity) {
            return;
        }
        try {
            updateCartItem(Number(product.id), newQuantity);
        }
        catch (error) {
            console.error('Failed to update quantity:', error)
        }
    }

    // Formats the cost to be more readable
    function formatNumber(price: number) {
        const formattedNumber = numeral(price).format('0,0');
        return formattedNumber;
    }

    // Function to handle the title and writing portion of the card
    function handleInfo() {
        // Edit the country from model if needed
        let title = product.product.model;
        let country = '';
        if (product.product.model.toLowerCase().includes('vit')) {
            country = 'Vietnam';
            title = product.product.model.replace(/vit/i, '').trim();
        }
        else if (product.product.model.toLowerCase().includes('ind')) {
            country = 'India';
            title = product.product.model.replace(/ind/i, '').trim();
        }

        return (
            <div className="cart-item-information">
                <div className="cart-header">{product.product.brand}</div>
                <div className="cart-header">{title}</div>
                { country ? (<div className="cart-specifics">{country}</div>) : '' }
                { product.product.storage ? (<div className="cart-specifics">{product.product.storage} GB</div>) : '' } 
                <div className="cart-specifics" id="cart-color">
                    رنگ:
                    <div className="cart-color-square" style={{backgroundColor: `${product.variant.color}`}}></div>
                </div>
                <div className="item-cost">
                    <p>{toPersianNumbers(formatNumber(Number(product.variant.price)))}</p>
                </div>
            </div>
        );
    }

    // Convert number to farsi
    const toPersianNumbers = (value: number) => {
        const persianNumbers = {
            '0': '۰',
            '1': '۱',
            '2': '۲',
            '3': '۳',
            '4': '۴',
            '5': '۵',
            '6': '۶',
            '7': '۷',
            '8': '۸',
            '9': '۹',
            '.': '.'
        };

        return value.toString().replace(/[0-9.]/g, c => persianNumbers[c] || c);
    }

    return (
        <div className="cart-product-content">
            <div className="info-picture">
                <img className="cart-picture" alt={product.product.id} src={product.product.picture} width={150} />
                {handleInfo()}
            </div>
            <div className="quantity-section">
                <div className="quantity-button" id="decrease-button" onClick={() => handleQuantityChange(-1)}><IoIosRemove color="black" size={20} /></div>
                <div className="quantity-container">
                    {product.quantity}
                </div>
                <div className="quantity-button" id="increase-button" onClick={() => handleQuantityChange(1)}><IoIosAdd color="black" size={20} /></div>
            </div>
            <button className="delete-cart-item" onClick={() => deleteCartItem(Number(product.id))}><IoTrashOutline size={30} color="red" /></button>
        </div>
    );
}