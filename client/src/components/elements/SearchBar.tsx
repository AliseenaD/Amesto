import React, { useEffect, useState } from "react";
import '../../styles/elementStyles.css';
import { Product } from "../../types/productTypes";
import { SearchBarProps } from "../../types/productTypes";
import { IoSearch } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { Fade } from "react-awesome-reveal";
import CardScroll from "./CardScroll.tsx";
import ProductCardPreview from "./ProductCardPreview.tsx";

export default function SearchBar({ products, displayStorage }: SearchBarProps) {
    const [isSearched, setIsSearched] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedProducts, setSearchedProducts] = useState<Product[]>([]);

    // Handle clearing of results whenever search text becomes empty
    useEffect(() => {
        if (!searchText) {
            setIsSearched(false);
            setTimeout(() => {
                setSearchedProducts([]);
            }, 600);
        }
    }, [searchText])

    // A function that searches through all the products passed to it
    function searchProducts() {
        setIsSearched(true);
        const filtered = products.filter(prod => prod.model.toLowerCase().includes(searchText.toLowerCase()));
        console.log(filtered);
        setSearchedProducts(filtered);
    }

    // A function to handle key pressing
    function handleChange(e) {
        setSearchText(e.target.value);
    }

    // Handle delete
    function handleDelete() {
        setSearchText('');
        setIsSearched(false);
        setTimeout(() => {
            setSearchedProducts([]);
        }, 600);
    }

    // Search when enter is pressed
    function handleEnterPress(e) {
        if (e.key == 'Enter') {
            searchProducts();
        }
    }

    return (
        <>
            <div className="search-bar-container">
                <Fade triggerOnce direction="up" delay={300}>
                    <input className="search-input" type="text" placeholder="محصولات را جستجو کنید" value={searchText} onChange={handleChange} onKeyDown={handleEnterPress}></input>
                    { isSearched ? <IoClose className="search-bar-icons" size={40} onClick={handleDelete} /> : <IoSearch className="search-bar-icons" size={40} onClick={searchProducts} /> }
                </Fade>
            </div>
            <div className={`search-results ${isSearched ? ' search-open' : ''}`}>
                { searchedProducts.length > 0 ? searchedProducts.map((product) => (
                    <ProductCardPreview key={product.id} product={product} displayStorage={displayStorage} />
                )) : <p>No products found</p> }
            </div>
        </>
    );
}