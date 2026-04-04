import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const executeCode = async (language, code) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/execute`, { language, code });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            return {
                isError: true,
                error: error.response.data.error || "Server execution error.",
                output: ""
            };
        }
        return { isError: true, error: "Failed to connect to execution server.", output: "" };
    }
};

export const explainCode = async (language, code, output, errorMsg) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/explain`, { 
            language, 
            code, 
            output, 
            error: errorMsg 
        });
        return response.data.explanation;
    } catch (error) {
        return "Failed to connect to AI Mentor service.";
    }
};
