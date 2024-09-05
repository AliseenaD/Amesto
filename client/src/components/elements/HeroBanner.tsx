import React from "react";
import '../styles/elementStyles.css';
import { Fade } from "react-awesome-reveal";

export default function HeroBanner({ text, image }) {
    return (
        <Fade triggerOnce direction="up">
            <div className="hero-container" style={{backgroundImage: `url(${image})`}}>
                <p className="hero-text">{text}</p>
            </div> 
        </Fade>
    );
}