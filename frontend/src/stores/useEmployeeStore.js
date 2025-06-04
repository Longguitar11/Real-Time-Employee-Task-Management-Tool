import { toast } from 'react-hot-toast';
import { create } from 'zustand';
import axios from "../libs/axios"

export const userEmployeeStore = create((set) => ({
    employees: null,
    loading: false,
    actionLoading: false,
    createEmployee: async ({ name, email, phoneNumber, role, department }) => {
        set({ actionLoading: true });

        try {
            const res = await axios.post('/employees/create', {
                email,
                name,
                phoneNumber,
                role,
                department
            });

            if (res.data.success) {
                set((state) =>  ({ employees: [...state.employees, res.data.employee], actionLoading: false }));
                toast.success("Create employee successfully");
            }

        } catch (error) {
            set({ actionLoading: false });
            console.log(error);
            toast.error(error.response.data?.error || "An error occurred");
        }
    },
    getAllEmployees: async () => {
        set({ loading: true });
        try {
            const res = await axios.get('/employees');
            set({ employees: res.data.employees, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data?.error || "An error occurred");
        }
    },
    getAllUsers: async () => {
        set({ loading: true });
        try {
            const res = await axios.get('/employees/all');
            set({ employees: res.data.users, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data?.error || "An error occurred");
        }
    },
    getEmployee: async (id) => {
        set({ loading: true });

        try {
            const res = await axios.get(`/employees/${id}`);
            set({ employee: res.data.employee, loading: false });
            return res.data.employee;
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data?.error || "An error occurred");
        }
    },
    updateEmployee: async ({ id, email, phoneNumber, name, role, department }) => {
        set({ actionLoading: true });

        try {
            const res = await axios.post(`/employees/${id}`, {
                email,
                phoneNumber,
                name,
                role,
                department
            });

            if (res.data.success) {
                set((state) => ({
                    employees: state.employees.map(employee => employee.id === id ? { ...employee, email, phoneNumber, name, role, department } : employee),
                    actionLoading: false
                }));
                toast.success("Update employee successfully");
            }
        } catch (error) {
            set({ actionLoading: false });
            toast.error(error.response.data?.error || "An error occurred");
        }
    },
    deleteEmployee: async (id) => {
        set({ loading: true });

        try {
            const res = await axios.delete(`/employees/${id}`);
            if (res.data.success) {
                set((state) => ({ employees: state.employees.filter(employee => employee.id !== id), actionLoading: false }));
                toast.success("Delete employee successfully");
            }
        } catch (error) {
            set({ actionLoading: false });
            toast.error(error.response.data?.error || "An error occurred");
        }
    },
}));

export default userEmployeeStore;
