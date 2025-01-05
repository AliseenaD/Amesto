import React, { useEffect, useRef, useState } from "react";
import { NewsScrollProps } from "../../types/productTypes";
import "../styles/elementStyles.css";
import { Fade } from "react-awesome-reveal";
import NewsCardPreview from "../elements/NewsCardPreview.tsx";

export default function NewsScroll({ title, news, navigateFunction, navigateTitle }: NewsScrollProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Handle the scrolling of the carousel for news
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleScroll = () => {
            const cardWrapper = container.querySelector('.news-card-wrapper');
            if (!cardWrapper) return;
            const cardWidth = cardWrapper.clientWidth;
            const scrollPosition = container.scrollLeft;
            const newIndex = Math.round(scrollPosition / cardWidth);
            setActiveIndex(newIndex);
        };

        // Initial calculation
        handleScroll();

        container.addEventListener('scroll', handleScroll);
        // Also listen for window resize to recalculate on screen size changes
        window.addEventListener('resize', handleScroll);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    if (!news) {
        return (
            <p>Loading</p>
        )
    }

    return (
        <Fade triggerOnce direction="up">
            <div className="news-scroll-content">
                <p className="scroll-title">{title}</p>
                <div className="news-scroll-wrapper">
                    <div ref={scrollRef} className="news-scroll-container">
                        {news.results.map((item, index) => (
                            <div key={item.id} className={`news-card-wrapper ${index === activeIndex ? 'active' : ''}`} >
                                <NewsCardPreview newsItem={item} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Fade>
    );
}