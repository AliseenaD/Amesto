import React from "react";
import { MdDelete } from "react-icons/md";
import '../styles/elementStyles.css';
import { Variants } from "../../types/productTypes";

export default function CartProduct({ product }) {

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
            <>
                <p>{product.productId.brand} {title}</p>
                <p>{country}</p>
            </>
        );
    }
    console.log(product);

    return (
        <div className="cart-product-content">
            <img src={product.productId.picture} alt={product.productId.model} width={100}></img>
            {fixCountry()}
            <div className="price-section">
                <p>Each</p>
                <p id="cart-product-price">{product.price}</p>
            </div>
        </div>
    );
}