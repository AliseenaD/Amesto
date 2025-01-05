import React, { useEffect, useState } from "react";
import "../styles/elementStyles.css";
import { Fade } from "react-awesome-reveal";

export default function BannerImage({ image, title }) {
    const [windowDim, setWindowDim] = useState(getWindowDimensions());

    // Get window dimensions
    function getWindowDimensions() {
        const { innerWidth: width, innerHeight: height } = window;
        return { width, height }
    }
    
    // Update window dimensions
    useEffect(() => {
        function handleResize() {
            setWindowDim(getWindowDimensions());
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Dynamically update font size
    function getTitleSize(width) {
        if (width <= 767) {
            return `${Math.max(3, width / 100)}rem`;
        }
        return '9rem';
    }

    return (
        <Fade triggerOnce direction="up">
            <div className="banner-content" style={{ backgroundImage: `url(${image})`, backgroundPosition: `${title !== 'ساعت' && title !== 'هدفون' ? 'top' : 'center'}` }}>
                <p className="banner-title" style={{ fontSize: getTitleSize(windowDim.width) }}>{title}</p>
            </div>
        </Fade>
    );
}