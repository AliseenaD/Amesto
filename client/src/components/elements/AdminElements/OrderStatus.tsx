import React, { useEffect, useState } from "react";
import "./adminStyles.css";
import { Order } from "../../../types/productTypes";
import { getOrders, getPendingOrders, getProcessedOrders, updateStatus } from "../../../utility/OrderHistoryApi";
import { useAuthToken } from "../../../AuthTokenContext";
import { toast } from 'react-toastify';
import numeral from 'numeral';
import { Fade } from "react-awesome-reveal";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import loadingGif from "../../../assets/Loading.webp";

export default function OrderStatus() {
    const { accessToken } = useAuthToken()
    const [orders, setOrders] = useState<Order[]>([]);
    const filterOptions = ['All', 'Processed', 'Pending'];
    const [status, setStatus] = useState<string>(filterOptions[0]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasNext, setHasNext] = useState<boolean>(true);
    const [hasPrevious, setHasPrevious] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    
    // Fetch orders on the page load
    useEffect(() => {
        fetchOrders();
    }, [page, status]);

    // Fetch the type of order depending on the current status
    async function fetchOrders() {
        switch (status) {
            case 'All':
                fetchAllOrders();
                break;
            case 'Processed':
                fetchProcessed();
                break;
            case 'Pending':
                fetchPending();
                break;
        }
    }

    // Get all of the orders
    async function fetchAllOrders() {
        setIsLoading(true);
        try {
            const result = await getOrders(accessToken, page);

            // Set pagination states
            if (!result.next) {
                setHasNext(false);
            }
            else {
                setHasNext(true);
            }
            if (!result.previous) {
                setHasPrevious(false);
            }
            else {
                setHasPrevious(true);
            }

            setOrders(result.results);
        }
        catch (error) {
            console.error("Error fetching orders:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Get orders that are pending
    async function fetchPending() {
        setIsLoading(true);
        try {
            const result = await getPendingOrders(accessToken, page);

            // Set pagination states
            if (!result.next) {
                setHasNext(false);
            }
            else {
                setHasNext(true);
            }
            if (!result.previous) {
                setHasPrevious(false);
            }
            else {
                setHasPrevious(true);
            }

            setOrders(result.results);
        }
        catch (error) {
            console.error("Error fetching orders:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Get orders that are processed
    async function fetchProcessed() {
        setIsLoading(true);
        try {
            const result = await getProcessedOrders(accessToken, page);

            // Set pagination states
            if (!result.next) {
                setHasNext(false);
            }
            else {
                setHasNext(true);
            }
            if (!result.previous) {
                setHasPrevious(false);
            }
            else {
                setHasPrevious(true);
            }

            setOrders(result.results);
        }
        catch (error) {
            console.error("Error fetching orders:", error);
        }
        finally {
            setIsLoading(false);
        }
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

    // Function that sets the order status upon button click
    async function handleOrderStatusPress(order: Order) {
        const newStatus = order.order_status === 'Pending' ? 'Processed' : 'Pending';
        try {
            const result = await updateStatus(accessToken, newStatus, order.id);
            if (result && result.success) {
                // Update the list locally
                const updatedOrders = orders.map(item => item.id === order.id ? {...item, order_status: newStatus} : item);
                // Filter by status if status is not 'All'
                if (status !== 'All') {
                    const filteredOrders = updatedOrders.filter(item => item.order_status === status);
                    setOrders(filteredOrders);
                }
                else {
                    setOrders(updatedOrders);
                }
            }
        }
        catch (error) {
            toast.error('وضعیت سفارش به روز نمی شود');
            console.error('Error updating order status', error);
        }
    }

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

    // Handle the button press for filtering orders
    function handleButtonPress(newStatus: string) {
        setStatus(newStatus);
        setPage(1);
    }

    // Handles the pagination when the page button is clicked
    function handlePageButtonPress(increment: number) {
        setPage(currPage => currPage + increment);
    }

    return (
        <Fade triggerOnce>
            <div className="filter-products-container">
                {filterOptions.map(item => (
                    <button key={item} className={`product-type-button ${status === item ? 'type-active' : ''}`} onClick={() => handleButtonPress(item)}>{item}</button>
                ))}
            </div>
            <div className="delete-news-container">
                <div className="order-grid">
                    {isLoading && (
                        <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                            <img alt="loading" src={loadingGif} style={{width: '150px', height: '150px', margin: '3rem'}}></img>
                        </div>
                    )}
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                            <h3 className="order-id">Order #{order.id}</h3>
                            <span className={`order-status ${order.order_status.toLowerCase()}`}>
                                {order.order_status}
                            </span>
                            </div>
                            <div className="order-details">
                            <p className="order-date">سفارش داده شد: {convertDate(order.order_date)}</p>
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
                                <button onClick={() => handleOrderStatusPress(order)} className="order-status-button">به روز رسانی وضعیت</button>
                                <p className="order-total">مجموع: {toPersianNumbers(formatNumber(order.total_price))}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="pagination-buttons-container">
                <button className="pagination-arrow" disabled={isLoading || !hasPrevious} onClick={() => handlePageButtonPress(-1)}><MdOutlineKeyboardArrowLeft size={20} /></button>
                <div className="pagination-indicator">{toPersianNumbers(page)}</div>
                <button className="pagination-arrow" disabled={isLoading || !hasNext} onClick={() => handlePageButtonPress(1)}><MdOutlineKeyboardArrowRight size={20} /></button>
            </div>
        </Fade>
    );
}

