// Add an item to the users shopping cart
export async function addToCart(product, variant, quantity, accessToken) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/add_to_cart/`, {
            method: 'POST',
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

// Update an item in the cart
export async function updateCartItem(cartId, quantity, accessToken) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/update_cart_item/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                cart_item_id: cartId,
                quantity: quantity
            })
        })
        if (!response.ok) {
            throw new Error('Network response failed');
        }
        return { success: true }
    }
    catch (error) {
        console.error('Error occurred while attempting to update a product within the shopping cart:', error);
    }
}

// Delete an item from the cart
export async function deleteCartItem(cartId, accessToken) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/delete_from_cart/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                cart_item_id: cartId
            })
        });
        if (!response.ok) {
            throw new Error('Network response failed');
        }
        return { success: true };
    }
    catch (error) {
        console.error('Error occurred while attempting to delete item from shopping cart:', error);
    }
}