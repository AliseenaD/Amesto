import React, { useEffect, useState } from "react";
import '../../../styles/profileStyles.css';
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
                        <p>{formatDate(order.order_date)}</p>
                    </div>
                    <div className="products-list-container">
                            <p>محصولات:</p>
                            <ul className="products-list">
                                {order.items.map(item => (
                                    <li>{item.product.brand} {item.product.model}</li>
                                ))}
                            </ul>
                    </div>
                </div>
                <div className="order-card-status">
                    <p className={`order-status ${order.order_status}`}>{order.order_status}</p>
                    <div className="order-price">
                        <p>ریال</p>
                        <p>{formatNumber(order.total_price)}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Fade triggerOnce direction="up">
            {
                orders ? (
            <div className="order-stats-content">
                <div className="account-summary">
                    <div className="info-header">
                        <IoIosStats size={40} /><p>خلاصه حساب</p>
                    </div>
                    <div className="total-orders-content">
                        <p className="order-stat-number" id="order-sum">{orders.length}</p>
                        <p className="order-stat-descriptor">کل سفارشات</p>
                    </div>
                    <div className="total-sum-content">
                        <div className="order-stat-number" id="total-sum">
                            <p>ریال</p>
                            <p>{formatNumber(totalCost)}</p>
                        </div>
                        <p className="order-stat-descriptor">کل هزینه شده</p>
                    </div>
                </div>
                <div className="order-summary">
                    <div className="info-header" id="order-history-header">
                            <FiPackage size={40} /><p>تاریخچه سفارش</p>
                    </div>
                    <div className="past-orders-content">
                        {orders.length > 0 ? (
                            orders.map(order => (
                                orderCard(order)
                            ))
                        ) : ''}
                    </div>
                </div>
            </div>
                ) : <p>Loading</p>
            }
        </Fade>
    );
}