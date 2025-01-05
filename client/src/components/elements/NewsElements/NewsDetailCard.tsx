import React, { useEffect, useState } from "react";
import '../../styles/newsStyles.css';
import { NewsCardProps } from "../../../types/productTypes";
import { Fade } from "react-awesome-reveal";

export default function NewsDetailCard({ newsItem }: NewsCardProps) {
    const [isNew, setIsNew] = useState(false);

    // Check date upon initial load
    useEffect(() => {
        checkNew(newsItem.date_created) ? setIsNew(true) : setIsNew(false);
    }, [newsItem]);

    // Function to convert date to Persian date time
    function convertDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('fa-IR', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Function that determines if news item is new or not (within a week of posting)
    function checkNew(dateString: string): boolean {
        const currentDate = new Date();
        const created = new Date(dateString);

        // Calculate difference in milliseconds
        const diffTime = currentDate.getTime() - created.getTime();

        // Convert to days
        const diffDays = diffTime / (1000*60*60*24);
        return diffDays <= 7;
    }

    return (
        <Fade triggerOnce direction="up">
            <div className="news-detail-card">
                <div className="news-card-picture" style={{'backgroundImage': `url(${newsItem.picture})`}}>
                </div>
                <div className="news-card-information">
                    <div className="news-card-date">
                        <p>{isNew ? <div className="new-box">جدید</div> : ''}</p>
                        <p>{convertDate(newsItem.date_created)}</p>
                    </div>
                    <div className="news-card-body">
                        <p>{newsItem.text}</p>
                    </div>
                </div>
            </div>
        </Fade>
    );
}