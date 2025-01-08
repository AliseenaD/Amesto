import React, { useEffect, useRef, useState } from "react";
import "../styles/productPages.css";
import { BrandType, Product } from "../../types/productTypes.ts";
import { getWatches, getWatchesDecreasePrice, getWatchesIncreasePrice } from "../../utility/productsApi.js";
import { Fade } from "react-awesome-reveal";
import { CiCircleRemove, CiFilter } from "react-icons/ci";
import ProductPageCard from "../elements/ProductPageCard.tsx";
import Footer from "../elements/Footer.tsx";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import { getWatchBrands } from "../../utility/brandsApi.js";
import watchImage from "../../assets/smartWatch.jpg";
import BannerImage from '../elements/BannerImage.tsx';
import loadingGif from "../../assets/Loading.webp";

export default function Watches() {
    const [watches, setWatches] = useState<Product[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasNext, setHasNext] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [brand, setBrand] = useState<string>('');
    const [hasPrevious, setHasPrevious] = useState<boolean>(false);
    const [attributeSelected, setAttributeSelected] = useState<string>('');
    const [attributeFunction, setAttributeFunction] = useState<((page:number, brand:string) => Promise<void>) | null>(null);
    const [watchBrands, setWatchBrands] = useState<BrandType[]>([]);
    const reference = useRef<HTMLDivElement>(null);
    const attributes = [
        {
            title: 'افزایش قیمت',
            action: fetchWatchesIncreasingPrice
        },
        {
            title: 'کاهش قیمت',
            action: fetchWatchesDecreasingPrice
        }
    ];

    // Fetch watch brands upon page load
    useEffect(() => {
        fetchWatchBrands();
    }, []);

    // Load the products depening on whether or not an attribute function is selected
    useEffect(() => {
        // If no attribute function selected then just load all products
        if (!attributeFunction) {
            fetchWatches();
        }
        else {
            attributeFunction(page, brand);
        }
    }, [page, attributeFunction]);

    // Get all watch brands
    async function fetchWatchBrands() {
        try {
            const result = await getWatchBrands();
            setWatchBrands(result);
        }
        catch (error) {
            console.error("Error occurred fetching watch brands:", error);
        }
    }

    // Fetch all watches
    async function fetchWatches() {
        setIsLoading(true);
        try {
            const result = await getWatches(page, brand);// Set paginated states and products
            if (result) {
                setHasNext(!!result.next);
                setHasPrevious(!!result.previous);
                setWatches(result.results);
            }
        }
        catch (error) {
            console.error("There was an error fetching watches:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Fetch all watches in increasing price
    async function fetchWatchesIncreasingPrice(currPage: number, currBrand: string) {
        setIsLoading(true);
        try {
            const result = await getWatchesIncreasePrice(currPage, currBrand);// Set paginated states and products
            if (result) {
                setHasNext(!!result.next);
                setHasPrevious(!!result.previous);
                setWatches(result.results);
            }
        }
        catch (error) {
            console.error("There was an error fetching watches:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Fetch all watches in decreasing price
    async function fetchWatchesDecreasingPrice(currPage: number, currBrand: string) {
        setIsLoading(true);
        try {
            const result = await getWatchesDecreasePrice(currPage, currBrand);// Set paginated states and products
            if (result) {
                setHasNext(!!result.next);
                setHasPrevious(!!result.previous);
                setWatches(result.results);
            }
        }
        catch (error) {
            console.error("There was an error fetching watches:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Function that will fetch the next page upon button press
    async function onButtonPress(increment: number) {
        // Scroll to the filter menu
        setTimeout(() => {
            if (reference.current) {
                console.log('scrolling to:', reference.current.offsetTop);
                window.scrollTo({
                    top: reference.current.offsetTop,
                });
            }
        }, 50);
        const newPage = page + increment;
        setPage(newPage);
    }

    // Handles the reset of the filter attributes
    const handleAttributeReset = () => {
        setAttributeSelected('');
        setAttributeFunction(null);
        setPage(1);
    }

    // Handles the changing of filter options
    function handleFilterButtonPress(title: string, action: (page:number, brand:string) => Promise<void>) {
        setAttributeSelected(title)
        // Set the atrtibute function to the passed in action
        setAttributeFunction(() => action);
        setPage(1);
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

    // Handle the changing of brands
    const handleBrandButtonPress = (brand: string) => {
        setBrand(brand);
        setPage(1);
    }

    // Handles the reset of the brands
    const resetBrands = () => {
        setBrand('');
        setPage(1);
    }

    return (
        <>
            <BannerImage title='ساعت' image={watchImage} />
            <div ref={reference}></div>
            <Fade triggerOnce direction="up">
                <Fade direction="up" triggerOnce>
                <div className="filter-section">
                        <div className="filter-header">
                            <div className="filter-title">
                                <CiFilter size={35} />
                                <span>فیلترها</span>
                            </div>
                            <div className="filter-headers">
                                {brand && (
                                    <div className="filter-tag">
                                        <span>{brand}</span>
                                        <CiCircleRemove className="remove-icon" size={16} onClick={resetBrands}/>
                                    </div>
                                )}
                                {attributeSelected && (
                                    <div className="filter-tag">
                                        <span>{attributeSelected}</span>
                                        <CiCircleRemove className="remove-icon" size={16} onClick={handleAttributeReset}/>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="filter-groups">
                            <div className="filter-group">
                                <div className="filter-options">
                                    {watchBrands.map(item => (
                                        <button
                                            key={item.id}
                                            disabled={isLoading}
                                            className={`filter-button ${brand === item.name ? 'active' : ''}`}
                                            onClick={() => handleBrandButtonPress(item.name)}
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="filter-group-title">برند</div>
                            </div>
                            <div className="filter-group">
                                <div className="filter-options">
                                    {attributes.map(item => (
                                        <button
                                            key={item.title}
                                            disabled={isLoading}
                                            className={`filter-button ${item.title === attributeSelected ? 'active' : ''}`}
                                            onClick={() => handleFilterButtonPress(item.title, item.action)}
                                        >
                                            {item.title}
                                        </button>
                                    ))}
                                </div>
                                <div className="filter-group-title">مرتب‌سازی</div>
                            </div>
                        </div>
                    </div>
                </Fade>
                <div className="products-paginated-container">
                    {isLoading ? (
                        <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                            <img alt="loading" src={loadingGif} style={{width: '150px', height: '150px', margin: '3rem'}}></img>
                        </div>
                        ) : (
                            <>
                                {
                                    watches.length === 0 ? (
                                        <p>هیچ محصولی با این وجود ندارد</p>
                                    ) : (
                                        watches.map(watch => (
                                            <ProductPageCard key={watch.id} product={watch} displayColor={false} displayStorage={false} />
                                        ))
                                    )
                                }
                            </>
                    )}
                </div>
                <div className="products-page-buttons">
                    <button className="page-button" disabled={isLoading || !hasPrevious} onClick={() => onButtonPress(-1)}><MdOutlineKeyboardArrowLeft /></button>
                    <div className="page-indicator">{isLoading ? '...' : toPersianNumbers(page)}</div>
                    <button className="page-button" disabled={isLoading || !hasNext} onClick={() => onButtonPress(1)}><MdOutlineKeyboardArrowRight /></button>
                </div>
            </Fade>
            <Footer />
        </>
    );
}