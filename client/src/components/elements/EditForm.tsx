import React, { useState } from "react";
import '../styles/AdminStyles.css';
import { IndividualProps } from "../../types/productTypes";

export function EditForm({ product }: IndividualProps) {
    const [variants, setVariants] = useState([]);

    // Fetch all of the variants based on the product
    async function fetchVariants() {
        
    }

    return (
        <form>
            
        </form>
    );
}