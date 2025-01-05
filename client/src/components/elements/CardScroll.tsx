import React, { useRef, RefObject } from "react";
import "../styles/elementStyles.css";
import { Fade } from "react-awesome-reveal";
import ProductCardPreview from "./ProductCardPreview.tsx";
import { CardScrollProps } from "../../types/productTypes.ts";

export default function CardScroll({ title, products, displayStorage, displayNew, navigateFunction, navigateTitle }: CardScrollProps) {
    const containerRef: RefObject<HTMLUListElement> = useRef(null);

    return (
        <Fade triggerOnce direction="up" delay={500}>
            <div className="card-scroll-content">
                <div className="scroll-headers">
                    <button className="scroll-button" onClick={navigateFunction}>{navigateTitle}</button>
                    <p className="scroll-title">{title}</p>
                </div>
                <div className="scroll-container">
                    <ul className="cards-list" ref={containerRef}>
                        {products.results.map((product) => (
                            <li key={product.id}>
                                <ProductCardPreview product={product} displayStorage={displayStorage} displayNew={displayNew} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Fade>
    );
}