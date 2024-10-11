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