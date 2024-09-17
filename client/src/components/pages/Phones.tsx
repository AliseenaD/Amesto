import React, { useEffect, useState } from "react";
import NavBar from "../elements/NavBar.tsx";
import BannerImage from '../elements/BannerImage.tsx';
import BannerPhoto from "../../assets/HomeBanner.jpg";
import { Product } from "../../types/productTypes.ts";
import { getProducts } from "../../utility/productsApi.js";
import { PhoneBrandDictionary } from "../../types/productTypes.ts";
import CardScroll from "../elements/CardScroll.tsx";
import SearchBar from "../elements/SearchBar.tsx";
import '../styles/phonePage.css';
import { Fade } from "react-awesome-reveal";
import Footer from "../elements/Footer.tsx";

export default function Phones() {
    const [phones, setPhones] = useState<Product[]>([]);

    // Set the products on page load
    useEffect(() => {
        fetchProducts();
    }, []);

    // Function to get all phones
    async function fetchProducts() {
        const prods = await getProducts();
        setPhones((prods as Product[]).filter((prod) => prod.type === 'Phone'));
    }

    // A function that creates dictionary of all brands
    function filterBrands(): PhoneBrandDictionary {
        let dictionary: PhoneBrandDictionary = {}
        phones.forEach((phone) => {
            const name = phone.model.trim().split(' ')[0];
            if (!dictionary[phone.brand]) {
                dictionary[phone.brand] = {}
            }
            if (!dictionary[phone.brand][name]) {
                dictionary[phone.brand][name] = [];
            }
            dictionary[phone.brand][name].push(phone);
        });
        return dictionary;
    }

    // A function that goes through the brands and filters by name of phone as well
    function presentBrands(dictionary: PhoneBrandDictionary) {
        return (
            <>
            {Object.entries(dictionary).map(([brand, products]) => (
                <div key={brand}>
                    <Fade triggerOnce direction="up">
                        <p className="brand-title">{brand}</p>
                    </Fade>
                    {Object.entries(products).map(([title, productArray]) => (
                        <CardScroll key={title} title={title} products={productArray} displayStorage={true} />
                    ))}
                </div>
            ))}
        </>
        );
    }

    return (
        <>
            <NavBar />
            <BannerImage image={BannerPhoto} title='تلفن ها' />
            <SearchBar products={phones} />
            {presentBrands(filterBrands())}
            <Footer />
        </>
    );
}