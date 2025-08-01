import React from 'react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile?: string;
}

interface FormData {
  title: string;
  due_date: string;
  priority: string;
  selectedEmployeeId: string;
}

interface FormErrors {
  title: string;
  due_date: string;
  priority: string;
  selectedEmployeeId: string;
}

interface TodoModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  formData: FormData;
  errors: FormErrors;
  loading: boolean;
  modalId: string;
  employees: Employee[];
  loggedInEmployeeRole: string | null;
  isEdit?: boolean;
}

const TodoModal: React.FC<TodoModalProps> = ({
  show,
  onClose,
  onSubmit,
  onChange,
  formData,
  errors,
  loading,
  modalId,
  employees,
  loggedInEmployeeRole,
  isEdit = false
}) => {
  if (!show) return null;

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? 'Edit Todo' : 'Add New Todo'}
              </h5>
              <button
                type="button"
                className="close"
                onClick={onClose}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="title">Todo Title *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={onChange}
                        placeholder="Enter todo title"
                        required
                      />
                      {errors.title && (
                        <div className="invalid-feedback">{errors.title}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="due_date">Due Date *</label>
                      <input
                        type="date"
                        className={`form-control ${errors.due_date ? 'is-invalid' : ''}`}
                        id="due_date"
                        name="due_date"
                        value={formData.due_date}
                        onChange={onChange}
                        required
                      />
                      {errors.due_date && (
                        <div className="invalid-feedback">{errors.due_date}</div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="priority">Priority *</label>
                      <select
                        className={`form-control ${errors.priority ? 'is-invalid' : ''}`}
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={onChange}
                        required
                      >
                        <option value="">Select Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      {errors.priority && (
                        <div className="invalid-feedback">{errors.priority}</div>
                      )}
                    </div>
                  </div>
                </div>

                {(loggedInEmployeeRole === "admin" || loggedInEmployeeRole === "super_admin") && (
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="selectedEmployeeId">Assign To Employee *</label>
                        <select
                          className={`form-control ${errors.selectedEmployeeId ? 'is-invalid' : ''}`}
                          id="selectedEmployeeId"
                          name="selectedEmployeeId"
                          value={formData.selectedEmployeeId}
                          onChange={onChange}
                          required
                        >
                          <option value="">Select Employee</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.first_name} {employee.last_name} ({employee.email})
                            </option>
                          ))}
                        </select>
                        {errors.selectedEmployeeId && (
                          <div className="invalid-feedback">{errors.selectedEmployeeId}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEdit ? 'Update Todo' : 'Create Todo'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

export default TodoModal; 