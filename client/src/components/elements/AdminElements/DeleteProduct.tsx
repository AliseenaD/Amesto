import React, { useEffect, useState } from "react";
import { Fade } from "react-awesome-reveal";
import { deleteProduct, getAccessories, getHeadphones, getPhones, getSpeakers, getWatches } from "../../../utility/productsApi";
import { useAuthToken } from "../../../AuthTokenContext";
import { IoTrashOutline } from "react-icons/io5";
import { toast } from 'react-toastify';
import { PaginatedResponse, Product, ProductGridProps } from "../../../types/productTypes";
import "./adminStyles.css";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import loadingGif from "../../../assets/Loading.webp";

export default function DeleteProduct() {
    const [products, setProducts] = useState<Product[]>([]);
    const { accessToken } = useAuthToken()
    const [hasNext, setHasNext] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasPrevious, setHasPrevious] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const productTypes = ['Phones', 'Speakers', 'Watches', 'Headphones', 'Accessories'];
    const [productType, setProductType] = useState<string>(productTypes[0]);

    // Load products
    useEffect(() => {
        fetchProducts();
    }, [page, productType]);

    // Fetch the products depening on the product type selected
    async function fetchProducts() {
        let result: PaginatedResponse<Product> | undefined; 
        switch (productType) {
            case 'Phones':
                result = await fetchPhones();
                break;
            case 'Speakers':
                result = await fetchSpeakers();
                break;
            case 'Watches':
                result = await fetchWatches();
                break;
            case 'Headphones':
                result = await fetchHeadphones();
                break;
            case 'Accessories':
                result = await fetchAccessories();
                break;
        }

        // Set paginated states and products
        if (result) {
            setHasNext(!!result.next);
            setHasPrevious(!!result.previous);
            setProducts(result.results);
        }
    }

    // Load all phone products
    async function fetchPhones() {
        setIsLoading(true);
        try {
            const result = await getPhones(page, '');
            return result;
        }
        catch (error) {
            console.error("An error occurred while fetching phones:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Load all speaker products
    async function fetchSpeakers() {
        setIsLoading(true);
        try {
            const result = await getSpeakers(page, '');
            return result;
        }
        catch (error) {
            console.error("An error occurred while fetching phones:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Load all headphone products
    async function fetchHeadphones() {
        setIsLoading(true);
        try {
            const result = await getHeadphones(page, '');
            return result;
        }
        catch (error) {
            console.error("An error occurred while fetching headphones:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Load all watch products
    async function fetchWatches() {
        setIsLoading(true);
        try {
            const result = await getWatches(page, '');
            return result;
        }
        catch (error) {
            console.error("An error occurred while fetching headphones:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Load all accessories
    async function fetchAccessories() {
        setIsLoading(true);
        try {
            const result = await getAccessories(page, '');
            return result;
        }
        catch (error) {
            console.error("An error occurred while fetching headphones:", error);
        }
        finally {
            setIsLoading(false);
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
    
    function ProductList({ title, products }: ProductGridProps) {
        return (
            <>
                <div className="product-category">
                    <h2 className="category-title">{title}</h2>
                </div>
                {isLoading ? (
                    <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                        <img alt="loading" src={loadingGif} style={{width: '150px', height: '150px', margin: '3rem'}}></img>
                    </div>
                ) :
                    <>
                        {products && products.length > 0 ? (
                        <div className="product-grid">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ): <p>هیچ محصولی با این وجود ندارد</p>}
                    </>
                }
            </>
        );
    }
    
    // Handles the pagination when the page button is clicked
    function handlePageButtonPress(increment: number) {
        setPage(currPage => currPage + increment);
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

    // Switches the product types upon button press
    function handleButtonPress(type: string) {
        setProductType(type);
        setPage(1);
    }

    return (
        <Fade triggerOnce>
            <div className="filter-products-container">
                {productTypes.map(item => (
                    <button key={item} className={`product-type-button ${productType === item ? 'type-active' : ''}`} onClick={() => handleButtonPress(item)}>{item}</button>
                ))}
            </div>
            <div className="delete-products-container">
                <div className="filter-products-container">

                </div>
                <div className="products-container">
                    <ProductList title={productType} products={products} />
                </div>
            </div>
            <div className="pagination-buttons-container">
                <button className="pagination-arrow" disabled={isLoading || !hasPrevious} onClick={() => handlePageButtonPress(-1)}><MdOutlineKeyboardArrowLeft size={20} /></button>
                <div className="pagination-indicator">{toPersianNumbers(page)}</div>
                <button className="pagination-arrow" disabled={isLoading || !hasNext} onClick={() => handlePageButtonPress(1)}><MdOutlineKeyboardArrowRight size={20} /></button>
            </div>
        </Fade>
    );
};
