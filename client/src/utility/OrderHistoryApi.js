// Function to fetch all orders made
export async function getOrders(accessToken) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error ("Network response failed");
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching order history', error);
    }
}

// Function to set the status of an order
export async function updateStatus(accessToken, status, id) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${id}/update_order_status/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ order_status: status })
        });
        if (!response.ok) {
            throw new Error ("Network response failed");
        }
        return { success: true };
    }
    catch (error) {
        console.error('Error updating order status', error);
    }
}