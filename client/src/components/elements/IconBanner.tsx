import React from "react";
import "../styles/elementStyles.css";
import appleIcon from "../../assets/appleIcon.png";
import jblIcon from "../../assets/jblIcon.png";
import samsungIcon from "../../assets/samsungIcon.png";
import sonyIcon from "../../assets/sonyIcon.webp";
import xiaomiIcon from "../../assets/xiaomiIcon.webp";
import { Fade } from "react-awesome-reveal";

export default function IconBanner() {
    return (
        <Fade direction="up" triggerOnce>
            <div className="icon-banner-container">
                <img src={appleIcon} alt="appleIcon" width={100}></img>
                <img src={jblIcon} alt="jblIcon" width={100}></img>
                <img src={samsungIcon} alt="samsungIcon" width={100}></img>
                <img src={sonyIcon} alt="sonyIcon" width={100}></img>
                <img src={xiaomiIcon} alt="xiaomiIcon" width={100}></img>
            </div>
        </Fade>
    );
}