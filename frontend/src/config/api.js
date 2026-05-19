// Central API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://auto-intern-backend.onrender.com";
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "https://auto-intern-backend.onrender.com";

export { API_BASE_URL, WS_BASE_URL };
export default API_BASE_URL;
