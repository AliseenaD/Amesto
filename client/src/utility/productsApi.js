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