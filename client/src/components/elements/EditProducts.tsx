import React, { useEffect, useState } from "react";
import '../styles/AdminStyles.css';
import { getProducts } from "../../utility/productsApi";
import { Product, ProductDictionary } from "../../types/productTypes";
import { Fade } from "react-awesome-reveal";
import EditIndividualProduct from "./EditIndividualProduct.tsx";

export default function EditProducts() {
    const [products, setProducts] = useState<Product[]>([]);

    // Fetch all of the products on page load
    useEffect(() => {
        fetchProducts();
    }, []);

    // Fetch all the products
    async function fetchProducts() {
        try {
            const prods = await getProducts();
            setProducts(prods);
        }
        catch (error) {
            console.error('Error retrieving products', error);
        }
    }

    // Filter by types of products (phone or speaker)
    function filterTypes(): ProductDictionary {
        let dictionary: ProductDictionary = {};
        products.forEach(prod => {
            if (!dictionary[prod.type]) {
                dictionary[prod.type] = [prod];
            }
            else {
                dictionary[prod.type].push(prod);
            }
        });
        return dictionary;
    }

    // Pass dictionary of types in to return list of all prods
    function displayProducts(dictionary: ProductDictionary) {
        return (
            <>
                {Object.entries(dictionary).map(([type, products]) => (
                    <div key={type} className="product-type">
                        <h2>{type.charAt(0).toUpperCase() + type.slice(1)}s</h2>
                        {products.map(product => (
                            <EditIndividualProduct product={product} />
                        ))}
                    </div>
                ))} 
            </>
        );
    }

    return (
        <Fade triggerOnce>
            <div className="edit-product-landing">
                {displayProducts(filterTypes())}
            </div>
        </Fade>
    );
}