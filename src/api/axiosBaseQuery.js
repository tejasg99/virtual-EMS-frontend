import axiosInstance from "./axiosInstance";

/**
 * Custom base query function for RTK Query using Axios.
 * Handles making requests and formatting responses/errors for RTK Query.
*/

const axiosBaseQuery = ({ baseUrl } = { baseUrl: ''}) => async ({ url, method, params, body }) => {
    // --- ADD LOG 1: Log received arguments ---
    // console.log('[axiosBaseQuery] Received args:', { url, method, params, body });

    try {
      // Construct the config for Axios
      const axiosConfig = {
        url: baseUrl + url, // Prepend baseUrl
        method,
        data: body, // Axios uses 'data' for the request body (e.g., for POST)
        params, // Axios uses 'params' for URL query parameters
      };
      // --- ADD LOG 2: Log the config being sent to Axios ---
    //   console.log('[axiosBaseQuery] Sending Axios config:', axiosConfig);

      // Make the request using the configured Axios instance
      const result = await axiosInstance(axiosConfig);

        // Return in the format RTK query expects: { data: ... }
        return { data: result.data };
    } catch (axiosError) {
        let err = axiosError;
        // Return in format { error: { status: ..., data: ...} }
        return {
            error: {
                status: err.response?.status,
                data: err.response?.data || err.message, 
            }
        }
    }    
};

export default axiosBaseQuery;