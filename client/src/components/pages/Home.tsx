import React, { useEffect, useState } from "react";
import NavBar from "../elements/NavBar.tsx";
import BannerImage from "../elements/BannerImage.tsx";
import BannerPhoto from "../../assets/HomeBanner.jpg";
import HeroPic from "../../assets/HeroPic.jpg";
import { useNavigate } from "react-router-dom";
import { getHeadphones, getPhones, getSpeakers } from "../../utility/productsApi.js";
import CardScroll from "../elements/CardScroll.tsx";
import HeroBanner from "../elements/HeroBanner.tsx";
import Footer from "../elements/Footer.tsx";
import { NewsItem, PaginatedResponse, Product } from "../../types/productTypes.ts";
import NewsScroll from "../elements/NewsScroll.tsx";
import { getNews } from "../../utility/newsApi.js";
import IconBanner from "../elements/IconBanner.tsx";
import { useAuthToken } from "../../AuthTokenContext.js";
import ReactGA from "react-ga4";

export default function Home() {
    const [phones, setPhones] = useState<PaginatedResponse<Product> | null >(null);
    const [speakers, setSpeakers] = useState<PaginatedResponse<Product> | null>(null);
    const [news, setNews] = useState<PaginatedResponse<NewsItem> | null>(null);
    const [headphones, setHeadphones] = useState<PaginatedResponse<Product> | null>(null);
    const navigate = useNavigate();

    // Refresh products, only do so if the products non existent to reduce server load
    // Also do google analytics
    useEffect(() => {
        // Register google analytics
        ReactGA.initialize('G-MHTGN8DDYS');
        ReactGA.send("pageview");

        if (!phones && !news) {
            fetchNews();
            fetchPhones();
            fetchSpeakers();
            fetchHeadphones();
        }
    }, []);

    // Get the news for the home page
    async function fetchNews() {
        const newsData = await getNews();
        setNews(newsData);
    }

    // Get the phones for the home page
    async function fetchPhones() {
        const phoneData = await getPhones();
        setPhones(phoneData);
    }

    // Get the speakers for the home page
    async function fetchSpeakers() {
        const speakerData = await getSpeakers();
        setSpeakers(speakerData);
    }

    // Get the headphones for the home page
    async function fetchHeadphones() {
        const headphoneData = await getHeadphones();
        setHeadphones(headphoneData);
    }

    // Function that navigates and scrolls to the beginning of the new passed in page
    function navigateAndScroll(path: string) {
        window.scrollTo(0, 0);
        navigate(path)
    }

    return (
        <>
            <NavBar />
            <BannerImage title='AMESTO' image={BannerPhoto} />
            {news && <NewsScroll title='اخبار جدید' news={news} navigateFunction={() => navigateAndScroll('/news')} navigateTitle="جدید ببین" />}
            {news && <IconBanner />}
            {phones && <CardScroll title='از مجموعه گوشی های هوشمند ما انتخاب کنید' products={phones} navigateFunction={() => navigateAndScroll('/phones')} navigateTitle="گوشی ها" />}
            {speakers && <CardScroll title='بلندگوهای پیشرفته ما را بررسی کنید' products={speakers} navigateFunction={() => navigateAndScroll('/speakers')} navigateTitle="بلندگوها" />}
            {phones && speakers && <HeroBanner text='دستگاه های کاملاً جدید برای شما آورده شده است' image={HeroPic} />}
            {headphones && <CardScroll title="بهترین هدفون" products={headphones} navigateFunction={() => navigateAndScroll('/headphones')} navigateTitle="هدفون" />}
            {phones && speakers && <Footer />}
        </>
    );
}
