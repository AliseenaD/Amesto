import React, { useEffect, useState } from "react";
import { getVariants } from "../../utility/api";
import '../styles/elementStyles.css';
import ProductModal from "./ProductModal.tsx";
import { Variants } from "../../types/productTypes.ts";

export default function ProductCardPreview({ product, displayStorage }) {
    const [variantColors, setVariantColors] = useState<string[]>([]); // For the colors
    const [prodVariants, setProdVariants] = useState<Variants[]>([]); // For the variants to pass to product info
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Retrieve the variants every time products loads
    useEffect(() => {
        fetchVariants()
    }, [product]);

    // Alter name to provide name of country outside of title if present
    function handleCountry() {
        let country = '';
        let title = product.model;
        if (product.model.toLowerCase().includes('vit')) {
            country = 'Vietnam';
            title = product.model.replace(/vit/i, '').trim();
        }
        else if (product.model.toLowerCase().includes('ind')) {
            country = 'India';
            title = product.model.replace(/ind/i, '').trim();
        }

        return (
            <div className="title-country">
                <p className="preview-product-title">{title}</p>
                <p className="preview-product-country">{country}</p>
            </div>
        );
    }

    // Get all the variants of the product
    async function fetchVariants() {
        const variants = await getVariants(product);
        setProdVariants(variants);
        const colors = variants.map((variant) => variant.color);
        setVariantColors(colors)
    }

    // Handle the closing of the product information card
    function handleCardClose() {
        setIsModalOpen(false);
    }

    // Handle the opening of the card when clicked 
    function handleCardOpen() {
        setIsModalOpen(true);
    }

    return (
        <>
            <div className="preview-card-content" onClick={handleCardOpen}>
                <img className="preview-picture" style={product.type === 'Phone' ? {height: '300px'} : {height: '150px'}} src={product.picture} alt={product.model}></img>
                <div className="preview-info">
                    <p className="preview-product-brand">{product.brand}</p>
                    { handleCountry() }
                    { 
                        variantColors ? (
                            <div className="color-storage">
                                <div className="color-container">
                                    { variantColors.map((color) => (
                                        <div className="color-circle" key={color} style={{backgroundColor: `${color}`}}></div>
                                    )) }
                                </div>
                                { displayStorage ? <p className="preview-product-country" id="storage-text">{product.storage}GB</p> : '' }
                            </div>
                        ) : '' 
                    }
                </div>
            </div>
            {isModalOpen && (
                <ProductModal product={product} variants={prodVariants} handleClose={handleCardClose} />
            )}
        </>
    );
}