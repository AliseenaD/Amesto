import React, { useState } from "react";
import '../styles/elementStyles.css';
import { Fade } from "react-awesome-reveal";
import AddProduct from "./AddProduct.tsx";
import AllProducts from "./AllProducts.tsx";
import DeleteProduct from "./DeleteProduct.tsx";

export default function AdminForms() {
    const allOptions = [
        {
            title: 'Order History'
        },
        {
            title: 'Update Price or Quantity'
        },
        {
            title: 'Delete Product',
            component: <DeleteProduct />
        },
        {
            title: 'Add New Product',
            component: <AddProduct />
        },
        {
            title: 'All Products',
            component: <AllProducts />
        }
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