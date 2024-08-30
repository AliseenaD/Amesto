import React from "react";
import NavBar from "../elements/NavBar.tsx";
import BannerImage from "../elements/BannerImage.tsx";
import BannerPhoto from "../../assets/HomeBanner.jpg";
import { useAuth0 } from "@auth0/auth0-react";

export default function Home() {
    const { logout } = useAuth0();

    return (
        <>
            <NavBar />
            <BannerImage title='AMESTO' image={BannerPhoto} />
            <button onClick={() => logout()}>Logout</button>
        </>
    );
}
