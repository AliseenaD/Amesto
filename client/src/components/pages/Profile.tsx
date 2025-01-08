import React, { useEffect, useState } from "react";
import { useAuthToken } from "../../AuthTokenContext.js";
import AdminForms from "../elements/AdminElements/AdminForms.tsx";
import { getProfile } from "../../utility/profileApi.js";
import { User } from "../../types/productTypes.ts";
import PersonalInfo from "../elements/ProfileElements/PersonalInfo.tsx";
import OrderStats from "../elements/ProfileElements/OrderStats.tsx";
import Footer from "../elements/Footer.tsx";

export default function Profile() {
    const { accessToken } = useAuthToken();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accessToken) {
            getRole();
        }
    }, [accessToken]);

    // Get the user profile and set role to the profile
    async function getRole() {
        try {
            const profile = await getProfile(accessToken);
            setProfile(profile);
        }
        catch (error) {
            console.error('Error fetching role', error);
        }
        finally {
            setLoading(false);
        }
    }

    if (loading || !profile) {
        return (
            <>
                <p>Loading...</p>
            </>
        )
    }

    // Decide which screen to present based on role
    if (profile.role === 'Admin') {
        return (
            <>
                <AdminForms />
                <Footer />
            </>
        )
    }
    else {
        return (
            <>
                <PersonalInfo profile={profile} />
                <OrderStats orders={profile.order_history} />
                <Footer />
            </>
        )
    }
}