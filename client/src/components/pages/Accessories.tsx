import React, { useEffect, useState } from "react";
import "../styles/productPages.css";
import NavBar from "../elements/NavBar.tsx";
import { BrandType, Product } from "../../types/productTypes.ts";
import { getAccessories } from "../../utility/productsApi.js";
import { getAccessoryBrands } from "../../utility/brandsApi.js";
import { Fade } from "react-awesome-reveal";
import { CiCircleRemove, CiFilter } from "react-icons/ci";
import ProductPageCard from "../elements/ProductPageCard.tsx";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import Footer from "../elements/Footer.tsx";
import accessoryPic from "../../assets/accessory.avif";
import BannerImage from "../elements/BannerImage.tsx";

export default function Accessories() {
    const [accessories, setAccessories] = useState<Product[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasNext, setHasNext] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [brand, setBrand] = useState<string>('');
    const [hasPrevious, setHasPrevious] = useState<boolean>(false);
    const [attributeSelected, setAttributeSelected] = useState<string>('');
    const [attributeFunction, setAttributeFunction] = useState<((page:number, brand:string) => Promise<void>) | null>(null);
    const [accessoryBrands, setAccessoryBrands] = useState<BrandType[]>([]);


    // Fetch brands on page load
    useEffect(() => {
        fetchAccessoryBrands();
    }, []);

    // Fetch accessories whenever brand changes or page changes
    useEffect(() => {
        fetchAccessories();
    }, [page, brand]);
    
    // Fetch accessory brands
    async function fetchAccessoryBrands() {
        try {
            const result = await getAccessoryBrands();
            setAccessoryBrands(result);
        }
        catch (error) {
            console.error("An error occurred while fetching accessory brands:", error);
        }
    }

    // Fetch all accessories in a paginated fashion
    async function fetchAccessories() {
        setIsLoading(true);
        try {
            const result = await getAccessories(page, brand);
            // Set paginated states and products
            if (result) {
                setHasNext(!!result.next);
                setHasPrevious(!!result.previous);
                setAccessories(result.results);
            }
        }
        catch (error) {
            console.error("An error occurred while fetching accessories:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Function that will fetch the next page upon button press
    async function onButtonPress(increment: number) {
        const newPage = page + increment;
        setPage(newPage);
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
            <NavBar />
            <BannerImage title='لوازم جانبی' image={accessoryPic} />
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
                            </div>
                        </div>
                        <div className="filter-groups">
                            <div className="filter-group">
                                <div className="filter-options">
                                    {accessoryBrands.map(item => (
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
                        </div>
                    </div>
                </Fade>
                <div className="products-paginated-container">
                    {accessories && accessories.length === 0 ? <p>هیچ محصولی با این وجود ندارد</p> : ''}
                    {accessories && accessories.map(accessory => (
                        <ProductPageCard key={accessory.id} product={accessory} displayColor={false} displayStorage={false} />
                    ))}
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