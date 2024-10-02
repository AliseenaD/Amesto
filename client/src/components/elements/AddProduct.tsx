import React, { useState } from "react";
import '../styles/adminStyles.css';
import { Fade } from "react-awesome-reveal";
import { useAuthToken } from "../../AuthTokenContext";

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
    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
      };
    
    // Add new variant
    const addVariant = () => {
    setVariants([...variants, { color: "", price: "", quantity: "" }]);
    };
    
    // Remove variant
    const removeVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
    };

    // Handle the submit
    async function handleSubmit(e) {
        e.preventDefault();
        const formDataToSend = new FormData();

        // Add main product to data
        Object.keys(formData).forEach((key) => {
            if (key === 'image') {
                formDataToSend.append('image', formData.image!);
            }
            else {
                formDataToSend.append(key, formData[key]);
            }
        });

        // Append variants
        formDataToSend.append('variants', JSON.stringify(variants));

        // Send data
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                method: 'POST',
                body: formDataToSend,
            });
            if (!response.ok) {
                throw new Error('Failed to add product');
            }
            alert('Added product successfully');
        }
        catch(error) {
            console.error('Error adding product', error);
            alert('An error occurred while adding product');
        }
        setFormData({
            type: '',
            brand: '',
            model: '',
            storage: '',
            image: null,
        });
        setVariants([{
            color: '', price: '', quantity: ''
        }]);
    }

    return (
        <Fade triggerOnce>
            <form onSubmit={handleSubmit} className="product-form">
                <label className="form-label">Product</label>
                <label htmlFor="option">Product Type</label>
                <select id="options" name="type" value={formData.type} onChange={handleInputChange} required>
                    <option value="">--Please choose an option--</option>
                    <option value='Phone'>Phone</option>
                    <option value='Speaker'>Speaker</option>
                </select>
                <label htmlFor="brand">Product Brand</label>
                <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Ex: Apple" required></input>
                <label htmlFor="model">Product Model</label>
                <input type="text" id="model" name="model" value={formData.model} onChange={handleInputChange} placeholder="Ex: iPhone 15 Pro" required></input>
                {
                    formData.type === 'Phone' ? (
                        <>
                            <label htmlFor="storage">Product Storage (GB)</label>
                            <input type="number" id="storage" name="storage" value={formData.storage} onChange={handleInputChange} placeholder="Ex: 128"></input>
                        </>
                    ) : ''
                }
                <label htmlFor="image">Product Image</label>
                <input type="file" id="image" onChange={handleImageChange} accept="image/*" required></input>
                <label className="form-label">Variants</label>
                {
                    variants.map((variant, index) => (
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
                            <button className="form-buttons" id="remove-variant" type="button" onClick={() => removeVariant(index)}>Remove</button>
                        </div>
                ))}
                <button className="form-buttons" id="add-variant" type="button" onClick={addVariant}>Add Variant</button>
                <button type="submit" className="form-buttons" id="submit-button">Add New Product</button>
            </form>     
        </Fade>
    );
}