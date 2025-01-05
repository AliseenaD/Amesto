import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/elementStyles.css";
import { Link } from "react-router-dom";
import { Fade } from 'react-awesome-reveal';
import { BiSolidUser } from "react-icons/bi";
import { TiShoppingCart } from "react-icons/ti";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useCart } from "../../CartContext";


export default function NavBar() {
    const { loginWithRedirect, isAuthenticated } = useAuth0();
    const [menu, setMenu] = useState(false);
    const [windowDim, setWindowDim] = useState(getWindowDimensions());
    const [accessoriesOpen, setAccessoriesOpen] = useState(false);
    const { cartCount } = useCart();

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
                setAccessoriesOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Handles what happens upon hamburger click
    const handleHamburgerClick = () => {
        setMenu(!menu);
        // If closing menu set accessories to false
        if (menu) {
            setAccessoriesOpen(false); 
        }
    }

    // The mobile accessory window for navbar
    const mobileAccessoryWindow = () => {
        return (
            <ul className={`mobile-dropdown ${accessoriesOpen ? 'mobile-active' : ''}`}>
                <li className="right-links"><Link className="nav-link" id="watches" to='/watches'>ساعت</Link></li>
                <li className="right-links"><Link className="nav-link" id="headphones" to='/headphones'>هدفون</Link></li>
                <li className="right-links"><Link className="nav-link" id="accessories" to='/accessories'>لوازم جانبی گوشی</Link></li>
            </ul>
        );
    }

    return (
        <div className="nav-wrapper">
            <Fade triggerOnce direction="up">
                <div className="nav-content">
                    <div className="home-link">
                        <Link className="nav-link" id="home-link" to='/'>AMESTO</Link>
                    </div>
                    <div className="hamburger" onClick={handleHamburgerClick} >
                        <div className="burger-line"></div>
                        <div className="burger-line"></div>
                        <div className="burger-line"></div>
                    </div>
                    <ul className={`list-links ${menu ? ' open' : ''}`}>
                        <li className="left-links">
                            <Link className="nav-link" to='/phones'>تلفن ها</Link>
                        </li>
                        <li className="left-links">
                            <Link className="nav-link" to='/speakers'>بلندگوها</Link>
                        </li>
                        <li className="left-links">
                            <Link className="nav-link" to='/news'>اخبار</Link>
                        </li>
                        <li className="left-links" id="accesory-link" {...(windowDim.width >= 767 ? {onMouseEnter: () => setAccessoriesOpen(true),onMouseLeave: () => setAccessoriesOpen(false)} 
                        : {onClick: () => setAccessoriesOpen(!accessoriesOpen)})}>
                        {windowDim.width < 767 ? <MdKeyboardArrowLeft size={25} className={`accessory-arrow ${accessoriesOpen ? 'arrow-active' : ''}`} />: ''} لوازم جانبی 
                            {windowDim.width >= 767 ? accessoriesOpen ? (
                                <ul className={`dropdown-links ${accessoriesOpen ? 'accessories-active' : ''}`}>
                                    <li className="right-links"><Link className="nav-link" id="watches" to='/watches'>ساعت</Link></li>
                                    <li className="right-links"><Link className="nav-link" id="headphones" to='/headphones'>هدفون</Link></li>
                                    <li className="right-links"><Link className="nav-link" id="accessories" to='/accessories'>لوازم جانبی گوشی</Link></li>
                                </ul>
                            ) : '' : mobileAccessoryWindow()}
                        </li>
                        {
                            isAuthenticated ? 
                            <>
                                <li className="right-links">
                                    <Link className="nav-link" id="cart" to='/cart'>
                                        <div className="cart-icon-container">
                                            {windowDim.width >= 767 ? (
                                                <>
                                                    <TiShoppingCart size={30} color="#16181c" />
                                                    {cartCount > 0 && (
                                                        <span className="cart-count">{cartCount}</span>
                                                    )}
                                                </>
                                            ) : 'سبد خرید'}
                                        </div>
                                    </Link>
                                </li>
                                <li className="right-links"><Link className="nav-link" id="profile" to='/profile'>{windowDim.width >= 767 ? <BiSolidUser size={30} color="#16181c" /> : 'نمایه'}</Link></li>
                            </>
                            : 
                            <li className="right-links">
                                <button className="login-button" onClick={() => loginWithRedirect()}>وارد شوید</button>
                            </li>
                        }
                    </ul>
                </div>
            </Fade>
        </div>
    );
}