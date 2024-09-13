import React, { useEffect, useState } from "react";
import { Fade } from "react-awesome-reveal";
import { getProducts } from "../../utility/api";
import { MdDelete } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { Product } from "../../types/productTypes";
import '../styles/elementStyles.css';

export default function DeleteProduct() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isSearched, setIsSearched] = useState(false);
    const [searchedProducts, setSearchedProducts] = useState<Product[]>([]);
    const [searchText, setSearchText] = useState('');

    // Fetch the products upon initial load
    useEffect(() => {
        fetchProducts();
    }, []);

    // Fetch the products
    async function fetchProducts() {
        const prods = await getProducts();
        setProducts(prods);
    }

    // Handle search functionality
    function searchProducts() {
        setIsSearched(true);
        const searchedProds = products.filter((product) => product.brand.toLowerCase().includes(searchText.toLowerCase()) || product.model.toLowerCase().includes(searchText.toLowerCase()));
        setSearchedProducts(searchedProds);
    }

    // Handle the delete of the search
    function handleDelete() {
        setIsSearched(false);
        setSearchText('');
        setTimeout(() => {
            setSearchedProducts([]);
        }, 400);
    }

    // Handle search text updates
    const handleSearch = (e) => {
        setSearchText(e.target.value);
        if (e.target.value === '') {
            handleDelete();
        }
    }

    // Handle when enter button pressed
    function handleEnterPress(e) {
        if (e.key === 'Enter') {
            searchProducts();
        } 
    }

    return (
        <Fade triggerOnce>
            <div className="delete-products-content">
                <div className="search-bar">
                    { isSearched ? <IoClose className="search-icon" size={30} onClick={handleDelete}></IoClose> : <IoSearch className="search-icon" size={30} onClick={searchProducts}></IoSearch> }
                    <input type="text" id="product-search" placeholder="Search Products" value={searchText} onChange={handleSearch} onKeyDown={handleEnterPress}></input>   
                </div>
                <div className="products-list">
                    { 
                        products.length > 0 && !isSearched ? (
                            products.map((product) => (
                                <div className="individual-product" key={product._id}>
                                    <p>{product.brand} {product.model} {product.storage}GB</p>
                                    <MdDelete className="delete-icon" size={30} />
                                </div>
                            ))
                        ) : isSearched && searchedProducts.length > 0 ? (
                            searchedProducts.map((product) => (
                                <div className="individual-product" key={product._id}>
                                    <p>{product.brand} {product.model} {product.storage}GB</p>
                                    <MdDelete className="delete-icon" size={30} />
                                </div>
                            ))
                        ) : <p>No products</p>
                    }
                </div>
            </div>
        </Fade>
    );
}