import React, { useState } from 'react'
import { DEPARTMENTS } from '../constants/departments';

const EmployeeForm = ({ type, employee, onSubmit, isLoading, setIsOpen }) => {

    const [employeeData, setEmployeeData] = useState({
        name: employee?.name || '',
        email: employee?.email || '',
        phoneNumber: employee?.phoneNumber || '',
        department: employee?.department || '',
        role: employee?.role || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(employeeData);
    }

    return (
        <div className='fixed inset-0 bg-gray-300/50 flex items-center justify-center z-50' onClick={() => setIsOpen({ type: 'create', open: false })}>
            <div className='bg-white p-6 rounded shadow-lg w-md' onClick={(e) => e.stopPropagation()}>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <h2 className='text-xl font-bold text-center'>{type === 'create' ? 'Create Employee' : 'Edit Employee'}</h2>

                    <div>
                        <label htmlFor="name">Name</label>
                        <input id='name' type='text' className='border rounded w-full p-2' value={employeeData.name} placeholder='Employee Name' required onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })} autoFocus />
                    </div>

                    <div>
                        <label htmlFor="email">Email</label>
                        <input id='email' type='email' className='border rounded w-full p-2' value={employeeData.email} placeholder='Employee Email' required onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })} />
                    </div>

                    <div>
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input id='phoneNumber' type='text' className='border rounded w-full p-2' value={employeeData.phoneNumber} placeholder='Phone Number' required onChange={(e) => setEmployeeData({ ...employeeData, phoneNumber: e.target.value })} />
                    </div>

                    <div>
                        <label htmlFor="department">Department</label>
                        <select id='department' className='border rounded w-full p-2' value={employeeData.department} required onChange={(e) => setEmployeeData({ ...employeeData, department: e.target.value })}>
                            <option value=''>Select Department</option>
                            {DEPARTMENTS.map((department) => (
                                <option key={department.value} value={department.value}>{department.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="role">Role</label>
                        <select id='role' className='border rounded w-full p-2' value={employeeData.role} required onChange={(e) => setEmployeeData({ ...employeeData, role: e.target.value })}>
                            <option value=''>Select Role</option>
                            <option value='employee'>Employee</option>
                            <option value='owner'>Owner</option>
                        </select>
                    </div>

                    <div className='flex justify-end gap-2'>
                        <button onClick={() => setIsOpen({ type: 'create', open: false })} className='bg-gray-300 px-4 py-2 rounded'>Close</button>
                        <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded' disabled={isLoading}>{isLoading ? 'Loading...' : type === 'create' ? 'Create' : 'Update'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EmployeeForm