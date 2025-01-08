import React, { useEffect, useRef, useState } from "react";
import BannerImage from '../elements/BannerImage.tsx';
import BannerPhoto from "../../assets/HomeBanner.jpg";
import { BrandType, Product } from "../../types/productTypes.ts";
import { getPhones, getPhonesDecreasingPrice, getPhonesDecreasingStorage, getPhonesIncreasingPrice, getPhonesIncreasingStorage } from "../../utility/productsApi.js";
import "../styles/productPages.css";
import { Fade } from "react-awesome-reveal";
import Footer from "../elements/Footer.tsx";
import ProductPageCard from "../elements/ProductPageCard.tsx";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { CiCircleRemove } from "react-icons/ci";
import { CiFilter } from "react-icons/ci";
import { getPhoneBrands } from "../../utility/brandsApi.js";
import loadingGif from "../../assets/Loading.webp";


export default function Phones() {
    const [phones, setPhones] = useState<Product[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [brand, setBrand] = useState('');
    const [specificBrandPressed, setSpecificBrandPressed] = useState(false);
    const [phoneBrands, setPhoneBrands] = useState<BrandType[]>([]);
    const [attributeSelected, setAttributeSelected] = useState('');
    const [attributeFunction, setAttributeFunction] = useState<((page:number, brand:string) => Promise<void>) | null>(null);
    const reference = useRef<HTMLDivElement>(null);
    const attributes = [
        {
            title: 'افزایش قیمت',
            action: filterByIncreasingPrice
        },
        {
            title: 'کاهش قیمت',
            action: filterByDecreasingPrice
        },
        {
            title: 'افزایش ذخیره سازی',
            action: filterByIncreasingStorage
        },
        {
            title: 'کاهش ذخیره سازی',
            action: filterByDecreasingStorage
        }
    ]

    // Refresh the brands on page load
    useEffect(() => {
       fetchBrands(); 
    }, [])

    // Set the phones on change of page or brand
    useEffect(() => {
        if (!attributeFunction) {
            fetchPhones();
        }
        else {
            attributeFunction(page, brand);
        }
    }, [brand, page, attributeFunction]);

    // Fetch all brands associated with phones
    async function fetchBrands() {
        try {
            const result = await getPhoneBrands();
            setPhoneBrands(result);
        }
        catch (error) {
            console.error('An error occurred while fetching the brands:', error);
        }
    }

    // Function to get all phones paginated
    async function fetchPhones() {
        setIsLoading(true); 
        try {
            const result = await getPhones(page, brand);
            
            // Set paginated states and products
            if (result) {
                setHasNextPage(!!result.next);
                setHasPrevious(!!result.previous);
                setPhones(result.results);
            }
        } 
        catch (error) {
            console.error('Error fetching phones:', error);
        } 
        finally {
            setIsLoading(false); 
        }
    }

    // A function that will filter by increasing price, make sure to pass in page and brand because with closure under the state for the function it keeps initial values only
    async function filterByIncreasingPrice(currentPage: number, currentBrand: string) {
        setIsLoading(true);
        try {
            const result = await getPhonesIncreasingPrice(currentPage, currentBrand);
            // Set paginated states and products
            if (result) {
                setHasNextPage(!!result.next);
                setHasPrevious(!!result.previous);
                setPhones(result.results);
            }
        }
        catch (error) {
            console.error('Error fetching phones:', error);
        } 
        finally {
            setIsLoading(false); 
        }
    }

    // A function that will filter by decreasing price
    async function filterByDecreasingPrice(currentPage: number, currentBrand: string) {
        setIsLoading(true);
        try {
            const result = await getPhonesDecreasingPrice(currentPage, currentBrand);
            // Set paginated states and products
            if (result) {
                setHasNextPage(!!result.next);
                setHasPrevious(!!result.previous);
                setPhones(result.results);
            }
        }
        catch (error) {
            console.error('Error fetching phones:', error);
        } 
        finally {
            setIsLoading(false); 
        }
    }

    // A function that will filter by increasing storage
    async function filterByIncreasingStorage(currentPage: number, currentBrand: string) {
        setIsLoading(true);
        try {
            const result = await getPhonesIncreasingStorage(currentPage, currentBrand);
            // Set paginated states and products
            if (result) {
                setHasNextPage(!!result.next);
                setHasPrevious(!!result.previous);
                setPhones(result.results);
            }
        }
        catch (error) {
            console.error('Error fetching phones:', error);
        } 
        finally {
            setIsLoading(false); 
        }
    }

    // A function that will filter by decreasing storage
    async function filterByDecreasingStorage(currentPage: number, currentBrand: string) {
        setIsLoading(true);
        try {
            const result = await getPhonesDecreasingStorage(currentPage, currentBrand);
            // Set paginated states and products
            if (result) {
                setHasNextPage(!!result.next);
                setHasPrevious(!!result.previous);
                setPhones(result.results);
            }
        }
        catch (error) {
            console.error('Error fetching phones:', error);
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

    // Handle the changing of brands
    const handleBrandButtonPress = (brand: string) => {
        setBrand(brand);
        setPage(1);
        setSpecificBrandPressed(true);
    }

    // Handles the reset of the brands
    const resetBrands = () => {
        setBrand('');
        setSpecificBrandPressed(false);
        setPage(1);
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

    return (
        <>
            <BannerImage image={BannerPhoto} title='تلفن ها' />
            <div ref={reference}></div>
            <Fade triggerOnce direction="up">
                <Fade triggerOnce direction="up">
                    <div className="filter-section">
                        <div className="filter-header">
                            <div className="filter-title">
                                <CiFilter size={35} />
                                <span>فیلترها</span>
                            </div>
                            <div className="filter-headers">
                                {specificBrandPressed && (
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
                                    {phoneBrands.map(item => (
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
                                    phones.length === 0 ? (
                                        <p>هیچ محصولی با این وجود ندارد</p>
                                    ) : (
                                        phones.map(phone => (
                                            <ProductPageCard key={phone.id} product={phone} displayColor={false} displayStorage={false} />
                                        ))
                                    )
                                }
                            </>
                    )}
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