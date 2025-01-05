import React from "react";
import "../styles/elementStyles.css";
import { NewsCardProps } from "../../types/productTypes";

export default function NewsCardPreview({ newsItem }: NewsCardProps) {
    return (
        <div className="news-card-container"
        style={{'backgroundImage': `url(${newsItem.picture})`}}
        >
            <div className="news-card-text">
                <p>
                    {newsItem.text}
                </p>
            </div>
        </div>
    );
}