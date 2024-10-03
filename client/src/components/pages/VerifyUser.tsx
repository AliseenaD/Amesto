import React, { useEffect } from "react";
import { useAuthToken } from "../../AuthTokenContext";
import { useNavigate } from "react-router-dom";

export default function VerifyUser() {
    const navigate = useNavigate();
    const { accessToken } = useAuthToken();

    // Verify user is in database upon login or add them to it
    useEffect(() => {
        async function verifyUser() {
            const data = await fetch(`${process.env.REACT_APP_API_URL}/users/verify_user`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({})
            });
            const user = await data.json();
            console.log("Response status:", data.status)
            console.log(user)
            if (user.user.auth0Id) {
                navigate('/');
            }
            else {
                console.error('An error has occurred');
            }
        }
        if (accessToken) {
            verifyUser();
        }
    }, [accessToken, navigate]);

    return (
        <p>Loading...</p>
    );
}