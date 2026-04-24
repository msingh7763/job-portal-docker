import axios from "axios";

// Get API configuration from environment variables
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = (rawBaseUrl || "").trim();
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000; // Default 10 seconds
const resolvedBaseURL = API_BASE_URL
  ? API_BASE_URL
  : import.meta.env.PROD
    ? ""
    : "http://localhost:5000";

// Log configuration on app start (development only)
if (import.meta.env.DEV) {
  console.log("🔧 API Configuration:");
  console.log(`   Base URL: ${resolvedBaseURL}`);
  console.log(`   Timeout: ${API_TIMEOUT}ms`);
}

if (!API_BASE_URL && import.meta.env.PROD) {
  console.warn(
    "⚠️  VITE_API_BASE_URL not set. Using same-origin API (recommended for Docker)."
  );
}

if (!API_BASE_URL && import.meta.env.DEV) {
  console.warn("⚠️  VITE_API_BASE_URL not set. Using default http://localhost:5000");
}

const api = axios.create({
  baseURL: resolvedBaseURL,
  withCredentials: true, // Essential for sending cookies with cross-origin requests
  timeout: API_TIMEOUT, // Set timeout to avoid hanging requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - log requests and handle errors
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`📤 [REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) console.log(`   Data:`, config.data);
    }
    return config;
  },
  (error) => {
    console.error("❌ Request setup failed:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle all response scenarios
api.interceptors.response.use(
  (response) => {
    if (response?.data && typeof response.data === "object") {
      const hasSuccess = typeof response.data.success === "boolean";
      const hasStatus = typeof response.data.status === "boolean";

      if (!hasSuccess && hasStatus) {
        response.data.success = response.data.status;
      }

      if (!hasStatus && hasSuccess) {
        response.data.status = response.data.success;
      }
    }

    if (import.meta.env.DEV) {
      console.log(`✅ [RESPONSE] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();

    // Log detailed error info
    console.error(`\n❌ [API ERROR]`);
    console.error(`   Method: ${method}`);
    console.error(`   URL: ${url}`);
    console.error(`   Status: ${status || "NO_RESPONSE"}`);
    console.error(`   Message: ${message}`);

    // Handle specific error cases
    if (status === 400) {
      console.error("   → Bad Request: Check input data");
    } else if (status === 401) {
      console.error("   → Unauthorized: Token expired or invalid");
      // Optional: trigger logout on 401
      // window.location.href = '/login';
    } else if (status === 403) {
      console.error("   → Forbidden: Insufficient permissions");
    } else if (status === 404) {
      console.error("   → Not Found: Endpoint may not exist");
    } else if (status === 500) {
      console.error("   → Server Error: Backend issue");
    } else if (status === 503) {
      console.error("   → Service Unavailable: Backend is down");
    } else if (!error.response) {
      if (error.code === "ECONNABORTED") {
        console.error("   → Timeout: Request took too long");
      } else if (error.message === "Network Error") {
        console.error("   → Network Error: Cannot reach backend");
        console.error(`   → Configured URL: ${API_BASE_URL}`);
        console.error(`   → Check if VITE_API_BASE_URL is set correctly on Vercel`);
      } else {
        console.error(`   → Error: ${error.message}`);
      }
    } else {
      console.error(`   → API Error (${status}): ${message}`);
    }
    console.error("");

    return Promise.reject(error);
  }
);

export default api;
