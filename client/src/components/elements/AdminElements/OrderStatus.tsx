import React, { useEffect, useState } from "react";
import '../../styles/adminStyles.css';
import { Order } from "../../../types/productTypes";
import { getOrders, updateStatus } from "../../../utility/OrderHistoryApi";
import { useAuthToken } from "../../../AuthTokenContext";
import { toast } from 'react-toastify';

export default function OrderStatus() {
    const { accessToken } = useAuthToken()
    const [orders, setOrders] = useState<Order[]>([]);
    const [status, setStatus] = useState('All');
    const [selectedOrders, setSelectedOrders] = useState<Order[]>([])

    // Fetch products on the page load
    useEffect(() => {
        fetchOrders();
    }, []);

    // Sets the selected orders to whatever the status selected is
    useEffect(() => {
        if (status === 'All') {
            setSelectedOrders(orders);
        }
        else {
            const filteredOrders = orders.filter((order) => order.order_status.toLowerCase() === status.toLowerCase());
            setSelectedOrders(filteredOrders);
        }
    }, [status]);

    // Get all of the orders
    async function fetchOrders() {
        try {
            const results = await getOrders(accessToken);
            setOrders(results);
            setSelectedOrders(results); // Set selected orders to full list of orders initially
        }
        catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    // Function that formats the date correctly
    function formatDate(dateTime: string) {
        const date = new Date(dateTime);
        return date.toISOString().split('T')[0];
    }

    // Function that sets the order status upon button click
    async function handleOrderStatusPress(order: Order) {
        const newStatus = order.order_status === 'Pending' ? 'Processed' : 'Pending';
        try {
            const result = await updateStatus(accessToken, newStatus, order.id);
            if (result?.success) {
                // Update the list locally
                const updatedOrders = orders.map(item => item.id === order.id ? {...item, order_status: newStatus} : item);
                setOrders(updatedOrders);

                // Now update the selected orders
                if (status === 'All') {
                    setSelectedOrders(updatedOrders);
                }
                else {
                    const filteredOrders = updatedOrders.filter(item => item.order_status.toLowerCase() === status.toLowerCase());
                    setSelectedOrders(filteredOrders);
                }
            }
        }
        catch (error) {
            toast.error('وضعیت سفارش به روز نمی شود');
            console.error('Error updating order status', error);
        }
    }

    const filterOptions = ['All', 'Processed', 'Pending'];

    return (
        <>
            <div className="order-filtering-options">
                <ul className="filtering-list">
                    {filterOptions.map(item => (
                        <li key={item} onClick={()=>setStatus(item)} className={`filter-item ${item === status ? ' filter-selected': ''}`}>{item}</li>
                    ))}
                </ul>
            </div>
            <div className="order-status-content">
                {selectedOrders && selectedOrders.length > 0 ? (
                    selectedOrders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-header">
                        <h3 className="order-id">Order #{order.id}</h3>
                        <span className={`order-status ${order.order_status.toLowerCase()}`}>
                            {order.order_status}
                        </span>
                        </div>
                        <div className="order-details">
                        <p className="order-date">Ordered on: {formatDate(order.order_date)}</p>
                        <p className="order-email">Email: {order.order_email}</p>
                        </div>
                        <div className="order-items">
                        {order.items.map((item, index) => (
                            <div key={index} className="order-item">
                            <span className="item-brand">{item.product.brand}</span>
                            <span className="item-model">{item.product.model}</span>
                            <span className="item-color">{item.variant.color}</span>
                            <span className="item-quantity">Qty: {item.quantity}</span>
                            </div>
                        ))}
                        </div>
                        <div className="order-footer">
                            <button onClick={() => handleOrderStatusPress(order)} className="order-status-button">Update Status</button>
                            <p className="order-total">Total: {order.total_price}</p>
                        </div>
                    </div>
                    ))
                ) : (
                    <p className="no-orders">هیچ سفارشی انجام نشده است</p>
                )}
            </div>
        </>
    );
}