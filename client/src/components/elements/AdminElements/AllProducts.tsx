import React, { useEffect, useState } from "react";
import '../../styles/adminStyles.css';
import { getProducts } from "../../../utility/productsApi";
import { Product, ProductDictionary } from "../../../types/productTypes";
import { IoClose, IoColorPalette, IoSearch } from "react-icons/io5";
import { Fade } from "react-awesome-reveal";

export default function AllProducts() {
    const [products, setProducts] = useState<Product []>([]);
    const [isSearched, setIsSearched] = useState(false);
    const [searchedProducts, setSearchedProducts] = useState<Product[]>([]);
    const [searchText, setSearchText] = useState('');

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
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        if (e.target.value === '') {
            handleDelete();
        }
    }

    // Handle when enter button pressed
    function handleEnterPress(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            searchProducts();
        } 
    }

    function ProductCard({ product }: { product: Product }) {
        return (
            <div className="product-card">
                <h3>{product.brand} {product.model}</h3>
                <p>{product.storage ? `${product.storage}GB` : ''}</p>
                <div className="variant-count">
                    <IoColorPalette /> {product.variants.length} variants
                </div>
                <table className="variant-table">
                    <thead>
                        <tr>
                            <th>رنگ</th>
                            <th>قیمت</th>
                            <th>مقدار</th>
                        </tr>
                    </thead>
                    <tbody>
                        {product.variants.map(variant => (
                            <tr key={variant.id}>
                                <td>{variant.color}</td>
                                <td>{variant.price}</td>
                                <td>{variant.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    function ProductGrid({ dictionary }: { dictionary: ProductDictionary }) {
        return (
            <>
                {Object.entries(dictionary).map(([type, products]) => (
                    <div key={type} className="product-category">
                        <h2 className="category-title">{type.charAt(0).toUpperCase() + type.slice(1)}s</h2>
                        <div className="product-grid">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                ))}
            </>
        );
    }
    
    return (
        <Fade triggerOnce>
            <div className="all-products-container">
                <div className="search-container">
                    <div className="search-bar">
                        {isSearched ? (
                            <IoClose className="search-icon" onClick={handleDelete} />
                        ) : (
                            <IoSearch className="search-icon" onClick={searchProducts} />
                        )}
                        <input 
                            type="text" 
                            placeholder="محصولات را جستجو کنید" 
                            value={searchText} 
                            onChange={handleSearch} 
                            onKeyDown={handleEnterPress}
                        />
                    </div>
                    {isSearched && <button className="search-button" onClick={searchProducts}>Search</button>}
                </div>
                <div className="products-container">
                    {products.length > 0 && !isSearched ? (
                        <ProductGrid dictionary={filterTypes(products)} />
                    ) : isSearched && searchedProducts.length > 0 ? (
                        <ProductGrid dictionary={filterTypes(searchedProducts)} />
                    ) : (
                        ""
                    )}
                </div>
            </div>
        </Fade>
    );
}