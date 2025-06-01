import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import axios from "../libs/axios";

export const useTaskStore = create((set) => ({
    tasks: null,
    loading: false,
    getAllTasks: async () => {
        set({ loading: true });
        try {
            const res = await axios.get('/tasks');
            set({ tasks: res.data.tasks, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data?.error || "An error occurred");
        }
    },
    getTasksByUserId: async (id) => {
        set({ loading: true });
        try {
            const res = await axios.get(`/tasks/${id}`);
            set({ tasks: res.data.tasks, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data?.error || "An error occurred");
        }
    },
    createTask: async (id, taskData) => {
        set({ loading: true });
        try {
            const res =await axios.post(`/tasks/create/${id}`, taskData);
            set((state) => ({ tasks: [...state.tasks, res.data.task], loading: false }));
            toast.success("Task created successfully");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data?.error || "An error occurred");
        }
    },
    updateTask: async (id, taskData) => {
        set({ loading: true });
        try {
            await axios.post(`/tasks/${id}`, taskData);
            set((state) => ({
                loading: false,
                tasks: state.tasks.map(task => task.id === id ? { ...task, ...taskData } : task)
            }));
            toast.success("Task updated successfully");
        } catch (error) {
            set({ loading: false });
            console.log(error)
            toast.error(error.response.data?.error || "An error occurred");
        }
    },
    changeTaskStatus: async (id, status) => {
        set({ loading: true });
        try {
            await axios.post(`/tasks/${id}/status`, { status });

            set((state) => ({ 
                tasks: state.tasks.map(task => task.id === id ? { ...task, status } : task), 
                loading: false 
            }));

            toast.success("Task status updated successfully");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data?.error || "An error occurred");
        }
    },
    deleteTask: async (id) => {
        set({ loading: true });
        try {
            await axios.delete(`/tasks/${id}`);
            
            set((state) => ({
                tasks: state.tasks.filter(task => task.id !== id),
                loading: false
            }));

            toast.success("Task deleted successfully");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data?.error || "An error occurred");
        }
    }
}))