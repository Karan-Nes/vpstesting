const axios = require('axios');

// Function to push data to IndiaMART
const pushDataToIndiaMART = async (data) => {
    const url = `${process.env.INDIAMART_API_ENDPOINT}`;
    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.INDIAMART_API_KEY}`
            }
        });
        console.log('Success:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error pushing data to IndiaMART:', error);
        throw error;
    }
};

module.exports = { pushDataToIndiaMART };
