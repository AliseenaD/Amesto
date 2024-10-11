import React, { useEffect, useState } from "react";
import '../../styles/adminStyles.css';
import { IndividualProps } from "../../../types/productTypes";
import { useAuthToken } from "../../../AuthTokenContext";
import { toast } from 'react-toastify';
import { editProduct } from "../../../utility/productsApi";

export default function EditIndividualProduct({ product }: IndividualProps) {
    const { accessToken } = useAuthToken();
    const [settingOpen, setSettingOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: product.id,
        type: product.type,
        brand: product.brand,
        model: product.model,
        storage: product.storage || '',
        image: null as File | null,
    });
    const [variants, setVariants] = useState(product.variants || []);

    // Update the form data when the product changes
    useEffect(() => {
        setFormData({
            id: product.id,
            type: product.type,
            brand: product.brand,
            model: product.model,
            storage: product.storage || '',
            image: null,
        });
        setVariants(product.variants || []);
    }, [product]);

    // Function to handle the image change if there is one
    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
        }
    }

    // Alters the form upon input change
    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Function to handle any variant change
    function handleVariantChange(index: number, field: string, value: string) {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value};
        setVariants(newVariants);
    }

    // Add a new variant
    const addVariant = () => {
        setVariants([...variants, { color: "", price: "", quantity: 0 }]);
    };

    // Remove a variant
    const removeVariant = (index: number) => {
        const newVariants = variants.filter((_, i) => i !== index);
        setVariants(newVariants);
    };

    // Update the product once the form has been submitted
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const updatedProd = {
            ...formData,
            variants: variants
        }
        try {
            const result = await editProduct(updatedProd, accessToken);
            if (result && result.success) {
                toast.success('Updated product successfully');
                setSettingOpen(false);
                return;
            }
            else {
                toast.error('Failed to update product');
                throw new Error(result?.error || 'Failed to update product');
            }
        }
        catch (error) {
            console.error("Error occurred while updating the product", error);
            toast.error('Failed to update product');
        }
    }

    return (
        <>
            <div className="individual-edit-product" onClick={() => setSettingOpen(true)}>
                {product.brand} {product.model} {product.storage ? `- ${product.storage}GB`: ''} 
            </div>
            {settingOpen && (
                <div className={`individual-product-form ${settingOpen ? ' open' : ''}`}>
                    <form className="edit-product-form" onSubmit={handleSubmit}>
                        <label htmlFor="type">Product Type</label>
                        <select id="type" name="type" value={formData.type} onChange={handleInputChange} required>
                            <option value="Phone">Phone</option>
                            <option value="Speaker">Speaker</option>
                        </select>

                        <label htmlFor="brand">Product Brand</label>
                        <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleInputChange} required />

                        <label htmlFor="model">Product Model</label>
                        <input type="text" id="model" name="model" value={formData.model} onChange={handleInputChange} required />

                        {formData.type === 'Phone' && (
                            <>
                                <label htmlFor="storage">Product Storage (GB)</label>
                                <input type="number" id="storage" name="storage" value={formData.storage} onChange={handleInputChange} />
                            </>
                        )}

                        <label htmlFor="image">Product Image</label>
                        <input type="file" id="image" onChange={handleImageChange} accept="image/*" />

                        <label>Variants</label>
                        {variants.map((variant, index) => (
                            <div key={index} className="variant-form">
                                <input
                                    type="text"
                                    placeholder="Color (hex)"
                                    value={variant.color}
                                    onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                    title="Enter a valid hex color code"
                                />
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={variant.price}
                                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    value={variant.quantity}
                                    onChange={(e) => handleVariantChange(index, 'quantity', e.target.value)}
                                    min="0"
                                    required
                                />
                                <button type="button" className="form-buttons" id="remove-variant" onClick={() => removeVariant(index)}>Remove</button>
                            </div>
                        ))}
                        <button type="button" className="form-buttons" id="add-variant" onClick={addVariant}>Add Variant</button>

                        <button type="submit" className="form-buttons" id="submit-button">Update Product</button>
                        <button type="button" className="form-buttons" id="cancel-button" onClick={() => setSettingOpen(false)}>Cancel</button>
                    </form>
                </div>
            )}
        </>
    );
}