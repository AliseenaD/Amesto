import React, { useState } from "react";
import "../styles/registerStyles.css";
import { useAuthToken } from "../../AuthTokenContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [loginSelected, setLoginSelected] = useState<boolean>(true);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { accessToken, login } = useAuthToken();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigator = useNavigate();
    const [error, setError] = useState<string>('');

    // Function that handles the submit of the login form
    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            // First log in to get the access token needed to verify the user
            const loginResponse = await login(email, password);
            if (!loginResponse || !loginResponse.access) {
                setError('نام کاربری یا رمز عبور اشتباه است');
                throw new Error("Login error");
            }
            // Now verify user with the access token
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/verify_user/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${loginResponse.access}` 
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            // Check response and provide error message
            if (!response.ok) {
                switch (response.status) {
                    case 404:
                        setError("هیچ کاربری با این آدرس ایمیل پیدا نشد");
                        break;
                    case 400:
                        setError('لطفاً ایمیل و رمز عبور را وارد کنید');
                        break;
                    default:
                        setError('خطا در ورود به سیستم');
                }
                return;
            }
            // Navigate to home page
            const data = await response.json();
            if (data.user) {
                navigator('/');
            }
            else {
                throw new Error("An error occurred while logging in after successful response");
            }
        } 
        catch (error) {
            console.error("An error occurred while trying to login:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Function that handles the registration of a user
    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            // First register the user in the table
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            // Check response and set error depending on the status cose
            if (!response.ok) {
                switch (response.status) {
                    case 409:
                        setError('این ایمیل قبلاً ثبت شده است');
                        break;
                    case 400:
                        setError('لطفاً ایمیل و رمز عبور را وارد کنید');
                        break;
                    default:
                        setError('خطا در ثبت نام');
                }
                return;
            }
            
            // Now login to get the access token
            const loginResponse = await login(email, password)
            if (loginResponse) {
                navigator('/');
            }
            else {
                throw new Error("An error occurred while logging in after successful response");
            }
        }
        catch (error) {
            console.error("An error occurred while trying to sign up:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    // Handles the form switch, resets all states
    const handleFormSwitch = () => {
        setLoginSelected(!loginSelected);
        setError('');
        setEmail('');
        setPassword('');
    }

    // Login form
    const loginForm = () => {
        return (
            <form className="register-form" onSubmit={(e) => handleLogin(e)}>
                <h1 style={{fontSize: '40px'}}>AMESTO</h1>
                <h3 style={{fontSize: '24px'}}>وارد شوید</h3>
                <div className="sign-up-option">
                    <div className="sign-up-button" onClick={handleFormSwitch}>ثبت نام کنید</div>
                    <p>حساب کاربری ندارید؟ </p>
                </div>
                {error ? (
                    <div className="error-container">
                        {error}
                    </div>
                ) : ''}
                <div className="registration-form-group">
                    <label htmlFor="email" className="registration-label">ایمیل</label>
                    <input id="email" type="email" className="registration-input" value={email} onChange={(e) => setEmail(e.target.value)}></input>
                </div>
                <div className="registration-form-group">
                    <label htmlFor="password" className="registration-label">رمز عبور</label>
                    <input id="password" type="password" className="registration-input" value={password} onChange={(e) => setPassword(e.target.value)}></input>
                </div>
                <button type="submit" className="registration-submit" disabled={!email || !password}>{isLoading ? 'Loading...' : 'وارد شوید'}</button>
                <button className="registration-cancel" onClick={() => navigator('/')}>لغو کنید</button>
            </form>
        );
    }

    // Register form
    const registerForm = () => {
        return (
            <form className="register-form" onSubmit={(e) => handleRegister(e)}>
                <h1 style={{fontSize: '40px'}}>AMESTO</h1>
                <h3 style={{fontSize: '24px'}}>ثبت نام کنید</h3>
                <div className="sign-up-option">
                    <div className="sign-up-button" onClick={handleFormSwitch}>وارد شوید</div>
                   <p>از قبل حساب کاربری دارید؟</p>
                </div>
                {error ? (
                    <div className="error-container">
                        {error}
                    </div>
                ) : ''}
                <div className="registration-form-group">
                    <label htmlFor="email" className="registration-label">ایمیل</label>
                    <input id="email" type="email" className="registration-input" value={email} onChange={(e) => setEmail(e.target.value)} required></input>
                </div>
                <div className="registration-form-group">
                    <label htmlFor="password" className="registration-label">رمز عبور</label>
                    <input id="password" type="password" className="registration-input" value={password} onChange={(e) => setPassword(e.target.value)} required></input>
                </div>
                <button type="submit" className="registration-submit" disabled={!email || !password}>{isLoading ? 'Loading...' : 'ثبت نام کنید'}</button>
                <button className="registration-cancel" onClick={() => navigator('/')}>لغو کنید</button>
            </form>
        );
    }

    return (
        <div className="register-container">
            {loginSelected ? loginForm() : registerForm()}
        </div>
    );
}