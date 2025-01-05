// Get all all products in a paginated fashion
export async function getProducts(page) {
    try {
        // If page present get products for that page
        if (page) {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/?page=${page}`, {
                method: 'GET'
            });

            // Check response
            if (!response.ok) {
                throw new Error("Network response failed");
            }

            const data = await response.json();
            return data;
        }
        // Otherwise assume page = 1
        else {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/?page=1`, {
                method: 'GET'
            });

            // Check response
            if (!response.ok) {
                throw new Error("Network response failed");
            }

            const data = await response.json();
            return data;
        }
    }
    catch (error) {
        console.error('Error fetching products', error);
    }
}

// Get all phone products in increasing order of price in a paginated fashion
export async function getPhonesIncreasingPrice(page, brand) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/phones_price_increase/?page=${page}&brand=${brand}`, {
            method: 'GET',
        });

        // Check response
        if (!response.ok) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching phones ordered by price', error);
    }
}

// Get all phone products in decreasing order of price in a paginated fashion
export async function getPhonesDecreasingPrice(page, brand) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/phones_price_decrease/?page=${page}&brand=${brand}`, {
            method: 'GET',
        });

        // Check response
        if (!response.ok) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching phones ordered by price', error);
    }
}


// Get phone products in a paginated fashion
export async function getPhones(page, brand) {
    try {
        // If page present get phones for that page
        if (page) {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/phones/?page=${page}&brand=${brand}`, {
                method: 'GET',
            });

            // Check response
            if (!response.ok) {
                throw new Error("Network response failed");
            }

            const data = await response.json();
            return data;
        }
        // Otherwise assume page = 1
        else {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/phones/?page=1&brand=`, {
                method: 'GET',
            });

            // Check response
            if (!response.ok) {
                throw new Error("Network response failed");
            }

            const data = await response.json();
            return data;
        }
    }
    catch (error) {
        console.error('Error fetching phones:', error);
    }
}

// Get phone products filtered by storage increasing
export async function getPhonesIncreasingStorage(page, brand) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/phones_storage_increase/?page=${page}&brand=${brand}`, {
            method: 'GET',
        });

        // Check response
        if (!response.ok) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching phones ordered by price', error);
    }
}

// Get phone products filtered by storage decreasing
export async function getPhonesDecreasingStorage(page, brand) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/phones_storage_decrease/?page=${page}&brand=${brand}`, {
            method: 'GET',
        });

        // Check response
        if (!response.ok) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching phones ordered by price', error);
    }
}

// Get speaker products in a paginated fashion
export async function getSpeakers(page, brand) {
    try {
        // If page present get phones for that page
        if (page) {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/speakers/?page=${page}&brand=${brand}`, {
                method: 'GET'
            });

            // Check response
            if (!response.ok) {
                throw new Error("Network response failed");
            }

            const data = await response.json();
            return data;
        }
        // Otherwise assume page = 1
        else {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/speakers/?page=1&brand=`, {
                method: 'GET'
            });

            // Check response
            if (!response.ok) {
                throw new Error("Network response failed");
            }

            const data = await response.json();
            return data;
        }
    }
    catch (error) {
        console.error('Error fetching speakers:', error);
    }
}

// Get all speaker products with increasing cost in a paginated fashion
export async function getSpeakersIncreasePrice(page, brand) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/speakers_price_increase/?page=${page}&brand=${brand}`, {
            method: 'GET'
        });

        // Check response
        if (!response.ok) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.error('Error fetching speakers:', error);
    }
}

// Get all speaker products with decreasing cost in a paginated fashion
export async function getSpeakersDecreasePrice(page, brand) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/speakers_price_decrease/?page=${page}&brand=${brand}`, {
            method: 'GET'
        });

        // Check response
        if (!response.ok) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.error('Error fetching speakers:', error);
    }
}

// Get all watches in a paginated fashion
export async function getWatches(page, brand) {
    try {
        // If page present get phones for that page
        if (page) {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/watches/?page=${page}&brand=${brand}`, {
                method: 'GET'
            });

            // Check response
            if (!response.ok) {
                throw new Error("Network response failed");
            }

            const data = await response.json();
            return data;
        }
        // Otherwise assume page = 1
        else {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/watches/?page=1&brand=`, {
                method: 'GET'
            });

            // Check response
            if (!response.ok) {
                throw new Error("Network response failed");
            }

            const data = await response.json();
            return data;
        }
    }
    catch (error) {
        console.error('Error fetching speakers:', error);
    }
}

// Get watches in increasing price
export async function getWatchesIncreasePrice(page, brand) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/watches_price_increase/?page=${page}&brand=${brand}`);

        // Check response
        if (!response.ok) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.error('Error fetching watches:', error);
    }
}

// Get watches in decreasing price
export async function getWatchesDecreasePrice(page, brand) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/watches_price_decrease/?page=${page}&brand=${brand}`);

        // Check response
        if (!response.ok) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.error('Error fetching watches:', error);
    }
}

// Get all headphones in a paginated fashion
export async function getHeadphones(page, brand) {
    try {
        // If page present get phones for that page
        if (page) {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/headphones/?page=${page}&brand=${brand}`, {
                method: 'GET'
            });

            // Check response
            if (!response.ok) {
                throw new Error("Network response failed");
            }

            const data = await response.json();
            return data;
        }
        // Otherwise assume page = 1
        else {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/headphones/?page=1&brand=`, {
                method: 'GET'
            });

            // Check response
            if (!response.ok) {
                throw new Error("Network response failed");
            }

            const data = await response.json();
            return data;
        }
    }
    catch (error) {
        console.error('Error fetching speakers:', error);
    }
}

// Get all headphones by increasing price
export async function getHeadphonesIncreasePrice(page, brand) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/headphones_price_increase/?page=${page}&brand=${brand}`);

        // Check response
        if (!response.ok) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.error('Error fetching speakers:', error);
    }
}

// Get all headphones by decreasing price
export async function getHeadphonesDecreasePrice(page, brand) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/headphones_price_decrease/?page=${page}&brand=${brand}`);

        // Check response
        if (!response.ok) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.error('Error fetching speakers:', error);
    }
}

// Get all accessories in a paginated fashion
export async function getAccessories(page, brand) {
    try {
        // If page present get phones for that page
        if (page) {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/accessories/?page=${page}&brand=${brand}`, {
                method: 'GET'
            });

            // Check response
            if (!response.ok) {
                throw new Error("Network response failed");
            }

            const data = await response.json();
            return data;
        }
        // Otherwise assume page = 1
        else {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/accessories/?page=1&brand=`, {
                method: 'GET'
            });

            // Check response
            if (!response.ok) {
                throw new Error("Network response failed");
            }

            const data = await response.json();
            return data;
        }
    }
    catch (error) {
        console.error('Error fetching speakers:', error);
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