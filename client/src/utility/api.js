// Get the profile information
export async function getProfile(accessToken) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
            headers: {
                Authorization: `Bearer ${accessToken}` 
            }
        });
        if (!response.ok) {
            throw new Error ('Netork response failed');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching user', error);
    }
}

// Get all products
export async function getProducts() {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products`);
        if (!response.ok) {
            throw new Error ('Netork response failed');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching products', error);
    }
}

// Get all variant info 
export async function getVariants(product) {
    const variants = [];
    for (const variantId of product.variants) {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/variants/${variantId}`);
            if (!response.ok) {
                throw new Error ('Netork response failed');
            }
            const variant = await response.json();
            variants.push(variant);
        }
        catch (error) {
            console.error('Error fetching all variants', error);
        }
    } 
    return variants;
}

// Add an item to the users shopping cart
export async function addToCart(product, quantity, accessToken) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/cart`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                productId: product._id,
                quantity: quantity
            })
        });
        if (!response.ok) {
            throw new Error('Network response failed');
        }
        const updatedCart = await response.json();
        return updatedCart;
    }
    catch (error) {
        console.error('Error occurred while adding to shopping cart:', error);
    }
}

// Get all items in a users shopping cart
export async function getAllCart(accessToken) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/cart`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response failed');
        }
        const data = response.json();
        return data;
    }
    catch (error) {
        console.error('Error occurred while fetching all of the users cart:', error);
    }
}