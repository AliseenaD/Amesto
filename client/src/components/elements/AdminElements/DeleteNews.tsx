import React, { useEffect, useRef, useState } from "react";
import "./adminStyles.css";
import { NewsCardProps, NewsItem } from "../../../types/productTypes";
import { deleteNewsItem, getNews } from "../../../utility/newsApi";
import { useAuthToken } from "../../../AuthTokenContext";
import { Fade } from "react-awesome-reveal";
import { IoTrashOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

export default function DeleteNews() {
    const { accessToken } = useAuthToken();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [page, setPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasNext, setHasNext] = useState<boolean>(true);
    const [hasPrevious, setHasPrevious] = useState<boolean>(false);

    useEffect(() => {
        fetchNews();
    }, [page]);

    // Function that fetches the current page of news
    async function fetchNews() {
        setIsLoading(true);
        try {
            const result = await getNews(page);

            // Handle pagination state 
            if (!result.next) {
                setHasNext(false);
            }
            else {
                setHasNext(true);
            }
            if (!result.previous) {
                setHasPrevious(false);
            }
            else {
                setHasPrevious(true);
            }
            setNews(result.results);
        }
        catch (error) {
            console.error("There was an error loading the news:", error);
        }
        finally {
            setIsLoading(false)
        }
    }

    // Delete a news item
    async function deleteNews(newsId: number) {
        try {
            const response = await deleteNewsItem(newsId, accessToken);
            // If successful then update by removing the news item on the local end
            if (response && response.success) {
                toast.success("News successfully deleted")
                const filtered = news.filter(item => item.id !== newsId);
                setNews(filtered);
            }
            else {
                toast.error("News was not successfully deleted");
                throw new Error(response?.error || "Failed to delete news");
            }
        } 
        catch (error) {
            console.error("There was an error while deleting the news item:", error);
        }
    }

    // Function to convert date to Persian date time
    function convertDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('fa-IR', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Now a small function to return the news cards
    function NewsCard({ newsItem }: NewsCardProps) {
        return (
            <div className="delete-news-card">
                <div className="news-info">
                    <h3>{convertDate(newsItem.date_created)}</h3>
                    <p>{newsItem.text}</p>
                </div>
                <button className="delete-button" onClick={() => deleteNews(newsItem.id)}>
                    <IoTrashOutline /> Delete
                </button>
            </div>
        );
    }
    
    // Handles the pagination when the page button is clicked
    function handlePageButtonPress(increment: number) {
        setPage(currPage => currPage + increment);
    }

    // Convert number to farsi
    const toPersianNumbers = (value: number) => {
        const persianNumbers = {
            '0': '۰',
            '1': '۱',
            '2': '۲',
            '3': '۳',
            '4': '۴',
            '5': '۵',
            '6': '۶',
            '7': '۷',
            '8': '۸',
            '9': '۹',
            '.': '.'
        };

        return value.toString().replace(/[0-9.]/g, c => persianNumbers[c] || c);
    }

    return (
        <Fade triggerOnce>
            <div className="delete-news-container">
                <div className="delete-news-grid">
                    {news.map(item => <NewsCard newsItem={item} />)}
                </div>
                <div className="news-loader"></div>
            </div>
            <div className="pagination-buttons-container">
                <button className="pagination-arrow" disabled={isLoading || !hasPrevious} onClick={() => handlePageButtonPress(-1)}><MdOutlineKeyboardArrowLeft size={20} /></button>
                <div className="pagination-indicator">{toPersianNumbers(page)}</div>
                <button className="pagination-arrow" disabled={isLoading || !hasNext} onClick={() => handlePageButtonPress(1)}><MdOutlineKeyboardArrowRight size={20} /></button>
            </div>
        </Fade>
    );
}