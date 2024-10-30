import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { IoClose } from "react-icons/io5";
import { TiShoppingCart } from "react-icons/ti";
import '../styles/elementStyles.css';
import { Fade } from "react-awesome-reveal";
import { useAuth0 } from "@auth0/auth0-react";
import { addToCart } from "../../utility/shoppingCartApi";
import { useAuthToken } from "../../AuthTokenContext";
import { toast } from 'react-toastify';
import numeral from 'numeral';

export default function ProductModal({ product, variants, handleClose }) {
    const { loginWithRedirect, isAuthenticated } = useAuth0();
    const [selectedVariant, setSelectedVariant] = useState(variants[0]);
    const { accessToken } = useAuthToken();
    
    // Ensure you cannot scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    });

    // Handle text for the countries 
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
                <p className="preview-product-title" id="modal-title">{product.brand} {title}</p>
                <p className="preview-product-country" id="modal-country">{country}</p>
            </div>
        );
    }

    // Function that will handle the shopping cart button
    async function addProduct() {
        // If not isAunthenticated redirect to login
        if (!isAuthenticated) {
            loginWithRedirect();
        }
        else if (selectedVariant.quantity >= 1) {
            await addToCart(product.id, selectedVariant.id, 1, accessToken);
            toast.success("محصول به سبد خرید اضافه شد");
        }
    }

    // Formats the cost to be more readable
    function formatNumber(price: number) {
        const formattedNumber = numeral(price).format('0,0');
        return formattedNumber;
    }

    return ReactDOM.createPortal(
        <div className="product-info-container"> 
            <IoClose className="product-exit" size={40} onClick={handleClose} />
            <Fade className="fade" triggerOnce direction="up">
                <div className="product-info-box">
                    <div className="product-info-description">
                        <div className="product-info-image">
                            <img src={product.picture} alt={product.model}></img>
                        </div>
                        {handleCountry()}
                        {product.type === 'Speaker' ? <br></br> : ''}
                        { product.storage ? <p id="product-storage">{product.storage}GB</p> : '' }
                        <div className="variant-pricing">
                            <div className="variant-list">
                                <p id="product-color">رنگ ها:</p>
                                {
                                    variants.map((variant) => (
                                        <div key={variant.id} className={`variant-color ${selectedVariant === variant ? ' selected' : ''}`} onClick={() => setSelectedVariant(variant)}>
                                            <div className="color-square" style={{backgroundColor: `${variant.color}`}}></div>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="product-price">
                                <p id="product-color">قیمت:</p>
                                <p id="product-price">{formatNumber(selectedVariant.price)}</p>
                            </div>
                        </div>
                        <button className={`cart-button ${selectedVariant.quantity >= 1 && isAuthenticated ? '' : 'unavailable'}`} onClick={addProduct}>
                            {isAuthenticated ? (
                            <div className="modal-button-text">
                                <TiShoppingCart size={20} />
                                <p> به سبد خرید اضافه کنید</p>
                            </div>
                           ) 
                           : 'برای افزودن به سبد خرید وارد شوید'}
                        </button>
                    </div>
                </div>
            </Fade>
        </div>, document.body
    ); 
}