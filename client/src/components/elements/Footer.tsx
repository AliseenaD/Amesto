import React from "react";
import "../styles/elementStyles.css";
import { Fade } from "react-awesome-reveal";

export default function Footer() {
    return (
        <Fade triggerOnce direction="up">
            <div className="footer-content">
                <hr></hr>
                <div className="footer-text">
                    <p id="store-name">AMESTO</p>
                    <p className="store-text">آدرس : خیابان جمهوری ، پاساژ شرکا ، طبقه دوم ، واحد ۸۴</p>
                    <p className="store-text">تلفن:۶۶۷۱۴۷۱۳۶۶۷۰۸۹۰۸</p>
                </div>
            </div>
        </Fade>
    );
}