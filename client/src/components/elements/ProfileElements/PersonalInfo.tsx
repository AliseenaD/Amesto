import React from "react";
import '../../styles/profileStyles.css';
import { useAuth0 } from "@auth0/auth0-react";
import { ProfileProps } from "../../../types/productTypes";
import { IoPersonCircleOutline } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import { Fade } from "react-awesome-reveal";
import { ImProfile } from "react-icons/im";

export default function PersonalInfo({ profile }: ProfileProps) {
    const { logout } = useAuth0();

    // Formats the date passed in
    function formatDate(dateString: string) {
        const date = new Date(dateString);

        const month = date.toLocaleString('default', { month: 'long' });
        const day = date.getDate();
        const year = date.getFullYear();

        return `${month} ${day}, ${year}`;
    }

    return (
        <Fade triggerOnce direction="up">
            <div className="profile-info-content">
                <div className="info-header">
                    <ImProfile color="white" size={40}/>
                    <p>اطلاعات شخصی</p>
                </div>
                <div className="profile-header">
                    <IoPersonCircleOutline size={90} color="#3b82f6" />
                    <div className="header-text">
                        <p id="email-header">{profile.email}</p>
                        <p id="member-header">عضو از زمان: {formatDate(profile.date_joined)}</p>
                    </div>
                </div>
                <div className="info-specifics">
                    <div className="email-specifics">
                        <p id="email-specific-header">Email:</p>
                        <p id="member-header">{profile.email}</p>
                    </div>
                    <button className="logout-button" onClick={() => logout()}><IoIosLogOut size={20} color="red" />خروج</button>
                </div>
            </div>
        </Fade>
    );
}