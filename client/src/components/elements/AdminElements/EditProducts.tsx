import React, { useEffect, useState } from "react";
import "./adminStyles.css";
import { PaginatedResponse, Product, ProductGridProps } from "../../../types/productTypes.ts";
import { Fade } from "react-awesome-reveal";
import EditIndividualProduct from "./EditIndividualProduct.tsx";
import { getAccessories, getHeadphones, getPhones, getSpeakers, getWatches } from "../../../utility/productsApi";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import loadingGif from "../../../assets/Loading.webp";


export default function EditProducts() {
    const [products, setProducts] = useState<Product[]>([]);
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

    function ProductGrid({ title, products }: ProductGridProps) {
        return (
            <>
                <div className="product-category">
                    <h2 className="category-title">{title}</h2>
                    {isLoading && (
                        <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                            <img alt="loading" src={loadingGif} style={{width: '150px', height: '150px', margin: '3rem'}}></img>
                        </div>
                    )}
                    {products && products.length > 0 ? (
                        <div className="product-grid">
                            {products.map(product => (
                                <EditIndividualProduct fetchProducts={fetchProducts} key={product.id} product={product} />
                            ))}
                        </div>
                    ): <p>هیچ محصولی با این وجود ندارد</p>}
                </div>  
            </>
        );
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

    // Handles the pagination when the page button is clicked
    function handlePageButtonPress(increment: number) {
        setPage(currPage => currPage + increment);
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
            <div className="edit-products-container">
                <div className="products-container">
                    <ProductGrid title={productType} products={products} />
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