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
                    <p className="store-text">Store operated by Amirhossein Elmzadeh</p>
                    <p className="store-text">Location: 1203 Africa Street, Tehran</p>
                    <p className="store-text">Whatsapp: 33671255672</p>
                </div>
            </div>
        </Fade>
    );
}