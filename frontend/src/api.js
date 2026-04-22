import axios from 'axios';

const rawBase = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = rawBase ? `${rawBase}/api` : '/api';

export const executeCode = async (language, code, stdin) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/execute`, { language, code, stdin });
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
        }, { timeout: 15000 });
        return response.data.explanation;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            return "⚠️ **AI Service Timeout**\n\nThe AI Mentor took too long to respond. Google's model may be experiencing high demand.\n\n> Please click **Run Code** again to retry.";
        }
        return "Failed to connect to AI Mentor service.";
    }
};
