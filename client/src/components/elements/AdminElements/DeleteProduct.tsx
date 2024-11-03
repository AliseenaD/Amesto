import React, { useEffect, useState } from "react";
import { Fade } from "react-awesome-reveal";
import { deleteProduct, getProducts } from "../../../utility/productsApi";
import { useAuthToken } from "../../../AuthTokenContext";
import { IoSearch, IoTrashOutline } from "react-icons/io5";
import { toast } from 'react-toastify';
import { IoClose } from "react-icons/io5";
import { Product, ProductDictionary } from "../../../types/productTypes";
import '../../../styles/adminStyles.css';

export default function DeleteProduct() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isSearched, setIsSearched] = useState(false);
    const [searchedProducts, setSearchedProducts] = useState<Product[]>([]);
    const [searchText, setSearchText] = useState('');
    const { accessToken } = useAuthToken()

    // Fetch the products upon initial load
    useEffect(() => {
        fetchProducts();
    }, []);

    // Fetch the products
    async function fetchProducts() {
        const prods = await getProducts();
        setProducts(prods);
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

    // Handle the delete of the product
    async function onDeletePress(product: Product) {
        try {
            const result = await deleteProduct(product, accessToken);
            // If successfully deleted refetch products to refresh list
            if (result && result.success) {
                toast.success("Product successfully deleted")
                fetchProducts();
            }
            else {
                toast.error("Product was not successfully deleted");
                throw new Error(result?.error || "Failed to delete product");
            }
        }
        catch (error) {
            toast.error("Product was not successfully deleted");
            console.error("Error occurred while deleting a product:", error);
        }
    }
    
    function ProductCard({ product }: { product: Product }) {
        return (
            <div className="product-card">
            <div className="product-info">
                <h3>{product.brand} {product.model}</h3>
                <p>{product.storage ? `${product.storage}GB` : ''}</p>
            </div>
            <button onClick={() => onDeletePress(product)} className="delete-button">
                <IoTrashOutline /> Delete
            </button>
            </div>
        );
      }
    
    function ProductList({ dictionary }: { dictionary: ProductDictionary }) {
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
            <div className="delete-products-container">
                <div className="search-container">
                    <div className="search-bar">
                        <IoSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="محصولات را جستجو کنید" 
                        value={searchText} 
                        onChange={handleSearch} 
                        onKeyDown={handleEnterPress}
                    />
                    {isSearched && <IoClose className="clear-icon" onClick={handleDelete} />}
                    </div>
                    {isSearched && <button className="search-button" onClick={searchProducts}>Search</button>}
                </div>
                <div className="products-container">
                    {products.length > 0 && !isSearched ? (
                        <ProductList dictionary={filterTypes(products)} />
                        ) : isSearched && searchedProducts.length > 0 ? (
                        <ProductList dictionary={filterTypes(searchedProducts)} />
                        ) : (
                        ""
                    )}
                </div>
            </div>
        </Fade>
    );
};
