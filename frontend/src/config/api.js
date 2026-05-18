// Central API configuration - use env variable in production, fallback to localhost for dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "${API_BASE_URL}";
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "${API_BASE_URL}";

export { API_BASE_URL, WS_BASE_URL };
export default API_BASE_URL;
