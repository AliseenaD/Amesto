// Get all products
export async function getProducts() {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products`);
        console.log("Response status:", response.status);
        console.log("Response type:", response.type);
        console.log("Response URL:", response.url);
        if (!response.ok) {
            throw new Error ('Netork response failed');
        }
        // Set cache and return it
        const data = await response.json();
        console.log("Retrieved data:", data);
        return data;
    }
    catch (error) {
        console.error('Error fetching products', error);
    }
}

// Add new product and its associated variants
export async function addProduct(product, accessToken) {
    try {
        // Must creat a form data object to upload the image correctly
        const formData = new FormData()
        formData.append('type', product.type);
        formData.append('brand', product.brand);
        formData.append('model', product.model);
        formData.append('storage', product.storage);
        formData.append('image', product.image);
        formData.append('variants', JSON.stringify(product.variants));

        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData
        });
        if (!response.ok) {
            throw new Error("Network response failed");
        }
        return { success: true }
    }
    catch (error) {
        console.error("There was an error while attempting to create a new product:", error);
    }
}

// Update product and its associated variants
export async function editProduct(product, accessToken) {
    try {
        // Create form data object and upload the image correctly
        const formData = new FormData();
        formData.append('type', product.type);
        formData.append('brand', product.brand);
        formData.append('model', product.model);
        formData.append('storage', product.storage);
        formData.append('image', product.image);
        formData.append('variants', JSON.stringify(product.variants));

        // Make the api call
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${product.id}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });
        if (!response.ok) {
            throw new Error('Network response failed');
        }
        const data = await response.json()
        return { success: true, data }
    }
    catch (error) {
        console.error("Error occurred while updating product", error);
        return { success: false, error: error.message };
    }
}

// Soft delete a product
export async function deleteProduct(product, accessToken) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${product.id}/soft_delete/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response failed');
        }
        return { success: true }
    }
    catch (error) {
        console.error('Error occurred while soft deleting the product', error);
        return { success: false, error: error.message };
    }
}