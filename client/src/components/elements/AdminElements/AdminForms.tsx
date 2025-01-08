import React, { useState } from "react";
import "./adminStyles.css";
import { Fade } from "react-awesome-reveal";
import AddProduct from "./AddProduct.tsx";
import AllProducts from "./AllProducts.tsx";
import DeleteProduct from "./DeleteProduct.tsx";
import EditProducts from "./EditProducts.tsx";
import OrderStatus from "./OrderStatus.tsx";
import AddNews from "./AddNews.tsx";
import DeleteNews from "./DeleteNews.tsx";
import { useAuthToken } from "../../../AuthTokenContext.js";
import { IoIosLogOut } from "react-icons/io";

export default function AdminForms() {
    const { logout } = useAuthToken();

    const allOptions = [
        {
            title: 'همه محصولات',
            component: <AllProducts />
        },
        {
            title: 'افزودن محصول جدید',
            component: <AddProduct />
        },
        {
            title: 'تاریخچه سفارش',
            component: <OrderStatus />
        },
        {
            title: 'به روز رسانی محصول',
            component: <EditProducts />
        },
        {
            title: 'حذف محصول',
            component: <DeleteProduct />
        },
        {
            title: 'اخبار جدید ایجاد کنید',
            component: <AddNews />
        },
        {
            title: 'حذف خبر',
            component: <DeleteNews />
        }
    ];
    const[selection, setSelection] = useState(allOptions[0]);

    return (
        <Fade triggerOnce direction="up">
            <div className="forms-content">
                <div className="form-options">
                    <ul className="options-list">
                        {
                            allOptions.map((option) => (
                                <li key={option.title} className={ option.title === selection.title ? 'selected-option' : '' } onClick={() => setSelection(option)} >{option.title}</li>
                            ))
                        }
                    </ul>
                </div>
                <div className="logout-section">
                    <button className="admin-logout" onClick={logout}><IoIosLogOut size={20} color="red" />خروج</button>
                </div>
                {
                    selection.component
                }
            </div>
        </Fade>
    );
}