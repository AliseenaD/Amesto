// Add a new news item
export async function addNews(newsItem, accessToken) {
    try {
        const formData = new FormData()
        formData.append('text', newsItem.text);
        formData.append('image', newsItem.image);

        // Now make API call to create news
        const response = await fetch(`${process.env.REACT_APP_API_URL}/news/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        // Check resposne
        if (!response.ok) {
            throw new Error("Network response failed");
        }

        const data = await response.json();
        return { success: true, data };
    }
    catch (error) {
        console.error("There was an error while creating a new news item:", error);
    }
}

// Get paginated news info
export async function getNews(page) {
    try {
        // If page is not null then get the paginated response for that page
        if (page) {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/news/?page=${page}`, {
                method: 'GET'
            });

            // Check response
            if (!response.ok) {
                throw new Error("Network response failed");
            }

            const data = await response.json();
            return data;
        }
        // Otherwise just give the first page
        else {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/news/?page=1`, {
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
        console.error("There was an error while fetching news:", error);
    }
}

// Delete a news item
export async function deleteNewsItem(newsId, accessToken) {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/news/${newsId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        // Check response
        if (!response) {
            throw new Error("Network response failed");
        }

        return {success: true};
    }
    catch (error) {
        console.error("There was an error deleting the news item:", error);
    }
}