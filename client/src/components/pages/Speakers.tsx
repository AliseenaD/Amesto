import React, { useEffect, useState } from "react";
import NavBar from "../elements/NavBar.tsx";
import BannerImage from '../elements/BannerImage.tsx';
import SpeakerImg from '../../assets/speakerHero.jpg';
import { BrandType, Product } from "../../types/productTypes.ts";
import Footer from "../elements/Footer.tsx";
import { getSpeakers, getSpeakersDecreasePrice, getSpeakersIncreasePrice } from "../../utility/productsApi.js";
import { Fade } from "react-awesome-reveal";
import { CiCircleRemove } from "react-icons/ci";
import { CiFilter } from "react-icons/ci";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import ProductPageCard from "../elements/ProductPageCard.tsx";
import { getSpeakerBrands } from "../../utility/brandsApi.js";

export default function Speakers() {
    const [speakers, setSpeakers] = useState<Product[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasNextPage, setHasNextPage] = useState<boolean>(true);
    const [hasPrevious, setHasPrevious] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [brand, setBrand] = useState<string>('');
    const [speakerBrands, setSpeakerBrands] = useState<BrandType[]>([]);
    const [attributeSelected, setAttributeSelected] = useState<string>('');
    const [attributeFunction, setAttributeFunction] = useState<((page:number, brand:string) => Promise<void>) | null>(null);
    const attributes = [
        {
            title: 'افزایش قیمت',
            action: filterByIncreasingPrice
        },
        {
            title: 'کاهش قیمت',
            action: filterByDecreasingPrice
        },
    ];

    // Fetch speaker brands upon page load
    useEffect(() => {
        fetchBrands();
    }, []);

    // Fetch the products upon change of states
    useEffect(() => {
        // If no attribute selected then just get speakers normally
        if (!attributeFunction) {
            fetchSpeakers();
        }
        // Otherwise fetch speakers from the attribute function
        else {
            attributeFunction(page, brand);
        }
    }, [page, brand, attributeFunction])

    // Fetch speaker brands
    async function fetchBrands() {
        try {
            const result = await getSpeakerBrands();
            setSpeakerBrands(result);
        }
        catch (error) {
            console.error('Error fetching brands:', error);
        }
    }

    // A function that gets all speakers in a paginated fashion (can get specific brands as well)
    async function fetchSpeakers() {
        setIsLoading(true);
        try {
            const result = await getSpeakers(page, brand);

            // Set paginated states and products
            if (result) {
                setHasNextPage(!!result.next);
                setHasPrevious(!!result.previous);
                setSpeakers(result.results);
            }
        }
        catch (error) {
            console.error('Error fetching speakers:', error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Filters the speakers by increasing price 
    async function filterByIncreasingPrice(currPage: number, currBrand: string) {
        setIsLoading(true);
        try {
            const result = await getSpeakersIncreasePrice(currPage, currBrand);

            // Set paginated states and products
            if (result) {
                setHasNextPage(!!result.next);
                setHasPrevious(!!result.previous);
                setSpeakers(result.results);
            }
        }
        catch (error) {
            console.error('Error fetching speakers:', error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Filters the speakers by decreasing price
    async function filterByDecreasingPrice(currPage: number, currBrand: string) {
        setIsLoading(true);
        try {
            const result = await getSpeakersDecreasePrice(currPage, currBrand);

            // Set paginated states and products
            if (result) {
                setHasNextPage(!!result.next);
                setHasPrevious(!!result.previous);
                setSpeakers(result.results);
            }
        }
        catch (error) {
            console.error('Error fetching speakers:', error);
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

    // Handles the changing of filter options
    function handleFilterButtonPress(title: string, action: (page:number, brand:string) => Promise<void>) {
        setAttributeSelected(title)
        // Set the atrtibute function to the passed in action
        setAttributeFunction(() => action);
        setPage(1);
    }

    // Handles the reset of the filter attributes
    const handleAttributeReset = () => {
        setAttributeSelected('');
        setAttributeFunction(null);
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

    return(
        <>
            <NavBar />
            <BannerImage title='بلندگوها' image={SpeakerImg} />
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
                                    {speakerBrands.map(item => (
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
                    {speakers && speakers.length === 0 ? <p>هیچ محصولی با این وجود ندارد</p> : ''}
                    {speakers && speakers.map(speaker => (
                        <ProductPageCard key={speaker.id} product={speaker} displayColor={true} displayStorage={false} />
                    ))}
                </div>
                <div className="products-page-buttons">
                    <button className="page-button" disabled={isLoading || !hasPrevious} onClick={() => onButtonPress(-1)}><MdOutlineKeyboardArrowLeft /></button>
                    <div className="page-indicator">{isLoading ? '...' : toPersianNumbers(page)}</div>
                    <button className="page-button" disabled={isLoading || !hasNextPage} onClick={() => onButtonPress(1)}><MdOutlineKeyboardArrowRight /></button>
                </div>
            </Fade>
            <Footer />
        </>
    );
}