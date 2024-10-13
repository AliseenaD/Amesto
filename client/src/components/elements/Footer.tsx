import React from "react";
import '../styles/elementStyles.css';
import { Fade } from "react-awesome-reveal";

export default function Footer() {
    return (
        <Fade triggerOnce direction="up">
            <div className="footer-content">
                <hr></hr>
                <div className="footer-text">
                    <p id="store-name">AMESTO</p>
                    <p className="store-text">فروشگاه با مدیریت امیرحسین علم زاده</p>
                    <p className="store-text">مکان: تهران، خیابان آفریقا، پلاک 1203</p>
                    <p className="store-text">واتساپ: 33671255672</p>
                </div>
            </div>
        </Fade>
    );
}