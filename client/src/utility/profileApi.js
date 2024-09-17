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