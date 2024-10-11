import React, { useEffect, useState } from "react";
import '../../styles/adminStyles.css';
import { Product } from "../../../types/productTypes";
import { getOrders } from "../../../utility/OrderHistoryApi";
import { useAuthToken } from "../../../AuthTokenContext";

export default function OrderStatus() {
    const { accessToken } = useAuthToken()
    const [orders, setOrders] = useState<Product[]>([]);

    // Fetch products on the page load
    useEffect(() => {
        fetchOrders();
    }, []);

    // Get all of the products
    async function fetchOrders() {
        try {
            const results = await getOrders(accessToken);
            setOrders(results);
        }
        catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    console.log(orders);
    return (
        <p>Tets</p>
    );
}