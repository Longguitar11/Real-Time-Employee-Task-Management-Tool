import React, { useEffect, useState } from 'react'
import { CirclePlusIcon, SquarePenIcon, Trash2Icon } from 'lucide-react';
import useEmployeeStore from '../../stores/useEmployeeStore'
import EmployeeForm from '../../components/EmployeeForm';
import DeleteConfirmation from '../../components/DeleteConfirmation';
import LoadingSpinner from '../../components/LoadingSpinner';
import Filter from '../../components/Filter';

const ManageEmployeePage = () => {
  const { employees, getAllUsers, createEmployee, updateEmployee, deleteEmployee, loading, actionLoading } = useEmployeeStore();

  const [isOpen, setIsOpen] = useState({ type: 'create', open: false });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filteredEmployees, setFilteredEmployees] = useState(employees || []);

  const onCreateClick = () => {
    setSelectedEmployee(null);
    setIsOpen({ type: 'create', open: true });
  }

  const onEditClick = (employee) => {
    setSelectedEmployee(employee);
    setIsOpen({ type: 'edit', open: true });
  }

  const onDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setIsOpen({ type: 'delete', open: true });
  }

  const onEmployeeFormSubmit = async (employee) => {
    if (isOpen.type === 'create') {
      await createEmployee(employee)
    }

    if (isOpen.type === 'edit') {
      await updateEmployee({ id: selectedEmployee.id, ...employee })
    }

    setIsOpen({ type: 'create', open: false });
  }

  const onDeleteEmployeeConfirm = async () => {
    if (isOpen.type === 'delete') {
      await deleteEmployee(selectedEmployee.id);
      setIsOpen({ type: 'create', open: false });
    }
  }

  const filterEmployee = async (query) => {
    if (query === '') {
      setFilteredEmployees(employees);
      return;
    }

    query = await query?.trim().toLowerCase();

    const filteredEmployees = await employees.filter(employee => {
      return employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.role.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query) ||
        employee.phoneNumber.toLowerCase().includes(query) ||
        (employee.isVerified ? 'active' : 'inactive').includes(query)
    });

    setFilteredEmployees(filteredEmployees);
  }

  useEffect(() => {
    getAllUsers();
  }, [])

  // update the filtered employees when the employees array changes
  useEffect(() => {
    setFilteredEmployees(employees || []);
  }, [employees]);

  if (loading) return <LoadingSpinner />

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-end'>
        <p className='text-gray-500 text-lg font-semibold whitespace-nowrap'>{filteredEmployees?.length} Users</p>

        <div className='flex gap-2'>
          <Filter onSearch={filterEmployee} />
          <button onClick={onCreateClick}
            className='bg-blue-500 flex items-center gap-2 text-white hover:opacity-80 transition-opacity duration-200 px-4 py-2 rounded cursor-pointer whitespace-nowrap'>
            <CirclePlusIcon />
            Add Employee
          </button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full border-collapse text-sm'>
          <thead className='bg-violet-50'>
            <tr className='text-gray-500 text-left'>
              <th className='p-2 font-medium'>Employee Name</th>
              <th className='p-2 font-medium'>Email</th>
              <th className='p-2 font-medium'>Role</th>
              <th className='p-2 font-medium'>Department</th>
              <th className='p-2 font-medium'>Status</th>
              <th className='p-2 font-medium'>Action</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {
              !loading && filteredEmployees?.length > 0 ? filteredEmployees.map((employee) => (
                <tr key={employee.id} className='whitespace-nowrap'>
                  <td className='p-2'>{employee.name}</td>
                  <td className='p-2'>{employee.email}</td>
                  <td className='capitalize text-sm'>
                    <span className={`${employee.role === 'owner' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'} p-2 rounded`}>
                      {employee.role}
                    </span>
                  </td>
                  <td className='p-2'>{employee.department}</td>
                  <td className='text-white text-sm uppercase opacity-60'>{employee.isVerified ? <span className='bg-green-500 p-2 rounded'>Active</span> : <span className='bg-red-500 p-2 rounded'>Inactive</span>}</td>
                  <td className='p-2 flex items-end gap-2'>
                    <div className='bg-blue-100 rounded-full p-2 hover:opacity-80 transition-opacity duration-200 cursor-pointer'>
                      <SquarePenIcon
                        onClick={() => onEditClick(employee)}
                        className='w-4 h-4 text-blue-500'
                      />
                    </div>
                    <div className='bg-red-100 rounded-full p-2 hover:opacity-80 transition-opacity duration-200 cursor-pointer'>
                      <Trash2Icon
                        onClick={() => onDeleteClick(employee)}
                        className='w-4 h-4 text-red-500'
                      />
                    </div>
                  </td>
                </tr>
              )) :
                <tr>
                  <td colSpan="6" className='p-2 text-center'>No employees found</td>
                </tr>
            }
          </tbody>
        </table>
      </div>

      {isOpen.open && isOpen.type !== 'delete' && (
        <EmployeeForm employee={selectedEmployee} type={isOpen.type} isLoading={actionLoading} setIsOpen={setIsOpen} onSubmit={onEmployeeFormSubmit} />
      )}

      {isOpen.type === 'delete' && isOpen.open && (
        <DeleteConfirmation loading={actionLoading} itemName={selectedEmployee?.name} setIsOpen={setIsOpen} onDelete={onDeleteEmployeeConfirm} />
      )}
    </div>
  )
}


export default ManageEmployeePage;