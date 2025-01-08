import React from "react";
import "../../../components/styles/cartStyles.css";
import { CartListType } from "../../../types/productTypes.ts";
import CartProduct from "./CartProduct.tsx";
import { TiShoppingCart } from "react-icons/ti";
import { Fade } from "react-awesome-reveal";
import numeral from 'numeral';
import loadingGif from "../../../assets/Loading.webp";

export default function CartList({ products, isLoading, updateCartItem, deleteCartItem, orderCart, totalCost }: CartListType) {

    // Formats the cost to be more readable
    function formatNumber(price: number) {
        const formattedNumber = numeral(price).format('0,0');
        return formattedNumber;
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
        <Fade triggerOnce direction="up">
            <div className="cart-card-content">
                <div className="cart-card-header">
                    <TiShoppingCart size={40} />
                    <p>AMESTO Cart</p>
                </div>
                <div className="cart-card-list">
                    {isLoading ? (
                        <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                            <img alt="loading" src={loadingGif} style={{width: '150px', height: '150px', margin: '3rem'}}></img>
                        </div>
                    ) : 
                        <>
                            {products.length > 0 ? products.map(prod => (
                        <>
                            <CartProduct key={prod.id} product={prod} updateCartItem={updateCartItem} deleteCartItem={deleteCartItem} />
                            { products.indexOf(prod) === products.length - 1 ? '' : <hr className="product-divider" /> }
                        </>
                    )) : <p style={{textAlign: 'center', fontSize: '20px'}}>هیچ کالایی در سبد خرید شما وجود ندارد</p>}
                        </>
                    }
                </div>
                <div className="checkout-section">
                    <div className="total-section">
                        <p id="total-label">مجموع:</p>
                        <div className="total-cost">
                            <p>
                                {toPersianNumbers(formatNumber(totalCost))}
                            </p>
                            <p>ریال</p>
                        </div>
                    </div>
                    <button className="checkout-button" onClick={orderCart}>پرداخت</button>
                </div>
            </div>
        </Fade>
    );
}