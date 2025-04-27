import axios from "axios";
import { setCredentials, logOut } from "../slices/authSlice.js";

// Import the store to access it
import { store } from "../app/store.js";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // ensure http only cookies(refresh token) are sent
});

// Request interceptor - Attaches the access token to outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth?.token; // Get token from redux store
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handles 401 errors and token refresh logic

// Mutex flag and queue for handling concurrent refresh attempts
let isRefreshing = false;
let failedQueue = []; // [{resolve, reject, config }]

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      // Add new token to the request config header before resolving
      prom.config.headers["Authorization"] = `Bearer ${token}`;
      prom.resolve(axiosInstance(prom.config)); // Retry the request with the original config + new token
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    // Just return the response if request is successful
    return response;
  },
  async (error) => {
    const originalRequest = error.config; // original request configuration

    // Check if error is 401 and it's not a retry request and not the refresh token request itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh-token"
    ) {
      console.log("Axios interceptor: detected 401");

      if (isRefreshing) {
        // if already refreshing, queue the original request
        console.log(
          "Axios interceptor: Refresh in progress, queueing request..."
        );
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        }).catch((err) => {
          // for errors during the retry after refresh attempt failed
          return Promise.reject(err);
        });
      }

      // Mark this request as a retry attempt to prevent infinite loops
      originalRequest._retry = true;
      isRefreshing = true; // Lock mutex

      try {
        console.log("Axios interceptor: Attempting token refresh...");
        const refreshUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`;

        // Refresh token request
        const refreshResponse = await axiosInstance.post(refreshUrl); // Post req

        if (
          refreshResponse.status === 200 &&
          refreshResponse.data?.data?.accessToken
        ) {
          const newAccessToken = refreshResponse.data.data.accessToken;
          console.log("Axios interceptor: Token refresh successful");

          // Update token in redux store and local storage
          const currentUser = store.getState().auth.user;
          store.dispatch(
            setCredentials({ user: currentUser, accessToken: newAccessToken })
          );

          // Update the header for the original failed request
          axiosInstance.defaults.headers.common["Authorization"] =
            `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          // Process the queue of failed requests with the new token
          processQueue(null, newAccessToken);

          // Retry the original request that failed
          console.log("Axios Interceptor: Retrying original request...");
          return axiosInstance(originalRequest);
        } else {
          // case when refresh endpoint returns 200 with no token
          throw new Error("Refresh endpoint returns 200 with but no token");
        }
      } catch (refreshError) {
        console.error("Axios Interceptor: Token refresh failed.", refreshError);
        processQueue(refreshError, null); // Reject queued requests
        store.dispatch(logOut()); // Log out user
        // Reject the original request's promise
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false; // Unlock mutex
      }
    }
    // For errors other than 401 or if it's a retry/refresh request, just reject
    return Promise.reject(error);
  }
);

export default axiosInstance;
