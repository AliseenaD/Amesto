// Get all phone brands
export async function getPhoneBrands() {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/brands/phones`);

        // Check response
        if (!response) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("There was an error getting phone brands:", error);
    }
}

// Get all speaker brands
export async function getSpeakerBrands() {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/brands/speakers`);

        // Check response
        if (!response) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("There was an error getting speaker brands:", error);
    }
}

// Get all headphone brands
export async function getHeadphoneBrands() {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/brands/headphones`);

        // Check response
        if (!response) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("There was an error getting headphone brands:", error);
    }
}

// Get all watch brands
export async function getWatchBrands() {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/brands/watches`);

        // Check response
        if (!response) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("There was an error getting watch brands:", error);
    }
}

// Get all accessory brands
export async function getAccessoryBrands() {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/brands/accessories`);

        // Check response
        if (!response) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("There was an error getting accessory brands:", error);
    }
}