import { useEffect, useMemo, useState } from 'react'
import { CirclePlusIcon, SquarePenIcon, Trash2Icon } from 'lucide-react';
import { useTaskStore } from '../../stores/useTaskStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import useEmployeeStore from '../../stores/useEmployeeStore';
import TaskForm from '../../components/TaskForm';
import DeleteConfirmation from '../../components/DeleteConfirmation';
import { formatDate } from '../../utils/formatDate';
import Filter from '../../components/Filter';

const ManageTaskPage = () => {
  const { employees, getAllEmployees } = useEmployeeStore()
  const { tasks, getAllTasks, createTask, updateTask, deleteTask, loading, actionLoading } = useTaskStore();

  const [isOpen, setIsOpen] = useState({ type: 'create', open: false });
  const [selectedTask, setSelectedTask] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState(tasks || []);

  console.log(filteredTasks)

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
      await deleteTask(selectedTask.id);
      setIsOpen({ type: 'create', open: false });
    }
  }

  // Memoize employee lookup map
  const employeeMap = useMemo(() => {
    if (!employees || employees.length === 0) return {};

    return employees.reduce((acc, employee) => {
      acc[employee.id] = employee;
      return acc;
    }, {});
  }, [employees]);

  const filterTasks = async (query) => {
    if (query === '') {
      setFilteredTasks(tasks);
      return;
    }

    console.log(query)

    query = await query?.trim().toLowerCase();

    const filteredTasks = await tasks.filter(task => {
      return task.name.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.deadline.toLowerCase().includes(query) ||
        task.status.toLowerCase().includes(query) ||
        employeeMap[task.assignedTo]?.name.toLowerCase().includes(query)
    });

    console.log({ filteredTasks })

    setFilteredTasks(filteredTasks);
  }

  useEffect(() => {
    setFilteredTasks(tasks || []);
  }, [tasks])

  useEffect(() => {
    getAllTasks();
    getAllEmployees();
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-end'>
        <p className='text-gray-500 font-semibold text-lg whitespace-nowrap'>{tasks?.length} Task{tasks?.length > 1 ? 's' : ''}</p>

        <div className='flex gap-2 items-center'>
          <Filter onSearch={filterTasks} />

          <button
            onClick={onCreateClick}
            className='bg-blue-500 flex items-center gap-2 text-white hover:opacity-80 transition-opacity duration-200 px-4 py-2 rounded cursor-pointer whitespace-nowrap'
          >
            <CirclePlusIcon />
            Add Task
          </button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full border-collapse text-sm'>
          <thead className='bg-violet-50'>
            <tr className='text-gray-500 text-left'>
              <th className='p-2 font-medium'>Task Name</th>
              <th className='p-2 font-medium'>Description</th>
              <th className='p-2 font-medium'>Status</th>
              <th className='p-2 font-medium'>Assigned To</th>
              <th className='p-2 font-medium'>Deadline</th>
              <th className='p-2 font-medium'>Action</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {
              !loading && filteredTasks && filteredTasks.length > 0 ? filteredTasks.map((task) => (
                <tr key={task.id} className='whitespace-nowrap'>
                  <td className='p-2'>{task.name}</td>
                  <td className='p-2'>{task.description}</td>
                  <td className='p-2 text-white uppercase opacity-60'>
                    <span className={`p-2 rounded ${task.status === 'done' ? 'bg-green-500' : task.status === 'doing' ? 'bg-blue-500' : 'bg-gray-500'}`}>{task.status}</span>
                  </td>
                  <td className='p-2'>{employeeMap[task.assignedTo]?.name}</td>
                  <td className='p-2'>{formatDate(task.deadline)}</td>
                  <td className='p-2 flex items-end gap-2'>
                    <div className='bg-blue-100 rounded-full p-2 hover:opacity-80 transition-opacity duration-200 cursor-pointer'>
                      <SquarePenIcon
                        onClick={() => onEditClick(task)}
                        className='w-4 h-4 text-blue-500'
                      />
                    </div>
                    <div className='bg-red-100 rounded-full p-2 hover:opacity-80 transition-opacity duration-200 cursor-pointer'>
                      <Trash2Icon
                        onClick={() => onDeleteClick(task)}
                        className='w-4 h-4 text-red-500'
                      />
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={6} className='p-2 text-center'>No tasks found</td></tr>
            }
          </tbody>
        </table>
      </div>

      {isOpen.open && isOpen.type !== 'delete' && (
        <TaskForm
          setIsOpen={setIsOpen}
          type={isOpen.type}
          task={selectedTask}
          employees={employees}
          isLoading={actionLoading}
          onSubmit={onTaskFormSubmit}
        />
      )}

      {isOpen.type === 'delete' && (
        <DeleteConfirmation
          setIsOpen={setIsOpen}
          onDelete={onDeleteTask}
          loading={actionLoading}
          itemName={selectedTask?.name || 'Task'}
        />
      )}

    </div>
  )
}

export default ManageTaskPage