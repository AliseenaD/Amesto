// Add an item to the users shopping cart
export async function addToCart(product, variant, quantity, accessToken) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/update_cart_item`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                product: product,
                variant: variant,
                quantity: quantity
            })
        });
        if (!response.ok) {
            throw new Error('Network response failed');
        }
        const updatedCart = await response.json();
        return { success: true, data: updatedCart };
    }
    catch (error) {
        console.error('Error occurred while adding to shopping cart:', error);
        return { success: false, error: error.message };
    }
}

// Get all items in a users shopping cart
export async function getAllCart(accessToken) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/shopping_cart`, {
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

// Delete an item from the cart
export async function deleteCartItem(productId, variantId, accessToken) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/cart`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                productId: productId,
                variantId: variantId
            })
        });
        if (!response.ok) {
            throw new Error('Network reponse failed');
        }
        const data = response.json();
        return { success: true, data: data };
    }
    catch (error) {
        console.error('Error occurred while attempting to delete item from shopping cart:', error);
    }
}