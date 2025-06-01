import React, { useEffect, useState } from 'react'
import useEmployeeStore from '../../stores/useEmployeeStore'
import EmployeeForm from '../../components/EmployeeForm';
import DeleteConfirmation from '../../components/DeleteConfirmation';

const ManageEmployeePage = () => {
  const [isOpen, setIsOpen] = useState({ type: 'create', open: false });
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { employees, getAllUsers, createEmployee, updateEmployee, deleteEmployee, loading } = useEmployeeStore();

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

  useEffect(() => {
    getAllUsers();
  }, [])

  return (
    <>
      <p className='text-2xl'>Manage Employee</p>

      <div className='flex justify-end mt-10'>
        <button onClick={onCreateClick}
          className='bg-blue-500 text-white hover:opacity-80 transition-opacity duration-200 px-4 py-2 rounded'>Add Employee</button>
      </div>

      <table className='w-full border-collapse mt-4'>
        <thead className='bg-violet-100'>
          <tr className='text-gray-500'>
            <th className='p-2'>Employee Name</th>
            <th className='p-2'>Email</th>
            <th className='p-2'>Status</th>
            <th className='p-2'>Action</th>
          </tr>
        </thead>
        <tbody>
          {
            !loading && employees?.length > 0 ? employees.map((employee) => (
              <tr key={employee.id} className='text-center'>
                <td className='p-2'>{employee.name}</td>
                <td className='p-2'>{employee.email}</td>
                <td className='p-2 text-white uppercase opacity-60'>{employee.isVerified ? <span className='bg-green-500 p-2 rounded'>Active</span> : <span className='bg-red-500 p-2 rounded'>Inactive</span>}</td>
                <td className='p-2'>
                  <button onClick={() => onEditClick(employee)} className='cursor-pointer bg-blue-500 text-white hover:opacity-80 transition-opacity duration-200 px-4 py-2 rounded'>Edit</button>
                  <button onClick={() => onDeleteClick(employee)} className='cursor-pointer bg-red-500 text-white hover:bg-red-400 transition-colors duration-200 px-4 py-2 rounded ml-2'>Delete</button>
                </td>
              </tr>
            )) :
              <tr>
                <td colSpan="4" className='p-2 text-center'>No employees found</td>
              </tr>
          }

        </tbody>
      </table>

      {isOpen.open && isOpen.type !== 'delete' && (
        <EmployeeForm employee={selectedEmployee} type={isOpen.type} isLoading={loading} setIsOpen={setIsOpen} onSubmit={onEmployeeFormSubmit} />
      )}

      {isOpen.type === 'delete' && isOpen.open && (
        <DeleteConfirmation loading={loading} itemName={selectedEmployee?.name} setIsOpen={setIsOpen} onDelete={onDeleteEmployeeConfirm} />
      )}
    </>
  )
}


export default ManageEmployeePage;