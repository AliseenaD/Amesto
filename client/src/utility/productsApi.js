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