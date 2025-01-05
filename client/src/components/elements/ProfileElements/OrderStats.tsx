import React, { useEffect, useState } from "react";
import '../../../components/styles/profileStyles.css';
import { Order, OrderProps } from "../../../types/productTypes";
import { Fade } from "react-awesome-reveal";
import numeral from 'numeral';
import { FiPackage } from "react-icons/fi";
import { IoIosStats } from "react-icons/io";
import { CiCalendar } from "react-icons/ci";

export default function OrderStats({ orders }: OrderProps) {
    const [totalCost, setTotalCost] = useState(0);
    console.log('Order stats:', orders);
    // Fetch the total cost of all orders
    useEffect(() => {
        if (orders && orders.length > 0) {
            calculateCosts();
        }
    }, [orders]);

    // A function that goes through and sums up all orders and costs
    function calculateCosts() {
        let sum = 0
        orders.forEach(order => sum += Number(order.total_price))
        setTotalCost(sum);
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };

    // Formats the cost to be more readable
    function formatNumber(price: number) {
        const formattedNumber = numeral(price).format('0,0');
        return formattedNumber;
    }

    // Returns basic card info for each order within the order history
    function orderCard(order: Order) {
        return (
            <div className="order-card-content" key={order.id}>
                <div className="order-card-info">
                    <p className="order-id">Order #{order.id}</p>
                    <div className="order-date">
                        <CiCalendar size={18} color="gray" />
                        <p>{convertDate(order.order_date)}</p>
                    </div>
                    <div className="products-list-container">
                        <p>محصولات:</p>
                        <ul className="products-list">
                            {order.items.map(item => (
                                <li key={item.product.id} className="product-list-item">
                                    <span className="product-quantity">
                                        {toPersianNumbers(item.quantity)} x
                                    </span>
                                    <div className="product-details">
                                        <span className="product-name">
                                            {item.product.brand} {item.product.model}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="order-card-status">
                    <p className={`order-status ${order.order_status}`}>{order.order_status}</p>
                    <div className="order-price">
                        <p>ریال</p>
                        <p>{toPersianNumbers(formatNumber(order.total_price))}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Function to convert date to Persian date time
    function convertDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('fa-IR', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
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
            {
                orders ? (
            <div className="order-stats-content">
                <div className="account-summary">
                    <div className="info-header">
                        <p>خلاصه حساب</p><IoIosStats size={40} />
                    </div>
                    <div className="total-orders-content">
                        <p className="order-stat-number" id="order-sum">{orders.length}</p>
                        <p className="order-stat-descriptor">کل سفارشات</p>
                    </div>
                    <div className="total-sum-content">
                        <div className="order-stat-number" id="total-sum">
                            <p>{toPersianNumbers(formatNumber(totalCost))}</p>
                            <p>ریال</p>
                        </div>
                        <p className="order-stat-descriptor">کل هزینه شده</p>
                    </div>
                </div>
                <div className="order-summary">
                    <div className="info-header" id="order-history-header">
                        <p>تاریخچه سفارش</p><FiPackage size={40} />
                    </div>
                    <div className="past-orders-content">
                        {orders.length > 0 ? (
                            orders.map(order => (
                                orderCard(order)
                            ))
                        ) : <p style={{textAlign: 'center'}}>شما چیزی سفارش نداده اید</p>}
                    </div>
                </div>
            </div>
                ) : <p>Loading</p>
            }
        </Fade>
    );
}