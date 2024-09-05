import React, { useEffect, useState } from "react";
import NavBar from "../elements/NavBar.tsx";
import BannerImage from "../elements/BannerImage.tsx";
import BannerPhoto from "../../assets/HomeBanner.jpg";
import HeroPic from "../../assets/HeroPic.jpg";
import { useAuth0 } from "@auth0/auth0-react";
import { getProducts } from "../../utility/api.js";
import CardScroll from "../elements/CardScroll.tsx";
import HeroBanner from "../elements/HeroBanner.tsx";
import Footer from "../elements/Footer.tsx";

// Provide the product structure
interface Product {
    _id: string;
    type: string;
    brand: string;
    model: string;
    picture: string;
}

export default function Home() {
    const { logout } = useAuth0();
    const [products, setProducts] = useState<Product[]>([]);
    const [phones, setPhones] = useState<Product[]>([]);
    const [speakers, setSpeakers] = useState<Product[]>([]);

    // Refresh products
    useEffect(() => {
        fetchProducts();
    }, []);

    // Refilter every time products changes
    useEffect(() => {
        if (products) {
            filterProducts();
        }
    }, [products]);

    // Get the products
    async function fetchProducts() {
        const prods = await getProducts();
        setProducts(prods);
    }

    // Filter between speakers and phones
    function filterProducts() {
        const speakerProds = products.filter((product) => product.type === 'Speaker');
        setSpeakers(speakerProds);
        const allPhones = products.filter((product) => product.type === 'Phone');
        const phoneDict = allPhones.reduce((acc: Record<string, Product>, product) => {
            if (!acc[product.model]) {
                acc[product.model] = product;
            }
            return acc;
        }, {});
        const uniquePhones = Object.values(phoneDict);
        setPhones(uniquePhones.reverse());
    }

    return (
        <>
            <NavBar />
            <BannerImage title='AMESTO' image={BannerPhoto} />
            <CardScroll title='Choose from our smartphone collection.' products={phones} />
            <CardScroll title='Check out our state of the art speakers.' products={speakers} />
            <HeroBanner text='BRAND NEW DEVICES BROUGHT TO YOU.' image={HeroPic} />
            <Footer />
            <button onClick={() => logout()}>Logout</button>
        </>
    );
}
