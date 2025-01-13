import React, { useState } from "react";
import "../styles/productPages.css";
import { ProductCardProps } from "../../types/productTypes";
import ProductModal from "./ProductModal.tsx";
import numeral from 'numeral';

export default function ProductPageCard({ product, displayStorage, displayColor }: ProductCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Handle the closing of the product information card
    function handleCardClose() {
        setIsModalOpen(false);
    }

    // Handle the opening of the card when clicked 
    function handleCardOpen() {
        setIsModalOpen(true);
    }

    // Checks to see if the product is new (created within the past month)
    function checkNew(dateString: string): boolean {
        const currentDate = new Date();
        const created = new Date(dateString);

        // Calculate difference in milliseconds
        const diffTime = currentDate.getTime() - created.getTime();

        // Convert to days
        const diffDays = diffTime / (1000*60*60*24);
        return diffDays <= 30;
    }

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
            <div className="product-card-title-country">
                <p className="product-card-model">{title}</p>
                <p className="product-card-country">{country}</p>
            </div>
        );
    }

    // Formats the cost to be more readable
    function formatNumber(price: number) {
        const formattedNumber = numeral(price).format('0,0');
        return formattedNumber;
    }

    // Convert number to farsi
    const toPersianNumbers = (value: number) => {
        const valueNum = formatNumber(Number(value));
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

        return valueNum.toString().replace(/[0-9.]/g, c => persianNumbers[c] || c);
    }

    const handleDisplays = () => {
        if (displayColor && displayStorage) {
            return (
                <>
                    <div className="product-card-color-storage">
                        <div className="product-card-color-container">
                            { product.variants.map((prod) => (
                                <div className="color-circle" key={prod.id} style={{backgroundColor: `${prod.color}`}}></div>
                            )) }
                        </div>
                        <div className="product-card-storage">
                            <p className="product-card-country">{product.storage}GB</p>
                        </div>
                    </div>
                    <div className="product-card-price">
                        <p className="price-value">{toPersianNumbers(product.max_price)}</p>
                        <p className="price-unit">ریال</p>
                    </div>
                </>
                
            );
        }
        if (displayColor && !displayStorage) {
            return (
                <div className="product-card-color-price">
                    <div className="product-card-color-container">
                        { product.variants.map((prod) => (
                            <div className="color-circle" key={prod.id} style={{backgroundColor: `${prod.color}`}}></div>
                        )) }
                    </div>
                    <div className="product-card-display-price">
                        <p className="price-value">{toPersianNumbers(product.max_price)}</p>
                        <p className="price-unit">ریال</p>
                    </div>
                </div>
            );
        }
        else {
            return (
                <div className="product-card-price">
                    <p className="price-value">{toPersianNumbers(product.max_price)}</p>
                    <p className="price-unit">ریال</p>
                </div>
            );
        }
    }

    return (
        <>
            <div className="product-card-container" onClick={handleCardOpen}>
                <img src={product.picture} alt={product.model}></img>
                <div className="product-card-title">
                    <p className="product-card-brand">{product.brand}</p>
                    {checkNew(product.created_at) ? (<div className="product-new-box">جدید</div>) : ''}
                </div>
                {handleCountry()}
                {handleDisplays()}
            </div>
            {isModalOpen && (
                <ProductModal product={product} variants={product.variants} handleClose={handleCardClose} />
            )}
        </>
        
    );
}