import { useEffect, useMemo, useState } from 'react'
import { useTaskStore } from '../../stores/useTaskStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import useEmployeeStore from '../../stores/useEmployeeStore';
import TaskForm from '../../components/TaskForm';
import DeleteConfirmation from '../../components/DeleteConfirmation';
import { formatDate } from '../../utils/formatDate';

const ManageTaskPage = () => {
  const [isOpen, setIsOpen] = useState({ type: 'create', open: false });
  const [selectedTask, setSelectedTask] = useState(null);

  const { tasks, getAllTasks, createTask, updateTask, deleteTask, loading } = useTaskStore();
  const { employees, getAllEmployees } = useEmployeeStore()

  const onEditClick = (task) => {
    setSelectedTask(task);
    setIsOpen({ type: 'edit', open: true });
  }

  const onDeleteClick = (task) => {
    setSelectedTask(task);
    setIsOpen({ type: 'delete', open: true });
  }

  const onCreateClick = () => {
    setSelectedTask(null);
    setIsOpen({ type: 'create', open: true });
  }

  const onTaskFormSubmit = async (task) => {
    if (isOpen.type === 'create') {
      await createTask(task.assignedTo, task);
    } else if (isOpen.type === 'edit') {
      await updateTask(selectedTask.id, task);
    }

    setIsOpen({ type: 'create', open: false });
  }

  const onDeleteTask = async () => {
    if (isOpen.type === 'delete') {
      console.log("Deleting task:", selectedTask);

      await deleteTask(selectedTask.id);
      setIsOpen({ type: 'create', open: false });
    }
  }

  useEffect(() => {
    getAllTasks();
    getAllEmployees();
  }, [])

  // Memoize employee lookup map
  const employeeMap = useMemo(() => {
    if (!employees || employees.length === 0) return {};
    
    return employees.reduce((acc, employee) => {
      acc[employee.id] = employee;
      return acc;
    }, {});
  }, [employees]);

  if (loading) return <LoadingSpinner />

  return (
    <>
      <p className='text-2xl'>Manage Task</p>

      <div className='flex justify-end mt-10'>
        <button
          onClick={onCreateClick}
          className='bg-blue-500 text-white hover:opacity-80 transition-opacity duration-200 px-4 py-2 rounded'
        >
          Add Task
        </button>
      </div>

      <table className='w-full border-collapse mt-4'>
        <thead className='bg-violet-100'>
          <tr className='text-gray-500'>
            <th className='p-2'>Task Name</th>
            <th className='p-2'>Description</th>
            <th className='p-2'>Status</th>
            <th className='p-2'>Assigned To</th>
            <th className='p-2'>Deadline</th>
            <th className='p-2'>Action</th>
          </tr>
        </thead>
        <tbody>
          {
            !loading && tasks && tasks.length > 0 ? tasks.map((task) => (
              <tr key={task.id} className='text-center'>
                <td className='p-2'>{task.name}</td>
                <td className='p-2'>{task.description}</td>
                <td className='p-2 text-white uppercase opacity-60'>
                  <span className='bg-green-500 p-2 rounded'>{task.status}</span>
                </td>
                <td className='p-2'>{employeeMap[task.assignedTo]?.name}</td>
                <td className='p-2'>{formatDate(task.deadline)}</td>
                <td className='p-2'>
                  <button
                    onClick={() => onEditClick(task)}
                    className='bg-yellow-500 text-white px-4 py-1 rounded'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteClick(task)}
                    className='bg-red-500 text-white px-4 py-1 rounded ml-2'
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )) : <tr><td colSpan={6} className='p-2 text-center'>No tasks found</td></tr>
          }
        </tbody>
      </table>

      {isOpen.open && isOpen.type !== 'delete' && (
        <TaskForm
          setIsOpen={setIsOpen}
          type={isOpen.type}
          task={selectedTask}
          employees={employees}
          isLoading={loading}
          onSubmit={onTaskFormSubmit}
        />
      )}

      {isOpen.type === 'delete' && (
        <DeleteConfirmation
          setIsOpen={setIsOpen}
          onDelete={onDeleteTask}
          loading={loading}
          itemName={selectedTask?.name || 'Task'}
        />
      )}

    </>
  )
}

export default ManageTaskPage