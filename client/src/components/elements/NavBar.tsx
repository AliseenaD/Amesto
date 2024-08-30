import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import '../styles/elementStyles.css';
import { Link } from "react-router-dom";
import { Fade } from 'react-awesome-reveal';
import { BiSolidUser } from "react-icons/bi";
import { TiShoppingCart } from "react-icons/ti";

export default function NavBar() {
    const { loginWithRedirect, isAuthenticated } = useAuth0();
    const [menu, setMenu] = useState(false);
    const [windowDim, setWindowDim] = useState(getWindowDimensions());

    // Get window dimensions
    function getWindowDimensions() {
        const { innerWidth: width, innerHeight: height } = window;
        return { width, height }
    }
    
    // Update window dimensions
    useEffect(() => {
        function handleResize() {
            setWindowDim(getWindowDimensions());
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset menu at certain sizes
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 767) {
                setMenu(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [])

    return (
        <Fade triggerOnce direction="up">
            <div className="nav-content">
                <div className="home-link">
                    <Link className="nav-link" id="home-link" to='/'>AMESTO</Link>
                </div>
                <div className="hamburger" onClick={() => setMenu(!menu)} >
                    <div className="burger-line"></div>
                    <div className="burger-line"></div>
                    <div className="burger-line"></div>
                </div>
                <ul className={`list-links ${menu ? ' open' : ''}`}>
                    <li className="left-links">
                        <Link className="nav-link" to='/phones'>PHONES</Link>
                    </li>
                    <li className="left-links">
                        <Link className="nav-link" to='/speakers'>SPEAKERS</Link>
                    </li>
                    {
                        isAuthenticated ? 
                        <>
                            <li className="right-links"><Link className="nav-link" id="cart" to='/cart'>{windowDim.width >= 767 ? <TiShoppingCart size={30} color="#16181c" /> : 'CART'}</Link></li>
                            <li className="right-links"><Link className="nav-link" id="profile" to='/profile'>{windowDim.width >= 767 ? <BiSolidUser size={30} color="#16181c" /> : 'PROFILE'}</Link></li>
                        </>
                        : 
                        <li className="right-links">
                            <button className="login-button" onClick={() => loginWithRedirect()}>LOGIN / REGISTER</button>
                        </li>
                    }
                </ul>
            </div>
        </Fade>
    );
}