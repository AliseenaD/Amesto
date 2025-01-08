import React from "react";
import '../../../components/styles/profileStyles.css';
import { ProfileProps } from "../../../types/productTypes";
import { IoPersonCircleOutline } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import { Fade } from "react-awesome-reveal";
import { ImProfile } from "react-icons/im";
import { useAuthToken } from "../../../AuthTokenContext";

export default function PersonalInfo({ profile }: ProfileProps) {
    const { logout } = useAuthToken();
    console.log('Personal info:', profile);

    // Function to convert date to Persian date time
    function convertDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('fa-IR', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    return (
        <Fade triggerOnce direction="up">
            <div className="profile-info-content">
                <div className="info-header">
                    <p>اطلاعات شخصی</p>
                    <ImProfile color="white" size={40}/>
                </div>
                <div className="profile-header">
                    <div className="header-text">
                        <p id="email-header">{profile.email}</p>
                        <p id="member-header">عضو از زمان: {convertDate(profile.date_joined)}</p>
                    </div>
                    <IoPersonCircleOutline size={90} color="#3b82f6" />
                </div>
                <div className="info-specifics">
                    <div className="email-specifics">
                        <p id="member-header">{profile.email}</p>
                        <p id="email-specific-header">:ایمیل</p>
                    </div>
                    <button className="logout-button" onClick={logout}><IoIosLogOut size={20} color="red" />خروج</button>
                </div>
            </div>
        </Fade>
    );
}