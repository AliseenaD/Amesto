import React, { useEffect, useRef, useState } from "react";
import "../styles/newsStyles.css";
import NavBar from "../elements/NavBar.tsx";
import Footer from "../elements/Footer.tsx";
import { NewsItem } from "../../types/productTypes.ts";
import { getNews } from "../../utility/newsApi.js";
import NewsDetailCard from "../elements/NewsElements/NewsDetailCard.tsx";
import loadingGif from "../../assets/Loading.webp";

export default function News() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const loaderRef = useRef<HTMLDivElement>(null);
    const initialLoadRef = useRef<boolean>(false);

    // Initial load of news
    useEffect(() => {
        // Make sure not to double load the news
        if (!initialLoadRef.current) {
            fetchNews();
            initialLoadRef.current = true;
        }
    }, [])

    // Setup intersection observer to load new news upon scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !isLoading && page > 1) {
                    fetchNews();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px'
            }
        );
        
        // Start observing with the loader div
        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        }
    }, [hasMore, isLoading]);

    // Fetch the paginated news
    async function fetchNews() {
        // Do nothing if currently loading or there no longer is any more news
        if (isLoading || !hasMore) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await getNews(page);
            // If this is the last page then set hasMore to false
            if (!response.next) {
                setHasMore(false);
            }

            setNews(prev => [...prev, ...response.results]);
            setPage(prev => prev + 1);
        }
        catch (error) {
            console.error("Error fetching the news;", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <NavBar />
            <div className="news-content">
                <div className="news-grid">
                    {news.map(newsItem => (
                        <NewsDetailCard key={newsItem.id} newsItem={newsItem} />
                    ))}
                </div>
                <div ref={loaderRef} className="news-loader">
                    {isLoading && (
                        <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                            <img alt="loading" src={loadingGif} style={{width: '150px', height: '150px', margin: '3rem'}}></img>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}