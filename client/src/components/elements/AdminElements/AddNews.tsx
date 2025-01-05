import React, { useRef, useState } from "react";
import "./adminStyles.css";
import { useAuthToken } from "../../../AuthTokenContext";
import { toast } from 'react-toastify';
import { Fade } from "react-awesome-reveal";
import { IoColorPalette } from "react-icons/io5";
import { addNews } from "../../../utility/newsApi";

export default function AddNews() {
    const { accessToken } = useAuthToken()
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        text: '',
        image: null
    })

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Handle image upload
    const handleImageChange = (e) => {
        setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
    }

    // Handle form submit
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            const result = await addNews(formData, accessToken);
            // Handle result success
            if (result!.success) {
                toast.success("News item added successfully");
                // Reset form data
                setFormData({
                    text: '',
                    image: null
                });
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
            else {
                throw new Error(result!.error || 'Failed to add news item' );
            }
        }
        catch (error) {
            console.error("Error while creating new news item:", error);
            toast.error("An error occurred while creating a new news item")
        }
    }

    return (
        <Fade triggerOnce>
            <div className="add-news-container">
                <h2 className="form-title">Add New News</h2>
                <form className="news-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3 className="section-title">News Details</h3>
                        <div className="form-group">
                            <label htmlFor="text">News Text</label>
                            <input type="text" id="news-text" value={formData.text} name="text" onChange={handleInputChange} required></input>
                        </div>
                        <div className="form-group">
                            <label htmlFor="image">News Photo</label>
                            <input ref={fileInputRef} type="file" id="image" accept="image/*" onChange={handleImageChange} required></input>
                        </div>
                    </div>
                <button type="submit" className="submit-button">
                    <IoColorPalette /> Add New News
                </button>
                </form>
            </div>
        </Fade>
    )
}