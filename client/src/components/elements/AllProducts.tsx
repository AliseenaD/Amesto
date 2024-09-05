import React, { useEffect, useState } from "react";
import '../styles/elementStyles.css';
import { getProducts } from "../../utility/api";

export default function AllProducts() {
    const [products, setProducts] = useState([]);

    // Load products
    useEffect(() => {
        if (products.length === 0) {
            fetchProducts();
        }
    }, [])

    // Fetch all products in the database
    async function fetchProducts() {
        try {
            const prods = await getProducts();
            setProducts(prods);
        }
        catch (error) {
            console.error('Error fetching products', error);
        }
    }

    return (

        <p>Orod</p>
    );
}