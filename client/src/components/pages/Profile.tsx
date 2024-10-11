import React, { useEffect, useState } from "react";
import NavBar from "../elements/NavBar.tsx";
import { useAuthToken } from "../../AuthTokenContext.js";
import AdminForms from "../elements/AdminElements/AdminForms.tsx";
import { getProfile } from "../../utility/profileApi.js";

export default function Profile() {
    const { accessToken } = useAuthToken();
    const [role, setRole] = useState('');

    useEffect(() => {
        if (accessToken) {
            getRole();
        }
    }, [accessToken]);

    // Get the user profile and set role to the profile
    async function getRole() {
        try {
            const profile = await getProfile(accessToken);
            console.log(profile);
            setRole(profile.role);
        }
        catch (error) {
            console.error('Error fetching role', error);
        }
    }

    return(
        <>
            <NavBar />
            {
                role === 'Admin' ? <AdminForms /> : <p>Basic</p>
            }
        </>
    );
}