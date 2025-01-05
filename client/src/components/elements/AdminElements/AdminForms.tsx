import React, { useState } from "react";
import "./adminStyles.css";
import { Fade } from "react-awesome-reveal";
import AddProduct from "./AddProduct.tsx";
import AllProducts from "./AllProducts.tsx";
import DeleteProduct from "./DeleteProduct.tsx";
import EditProducts from "./EditProducts.tsx";
import OrderStatus from "./OrderStatus.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import AddNews from "./AddNews.tsx";
import DeleteNews from "./DeleteNews.tsx";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

export default function AdminForms() {
    const { logout } = useAuth0();
    const [page, setPage] = useState<number>(1);
    const [hasNext, setHasNext] = useState<boolean>(true);
    const [hasPrevious, setHasPrevious] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
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
                {
                    selection.component
                }
            </div>
        </Fade>
    );
}