import React, { useEffect, useState } from "react";
import '../../styles/adminStyles.css';
import { getProducts } from "../../../utility/productsApi.js";
import { Product, ProductDictionary } from "../../../types/productTypes.ts";
import { Fade } from "react-awesome-reveal";
import EditIndividualProduct from "./EditIndividualProduct.tsx";
import { IoClose, IoSearch } from "react-icons/io5";

export default function EditProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isSearched, setIsSearched] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchedProducts, setSearchedProducts] = useState<Product[]>([]);

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
    function filterTypes(prods: Product[]): ProductDictionary {
        let dictionary: ProductDictionary = {};
        prods.forEach(prod => {
            if (!dictionary[prod.type]) {
                dictionary[prod.type] = [prod];
            }
            else {
                dictionary[prod.type].push(prod);
            }
        });
        return dictionary;
    }

    // Function to handle the delete functionality of the search bar
    function handleDelete() {
        setIsSearched(false);
        setSearchText('');
        setTimeout(() => {
            setSearchedProducts([]);
        }, 400);
    }

    // Function to search through and filter products for what has been searched for
    function searchProducts() {
        setIsSearched(true);
        const searchedProds = products.filter(
            (product) => product.brand.toLowerCase().includes(searchText.toLowerCase()) || 
            product.model.toLowerCase().includes(searchText.toLowerCase()) ||
            product.type.toLowerCase().includes(searchText.toLowerCase())
        );
        setSearchedProducts(searchedProds);
    }

    // Function to update the search text
    function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
        setSearchText(e.target.value);
        // If all chars cleared then clear search
        if (e.target.value === '') {
            handleDelete();
        }
    }

    // Function to handle enter press for searching
    function handleEnterPress(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key == 'Enter') {
            searchProducts();
        }
    }

    // Pass dictionary of types in to return list of all prods
    function displayProducts(dictionary: ProductDictionary) {
        return (
            <>
                {Object.entries(dictionary).map(([type, products]) => (
                    <div key={type} className="product-type">
                        <h2>{type.charAt(0).toUpperCase() + type.slice(1)}s</h2>
                        {products.map(product => (
                            <EditIndividualProduct key={product.id} product={product} />
                        ))}
                    </div>
                ))} 
            </>
        );
    }

    return (
        <Fade triggerOnce>
            <div className="edit-product-content">
                <div className="search-bar">
                    { isSearched ? <IoClose className="search-icon-edit" size={30} onClick={handleDelete}></IoClose> : <IoSearch className="search-icon-edit" size={30} onClick={searchProducts}></IoSearch> }
                    <input type="text" id="product-search" placeholder="Search Products" value={searchText} onChange={handleSearch} onKeyDown={handleEnterPress}></input>   
                </div>
                <div className="edit-product-landing">
                    { products.length > 0 && !isSearched ? displayProducts(filterTypes(products)) : 
                    isSearched && searchedProducts.length > 0 ? displayProducts(filterTypes(searchedProducts)) :
                    <p>No products found</p> }
                </div>
            </div>
        </Fade>
    );
}