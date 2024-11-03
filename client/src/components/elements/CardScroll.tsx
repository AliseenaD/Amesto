import React, { useRef, RefObject } from "react";
import '../../styles/elementStyles.css';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Fade } from "react-awesome-reveal";
import ProductCardPreview from "./ProductCardPreview.tsx";
import { CardScrollProps } from "../../types/productTypes.ts";

export default function CardScroll({ title, products, displayStorage }: CardScrollProps) {
    const containerRef: RefObject<HTMLUListElement> = useRef(null);

    function handleScroll(direction: 'left' | 'right') {
        if (containerRef.current) {
            const scrollAmount = 300;
            const newScrollPosition = containerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            containerRef.current.scrollTo({
                left: newScrollPosition,
                behavior: 'smooth'
            });
        }
    }

    return (
        <Fade triggerOnce direction="up" delay={500}>
            <div className="card-scroll-content">
                <p className="scroll-title">{title}</p>
                <div className="scroll-container">
                    <IoIosArrowBack className="arrow-icons" size={40} onClick={() => handleScroll('left')} />
                    <ul className="cards-list" ref={containerRef}>
                        {products.map((product) => (
                            <li key={product.id}>
                                <ProductCardPreview product={product} displayStorage={displayStorage} />
                            </li>
                        ))}
                    </ul>
                    <IoIosArrowForward className="arrow-icons" size={40} onClick={() => handleScroll('right')} />
                </div>
            </div>
        </Fade>
    );
}