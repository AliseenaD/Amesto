import React, { useEffect, useState } from "react";
import NavBar from "../elements/NavBar.tsx";
import BannerImage from '../elements/BannerImage.tsx';
import SpeakerImg from '../../assets/speakerHero.jpg';
import { Product } from "../../types/productTypes.ts";
import { getProducts } from "../../utility/api.js";
import Footer from "../elements/Footer.tsx";
import CardScroll from "../elements/CardScroll.tsx";
import { ProductDictionary } from "../../types/productTypes.ts";
import SearchBar from "../elements/SearchBar.tsx";

export default function Speakers() {
    const [speakers, setSpeakers] = useState<Product[]>([]);

    // Fetch speakers on every refresh
    useEffect(() => {
        fetchProducts();
    }, [])

    // Get the speakers
    async function fetchProducts() {
        const prods = await getProducts();
        setSpeakers((prods as Product[]).filter((prod) => prod.type === 'Speaker'));
    }

    // A function that creates dictionary of all brands
    function filterBrands(): ProductDictionary {
        let dictionary: ProductDictionary = {}
        speakers.forEach((speaker) => {
            if (!dictionary[speaker.brand]) {
                dictionary[speaker.brand] = [speaker];
            }
            else {
                dictionary[speaker.brand].push(speaker);
            }
        });
        return dictionary;
    }

    function displayBrands(dictionary: ProductDictionary) {
        return (
            <div className="brand-container">
                { Object.entries(dictionary).map(([brand, products]) => (
                    <CardScroll key={brand} title={brand} products={products} />
                )) }
            </div>
        );
    }

    return(
        <>
            <NavBar />
            <BannerImage title='بلندگوها' image={SpeakerImg} />
            <SearchBar products={speakers} />
            {displayBrands(filterBrands())}
            <Footer />
        </>
    );
}