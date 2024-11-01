import React, { useState } from "react";
import "../../styles/adminStyles.css";
import { Fade } from "react-awesome-reveal";
import { useAuthToken } from "../../../AuthTokenContext";
import { addProduct } from "../../../utility/productsApi";
import { toast } from 'react-toastify';
import { IoAdd, IoColorPalette, IoRemove } from "react-icons/io5";

export default function AddProduct() {
    const { accessToken } = useAuthToken();

    const [formData, setFormData] = useState({
        type: '',
        brand: '',
        model: '', 
        storage: '',
        image: null,
    });
    const [variants, setVariants] = useState([{ color: '', price: '', quantity: '' }]);

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Handle image change
    const handleImageChange = (e) => {
        setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
    }

    // Handle variant change
    const handleVariantChange = (index: number, field: string, value: string) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };
    
    // Add new variant
    const addVariant = () => {
    setVariants([...variants, { color: "", price: "", quantity: "" }]);
    };
    
    // Remove variant
    const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
    };

    // Handle the submit
    async function handleSubmit(e) {
        e.preventDefault()
        const prodData = {
            ...formData,
            variants: variants
        };

        try {
            const result = await addProduct(prodData, accessToken);
            if (result!.success) {
                toast.success("Successfully created product!");

                // reset the form information
                setFormData({
                    type: '',
                    brand: '',
                    model: '',
                    storage: '',
                    image: null,
                });
                setVariants([{ color: '', price: '', quantity: '' }])
            }
            else {
                throw new Error(result!.error || 'Failed to add product' );
            }
        }
        catch (error) {
            console.error("Error while creating new product:", error);
            toast.error("An error occurred while creating a new product")
        }
    }

    return (
        <Fade triggerOnce>
            <div className="add-product-container">
                <h2 className="form-title">Add New Product</h2>
                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-section">
                        <h3 className="section-title">Product Details</h3>
                        <div className="form-group">
                            <label htmlFor="type">Product Type</label>
                            <select id="type" name="type" value={formData.type} onChange={handleInputChange} required>
                                <option value="">--Please choose an option--</option>
                                <option value='Phone'>Phone</option>
                                <option value='Speaker'>Speaker</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="brand">Product Brand</label>
                            <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Ex: Apple" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="model">Product Model</label>
                            <input type="text" id="model" name="model" value={formData.model} onChange={handleInputChange} placeholder="Ex: iPhone 15 Pro" required />
                        </div>
                        {formData.type === 'Phone' && (
                            <div className="form-group">
                                <label htmlFor="storage">Product Storage (GB)</label>
                                <input type="number" id="storage" name="storage" value={formData.storage} onChange={handleInputChange} placeholder="Ex: 128" />
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="image">Product Image</label>
                            <input type="file" id="image" onChange={handleImageChange} accept="image/*" required />
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3 className="section-title">Product Variants</h3>
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
                                    title="price"
                                />
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    value={variant.quantity}
                                    onChange={(e) => handleVariantChange(index, 'quantity', e.target.value)}
                                    min="0"
                                    title="quantity"
                                    required
                                />
                                <button className="remove-variant" type="button" onClick={() => removeVariant(index)}>
                                    <IoRemove /> Remove
                                </button>
                            </div>
                        ))}
                        <button className="add-variant" type="button" onClick={addVariant}>
                            <IoAdd /> Add Variant
                        </button>
                    </div>
                    
                    <button type="submit" className="submit-button">
                        <IoColorPalette /> Add New Product
                    </button>
                </form>     
            </div>
        </Fade>
    );
}