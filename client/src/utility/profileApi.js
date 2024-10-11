// Get the profile information
export async function getProfile(accessToken) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/profile/`, {
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

// Submit a new order
export async function submitOrder(accessToken) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/place_order/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error ('Netork response failed');
        }
        return { success: true };
    }
    catch (error) {
        console.error('Error fetching user', error);
    }
}