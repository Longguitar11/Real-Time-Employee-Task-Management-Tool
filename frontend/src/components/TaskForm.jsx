import React, { useState } from 'react'
import { TASK_STATUS } from '../constants/taskStatus';

const TaskForm = ({ type, employees, task, onSubmit, isLoading, setIsOpen }) => {

    const [taskData, setTaskData] = useState({
        name: task?.name || '',
        description: task?.description || '',
        assignedTo: task?.assignedTo || '',
        status: task?.status || 'todo',
        deadline: task?.deadline || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(taskData);
    }

    return (
        <div className='fixed inset-0 bg-gray-300/50 flex items-center justify-center z-50' onClick={() => setIsOpen({ type: 'create', open: false })}>
            <div className='bg-white p-6 rounded shadow-lg w-md' onClick={(e) => e.stopPropagation()}>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <h2 className='text-xl font-bold text-center'>{type === 'create' ? 'Create Task' : 'Edit Task'}</h2>

                    <div>
                        <label htmlFor="name">Name</label>
                        <input id='name' type='text' className='border rounded w-full p-2' value={taskData.name} placeholder='Name' required onChange={(e) => setTaskData({ ...taskData, name: e.target.value })} autoFocus />
                    </div>

                    <div>
                        <label htmlFor="description">Description</label>
                        <textarea id='description' className='border rounded w-full p-2' value={taskData.description} placeholder='Description' required onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} />
                    </div>

                    <div>
                        <label htmlFor="assignedTo">Assign To</label>
                        <select id='assignedTo' className='border rounded w-full p-2' value={taskData.assignedTo} required onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })}>
                            <option value=''>Select Employee</option>
                            {
                                employees && employees.length > 0 ? employees.map((employee) => (
                                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                                )) : <option value=''>No Employees Available</option>
                            }
                        </select>
                    </div>

                    <div>
                        <label htmlFor="status">Status</label>
                        <select id='status' className='border rounded w-full p-2' value={taskData.status} required onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}>
                            {
                                TASK_STATUS.map((status) => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div>
                        <label htmlFor="deadline">deadline</label>
                        <input id='deadline' type='date' className='border rounded w-full p-2' value={taskData.deadline} required onChange={(e) => setTaskData({ ...taskData, deadline: e.target.value })} />
                    </div>

                    <div className='flex justify-end gap-2'>
                        <button onClick={() => setIsOpen({ type: 'create', open: false })} className='bg-gray-300 px-4 py-2 rounded cursor-pointer hover:opacity-70 transition-all duration-200'>Close</button>
                        <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:opacity-70 transition-all duration-200' disabled={isLoading}>{isLoading ? 'Loading...' : type === 'create' ? 'Create' : 'Update'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TaskForm