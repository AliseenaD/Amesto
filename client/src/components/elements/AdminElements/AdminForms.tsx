import React, { useState } from "react";
import '../../styles/adminStyles.css';
import { Fade } from "react-awesome-reveal";
import AddProduct from "./AddProduct.tsx";
import AllProducts from "./AllProducts.tsx";
import DeleteProduct from "./DeleteProduct.tsx";
import EditProducts from "./EditProducts.tsx";
import OrderStatus from "./OrderStatus.tsx";

export default function AdminForms() {
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
    ];
    const[selection, setSelection] = useState(allOptions[0]);
    const[products, setProducts] = useState([]);



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