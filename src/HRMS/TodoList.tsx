import React, { useState, useEffect } from 'react';
import TodoModal from './TodoModal';
import DeleteModal from '../components/common/DeleteModal';
import AlertMessages from '../components/common/AlertMessages';
import { getService } from '../services/getService';

// Types and Interfaces
interface Todo {
  id: number;
  title: string;
  due_date: string;
  priority: string;
  todoStatus: string;
  employee_id: string;
  first_name?: string;
  last_name?: string;
  profile?: string;
  imageError?: boolean;
  hidden_for_employee?: boolean;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile?: string;
}

interface FormErrors {
  title: string;
  due_date: string;
  priority: string;
  selectedEmployeeId: string;
}

interface RootState {
  settings: {
    isFixNavbar: boolean;
  };
}

interface Window {
  user: {
    id: string;
    role: string;
  };
  $?: any;
}

declare global {
  interface Window {
    user: {
      id: string;
      role: string;
    };
    $?: any;
  }
}

const TodoList: React.FC = () => {
  // State management
  const [todos, setTodos] = useState<Todo[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showAddTodoModal, setShowAddTodoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [loggedInEmployeeId, setLoggedInEmployeeId] = useState<string | null>(null);
  const [loggedInEmployeeRole, setLoggedInEmployeeRole] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('');
  const [todoStatus, setTodoStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [errors, setErrors] = useState<FormErrors>({
    title: '',
    due_date: '',
    priority: '',
    selectedEmployeeId: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isUnchecking, setIsUnchecking] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);

  const fixNavbar = false; // Simplified for now, can be replaced with proper state management

  // Initialize component
  useEffect(() => {
    // Check if window.user exists before destructuring
    if (!window.user) {
      console.error('window.user is not defined');
      setErrorMessage('User session not found. Please login again.');
      setShowError(true);
      return;
    }

    const { role, id } = window.user;
    
    setLoggedInEmployeeId(id);
    setLoggedInEmployeeRole(role);

    // Fetch todos
    fetchTodos();

    // Fetch employees if admin/super_admin
    if (role === 'admin' || role === 'super_admin') {
      fetchEmployees();
    }
  }, []);

  // Fetch todos function
  const fetchTodos = async (status?: string) => {
    try {
      // Check if window.user exists
      if (!window.user) {
        setErrorMessage('User session not found. Please login again.');
        setShowError(true);
        return;
      }

      const params: any = {
        logged_in_employee_id: window.user.id,
        role: window.user.role
      };
      
      if (status) {
        params.status = status;
      }

      const data = await getService.getCall('todos', params);
      
      if (data.status === 'success') {
        const todoData = data.data.map((t: Todo) => ({ ...t, imageError: false }));
        setTodos(todoData);
      } else {
        setErrorMessage(data.message || 'Failed to fetch todos');
      }
    } catch (err) {
      setErrorMessage('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees function
  const fetchEmployees = async () => {
    try {
      const data = await getService.getCall('todos/employees');
      
      if (data.status === 'success') {
        setEmployees(data.data);
      } else {
        setErrorMessage(data.message || 'Failed to fetch employees');
      }
    } catch (err) {
      setErrorMessage('Failed to fetch employees data');
      console.error(err);
    }
  };

  // Handle input changes for add/edit todo
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'title':
        setTitle(value);
        break;
      case 'due_date':
        setDueDate(value);
        break;
      case 'priority':
        setPriority(value);
        break;
      case 'selectedEmployeeId':
        setSelectedEmployeeId(value);
        break;
    }

    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      title: '',
      due_date: '',
      priority: '',
      selectedEmployeeId: '',
    };
    let isValid = true;

    // Title validation
    const namePattern = /^[a-zA-Z\s.,!?'-]+$/;
    if (!title.trim()) {
      newErrors.title = "Please enter a todo title.";
      isValid = false;
    } else if (!namePattern.test(title)) {
      newErrors.title = "Todo title can only contain letters, spaces, and punctuation.";
      isValid = false;
    }

    // Due date validation
    if (!dueDate.trim()) {
      newErrors.due_date = "Please select a due date.";
      isValid = false;
    } else {
      const today = new Date().toISOString().split("T")[0];
      if (dueDate < today) {
        newErrors.due_date = "Due date cannot be in the past.";
        isValid = false;
      }
    }

    // Priority validation
    if (!priority.trim()) {
      newErrors.priority = "Please select todo priority.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Add todo
  const addTodo = async () => {
    if (!validateForm()) return;

    const employeeId = (loggedInEmployeeRole === "admin" || loggedInEmployeeRole === "super_admin") 
      ? selectedEmployeeId 
      : loggedInEmployeeId;

    const formData = new FormData();
    formData.append('employee_id', employeeId!);
    formData.append('title', title);
    formData.append('due_date', dueDate);
    formData.append('priority', priority);
    formData.append('logged_in_employee_id', loggedInEmployeeId!);
    formData.append('logged_in_employee_role', loggedInEmployeeRole!);

    try {
      const data = await getService.addCall('todos', 'add', formData);
      
      if (data.status === 'success') {
        await fetchTodos();
        resetForm();
        setShowAddTodoModal(false);
        setSuccessMessage("Todo added successfully!");
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage("Failed to add Todo. Please try again.");
        setShowError(true);
        
        setTimeout(() => {
          setShowError(false);
          setErrorMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred while adding the todo.");
      setShowError(true);
    }
  };

  // Update todo
  const updateTodo = async () => {
    if (!validateForm() || !selectedTodo) return;

    const employeeId = (loggedInEmployeeRole === "admin" || loggedInEmployeeRole === "super_admin") 
      ? selectedEmployeeId 
      : loggedInEmployeeId;

    const formData = new FormData();
    formData.append('todo_id', selectedTodo.id.toString());
    formData.append('employee_id', employeeId!);
    formData.append('title', title);
    formData.append('due_date', dueDate);
    formData.append('priority', priority);
    formData.append('logged_in_employee_id', loggedInEmployeeId!);
    formData.append('logged_in_employee_role', loggedInEmployeeRole!);

    try {
      const data = await getService.updateCall('todos', selectedTodo.id, formData);
      
      if (data.status === 'success') {
        setTodos(prevTodos => 
          prevTodos.map(todo =>
            todo.id === selectedTodo.id
              ? { ...todo, title, due_date: dueDate, priority, employee_id: employeeId! }
              : todo
          )
        );
        resetForm();
        setShowEditModal(false);
        setSelectedTodo(null);
        setSuccessMessage("Todo updated successfully!");
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage("Failed to update Todo. Please try again.");
        setShowError(true);
        
        setTimeout(() => {
          setShowError(false);
          setErrorMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred while updating the todo.");
      setShowError(true);
    }
  };

  // Delete todo
  const deleteTodo = async () => {
    if (!todoToDelete) return;
    
    setButtonLoading(true);

    try {
      const data = await getService.deleteCall('todos', 'delete', todoToDelete.id);
      
      if (data.status === 'success') {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoToDelete.id));
        setShowDeleteModal(false);
        setTodoToDelete(null);
        setButtonLoading(false);
        setSuccessMessage("Todo deleted successfully!");
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        setShowError(true);
        setErrorMessage(data.message || 'Failed to delete todo');
        setShowDeleteModal(false);
        setTodoToDelete(null);
        setButtonLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setShowError(true);
      setErrorMessage('An error occurred while deleting the todo');
      setShowDeleteModal(false);
      setTodoToDelete(null);
      setButtonLoading(false);
    }
  };

  // Handle checkbox click
  const handleCheckboxClick = (todo: Todo) => {
    if (todo.todoStatus === 'completed') {
      setShowOverdueModal(true);
      setSelectedTodo(todo);
      setIsUnchecking(true);
    } else {
      setShowOverdueModal(true);
      setSelectedTodo(todo);
      setIsUnchecking(false);
    }
  };

  // Handle status update
  const handleUpdateTodoStatus = async () => {
    if (!selectedTodo) return;

    const newStatus = isUnchecking ? 'pending' : 'completed';
    const successMessage = isUnchecking 
      ? 'Todo status changed to pending!' 
      : 'Todo marked as completed!';

    const formData = new FormData();
    formData.append('id', selectedTodo.id.toString());
    formData.append('status', newStatus);
    formData.append('logged_in_employee_id', loggedInEmployeeId!);
    
    try {
      const data = await getService.patchCall('todos/status', selectedTodo.id, {
        status: newStatus,
        logged_in_employee_id: loggedInEmployeeId
      });
      
      if (data.status === 'success') {
        setTodos(prevTodos => 
          prevTodos.map(todo =>
            todo.id === selectedTodo.id
              ? { ...todo, todoStatus: newStatus }
              : todo
          )
        );
        setShowOverdueModal(false);
        setSelectedTodo(null);
        setIsUnchecking(false);
        setSuccessMessage(successMessage);
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        setShowError(true);
        setErrorMessage('Failed to update todo status');
        setShowOverdueModal(false);
        setSelectedTodo(null);
        setIsUnchecking(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setShowError(true);
      setErrorMessage('An error occurred while updating the todo');
      setShowOverdueModal(false);
      setSelectedTodo(null);
      setIsUnchecking(false);
    }
  };

  // Handle edit todo
  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowEditModal(true);
    setTitle(todo.title);
    setDueDate(todo.due_date);
    setPriority(todo.priority);
    setSelectedEmployeeId(todo.employee_id);
  };

  // Handle delete todo
  const handleDeleteTodo = (todo: Todo) => {
    setTodoToDelete(todo);
    setShowDeleteModal(true);
  };

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setPriority('');
    setSelectedEmployeeId('');
    setErrors({
      title: '',
      due_date: '',
      priority: '',
      selectedEmployeeId: '',
    });
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowAddTodoModal(false);
    resetForm();
  };

  // Handle edit modal close
  const handleEditModalClose = () => {
    setShowEditModal(false);
    setSelectedTodo(null);
    resetForm();
  };

  // Handle delete modal close
  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setTodoToDelete(null);
    setButtonLoading(false);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setStatusFilter(status);
    fetchTodos(status);
  };

  // Close overdue modal
  const closeOverdueModal = () => {
    setShowOverdueModal(false);
    setSelectedTodo(null);
  };

  return (
    <>
      <AlertMessages
        showSuccess={showSuccess}
        successMessage={successMessage}
        showError={showError}
        errorMessage={errorMessage}
        setShowSuccess={setShowSuccess}
        setShowError={setShowError}
      />
      
      <div className={`section-body ${fixNavbar ? "marginTop" : ""} mt-3`}>
        <div className="container-fluid">
          <div className="row">
            {/* Status Filter for Admin/Super Admin */}
            {(loggedInEmployeeRole === "admin" || loggedInEmployeeRole === "super_admin") && (
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-lg-4 col-md-12 col-sm-12" style={{backgroundColor:"transparent"}}>
                        <label htmlFor="statusFilter" className='d-flex card-title mr-3 align-items-center'>
                          Status:
                        </label>
                        <select
                          id="statusFilter"
                          className="form-control"
                          value={statusFilter}
                          onChange={handleStatusFilterChange}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                                             <div className="col-lg-8 col-md-12 col-sm-12 text-right">
                         <button 
                           type="button" 
                           className="btn btn-primary btn-sm" 
                           onClick={() => setShowAddTodoModal(true)}
                         >
                           <i className="fe fe-plus mr-2" />
                           Add New
                         </button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive todo_list">
                    <table className="table table-hover table-striped table-vcenter mb-0">
                      <thead>
                        <tr>
                          <th>
                            <p className="w150">Task</p>
                          </th>
                          <th className="w150 text-right">Due</th>
                          <th className="w100">Priority</th>
                          <th className="w80"><i className="icon-user" /></th>
                          {(loggedInEmployeeRole === "admin" || loggedInEmployeeRole === "super_admin") && (
                            <th className="w150">Action</th>
                          )}
                        </tr>
                      </thead>
                      {loading ? (
                        <tbody>
                          <tr>
                            <td colSpan={5}>
                              <div className="d-flex justify-content-center align-items-center" style={{ height: "150px" }}>
                                <div className="loader" />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      ) : (
                        <tbody>
                          {todos && todos.length > 0 ? (
                            todos.map((todo, index) => (
                              <tr key={index+1} style={
                                (loggedInEmployeeRole !== 'employee' && todo.hidden_for_employee)
                                  ? { textDecoration: 'line-through', opacity: 0.6 }
                                  : {}
                              }>
                                <td>
                                  <label className="custom-control custom-checkbox">
                                    <input
                                      type="checkbox"
                                      className="custom-control-input"
                                      name="example-checkbox1"
                                      checked={todo.todoStatus === 'completed'}
                                      onChange={() => handleCheckboxClick(todo)}
                                    />
                                    <span className="custom-control-label">{todo.title}</span>
                                  </label>
                                </td>
                                <td className="text-right">
                                  {new Date(todo.due_date).toLocaleString("en-US", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                  }).replace(",", "")}
                                </td>
                                <td>
                                  <span className={`tag ml-0 mr-0 ${
                                    todo.priority === "high"
                                      ? "tag-danger"
                                      : todo.priority === "medium"
                                      ? "tag-warning"
                                      : "tag-success"
                                    }`}
                                  >
                                    {todo.priority.toUpperCase()}
                                  </span>
                                </td>
                                <td>
                                  {todo.profile && !todo.imageError ? (
                                    <img
                                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${todo.profile}`}
                                      className="avatar avatar-blue add-space"
                                      alt={`${todo.first_name || ''} ${todo.last_name || ''}`}
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title={`${todo.first_name || ''} ${todo.last_name || ''}`}
                                      style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                      }}
                                      onError={() => {
                                        setTodos(prevTodos => 
                                          prevTodos.map(t =>
                                            t.id === todo.id ? { ...t, imageError: true } : t
                                          )
                                        );
                                      }}
                                    />
                                  ) : (
                                    <span
                                      className="avatar avatar-blue add-space"
                                      data-toggle="tooltip"
                                      data-placement="top"
                                      title={`${todo.first_name || ''} ${todo.last_name || ''}`}
                                      style={{
                                        width: '40px',
                                        height: '40px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                      }}
                                    >
                                      {(todo.first_name ? todo.first_name.charAt(0) : '').toUpperCase()}
                                      {(todo.last_name ? todo.last_name.charAt(0) : '').toUpperCase()}
                                    </span>
                                  )}
                                </td>
                                {(loggedInEmployeeRole === "admin" || loggedInEmployeeRole === "super_admin") && (
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <button
                                        type="button"
                                        className="btn btn-icon"
                                        title="Edit"
                                        onClick={() => handleEditTodo(todo)}
                                      >
                                        <i className="fa fa-edit" />
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-icon btn-sm js-sweetalert"
                                        title="Delete"
                                        onClick={() => handleDeleteTodo(todo)}
                                      >
                                        <i className="fa fa-trash-o text-danger" />
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="text-center">Todo not available.</td>
                            </tr>
                          )}
                        </tbody>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Todo Modal */}
      <TodoModal
        show={showAddTodoModal}
        onClose={handleModalClose}
        onSubmit={addTodo}
        onChange={handleInputChange}
        formData={{
          title,
          due_date: dueDate,
          priority,
          selectedEmployeeId
        }}
        errors={errors}
        loading={false}
        modalId="addTodoModal"
        employees={employees}
        loggedInEmployeeRole={loggedInEmployeeRole}
      />

      {/* Overdue Modal */}
      {showOverdueModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header" style={{ display: 'none' }}>
                <button type="button" className="close" onClick={closeOverdueModal}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="row clearfix">
                  <p>
                    {isUnchecking 
                      ? "Do you want to mark this task as pending?"
                      : "Do you want to mark this task as completed?"}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeOverdueModal}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleUpdateTodoStatus}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Todo Modal */}
      <TodoModal
        isEdit={true}
        show={showEditModal}
        onClose={handleEditModalClose}
        onSubmit={updateTodo}
        onChange={handleInputChange}
        formData={{
          title,
          due_date: dueDate,
          priority,
          selectedEmployeeId
        }}
        errors={errors}
        loading={false}
        modalId="editTodoModal"
        employees={employees}
        loggedInEmployeeRole={loggedInEmployeeRole}
      />
      {showEditModal && <div className="modal-backdrop fade show" />}

      {/* Delete Todo Modal */}
      <DeleteModal
        show={showDeleteModal}
        onConfirm={deleteTodo}
        onClose={handleDeleteModalClose} 
        isLoading={buttonLoading}
        deleteBody="Are you sure you want to delete this todo?"
        modalId="deleteTodoModal"
      />
      {showDeleteModal && <div className="modal-backdrop fade show" />}
    </>
  );
};

export default TodoList;