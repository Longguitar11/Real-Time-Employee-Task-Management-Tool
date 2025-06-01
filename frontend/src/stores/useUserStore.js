import { create } from 'zustand';
import axios from "../libs/axios"
import { toast } from 'react-hot-toast';

export const useUserStore = create((set) => ({
    user: null,
    loading: false,
    checkingAuth: true,
    createAccessCode: async ({ email }) => {
        set({ loading: true });

        try {
            const res = await axios.post('/auth/create-new-access-code', {
                email
            });

            if (res.data.success) {
                set({ loading: false });
                toast.success("Access code created successfully. Please check your email.", { duration: 5000 });
            }
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data?.error || "An error occurred");
        }
    },
    validateAccessCode: async ({ email, accessCode }) => {
        set({ loading: true });

        try {
            const res = await axios.post('/auth/validate-access-code', {
                email, accessCode
            });

            if(res.data.success) {
                set({ user: res.data.user, loading: false });
                return res.data;
            }
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data?.error || "An error occurred");
        }
    },
    editProfile: async ({ name, email, phoneNumber, department }) => {
        set({ loading: true });

        try {
            const res = await axios.post('/auth/edit', {
                name,
                phoneNumber,
                department,
                email
            });

            if (res.data.success) {
                set((state) => ({ user: { ...state.user, name, phoneNumber, department, email }, loading: false }));
                toast.success(res.data.message);
            }
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data?.error || "An error occurred");
        }
    },
    checkAuth: async () => {
        set({ checkingAuth: true });

        try {
            const res = await axios.get('/auth/profile');
            set({ user: res.data.user, checkingAuth: false });
        } catch (error) {
            set({ checkingAuth: false, user: null });
        }
    },
    logout: async () => {
        set({ loading: true });

        try {
            await axios.post('/auth/logout');
            set({ user: null, loading: false});
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data?.error || "An error occurred", { id: "logout" });
        }
    },
    refreshToken: async () => {
        try {
            const res = await axios.post("/auth/refresh-token");
            set({ checkingAuth: false });
            return res.data;
        } catch (error) {
            set({ user: null, checkingAuth: false });
            throw error;
        }
    },
}));

// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // If a refresh is already in progress, wait for it to complete
                if (refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest);
                }

                // Start a new refresh process
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;

                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login or handle as needed
                useUserStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default useUserStore;