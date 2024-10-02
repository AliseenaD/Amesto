import React, { useState } from "react";
import '../styles/adminStyles.css';
import { IndividualProps } from "../../types/productTypes";

export default function EditIndividualProduct({ product }: IndividualProps) {
    const [settingOpen, setSettingOpen] = useState(false);




    return (
        <>
            <div className="individual-edit-product" key={product._id} onClick={() => setSettingOpen(true)}>
                {product.brand} {product.model} {product.storage ? `- ${product.storage}GB`: ''} 
            </div>
            <div className={`individual-product-form ${settingOpen ? ' open' : ''}`}>
                <form>
                    
                </form>
            </div>
        </>
    );
}