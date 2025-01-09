import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const AuthTokenContext = React.createContext();

function AuthTokenProvider({ children }) {
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
    const navigator = useNavigate();

    // Store the access token in local storage so page refreshes will not log the user out
    useEffect(() => {
        if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
        }
        else {
            localStorage.removeItem('accessToken');
        }
    }, [accessToken]);

    // Store the refresh token in local storage so page refreshes will not log user out or remove it
    useEffect(() => {
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
        else {
            localStorage.removeItem('refreshToken');
        }
    }, [refreshToken])

    // Check if the token is expired and get a refresh token if needed, otherwrise log out
    useEffect(() => {
        const checkTokenExpiration = async () => {
            if (accessToken && isTokenExpired(accessToken)) {
                // Try to refresh the token
                const refreshSuccess = await refreshAccessToken();
                // If refresh token expired or was not able to refresh, logout
                if (!refreshSuccess) {
                    logout();
                }
            }
        }

        checkTokenExpiration();
        // Check every minute or so
        const interval = setInterval(checkTokenExpiration, 60000);
        return () => clearInterval(interval);
    }, [accessToken]);

    // Check if the access token is expired so we can log out when needed
    function isTokenExpired(token) {
        if (!token) {
            return true;
        }

        try {
            // Decode the token and check to see if expiration time is before the current time or not
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp < currentTime;
        }
        catch (error) {
            return true;
        }
    }

    // Function to handle the login of the user
    async function login(email, password) {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: email,
                    password
                })
            });

            // Check the response
            if (!response.ok) {
                const errorData = await response.json();  // Get the error message
                console.log('Login error details:', errorData);
                return false;
            }

            // Set access token and refresh token
            const data = await response.json();
            setAccessToken(data.access);
            setRefreshToken(data.refresh);

            return data;
        }
        catch (error) {
            console.error("Login error:", error);
            return false;
        }
    }

    // Clears the sessions access token for logging out
    function logout() {
        setAccessToken(null);
        setRefreshToken(null);
        // Navigate back to home page
        navigator('/');
    }

    // Function to refresh the token 
    async function refreshAccessToken() {
        if (!refreshToken || isTokenExpired(refreshToken)) {
            return false;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh: refreshToken
                })
            });

            // Check response
            if (!response.ok) {
                throw new Error("Network response failes");
            }

            const data = await response.json();
            setAccessToken(data.access);
            
            return data;
        } 
        catch (error) {
            console.error("Error refreshing token:", error);
            return false;
        }
    }

    const value = { 
        accessToken,
        refreshToken,
        login,
        refreshAccessToken,
        logout
    };
    return (
        <AuthTokenContext.Provider value={value}>
            { children }
        </AuthTokenContext.Provider>
    );
}

const useAuthToken = () => useContext(AuthTokenContext);

export { useAuthToken, AuthTokenProvider };