# TodoList Component Setup Guide

This guide explains how to set up and use the TodoList component with the Node.js backend.

## Prerequisites

1. **Node.js Backend**: Make sure the backend server is running on `http://localhost:5000`
2. **MongoDB**: Ensure MongoDB is running and accessible
3. **Environment Variables**: Set up the API URL

## Environment Setup

Create a `.env` file in the project root with:

```env
VITE_API_URL=http://localhost:5000/api
```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

4. The backend will be available at `http://localhost:5000`

## Frontend Setup

1. Install additional dependencies:
   ```bash
   npm install @types/node
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

The TodoList component uses the following backend endpoints:

- `GET /api/todos` - Get all todos
- `GET /api/todos/employees` - Get employees for dropdown
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `PATCH /api/todos/:id/status` - Update todo status
- `DELETE /api/todos/:id` - Delete todo

## Authentication

The component expects a JWT token to be stored in localStorage as 'token'. The token should be obtained from the authentication system.

## Usage

1. Import the TodoList component:
   ```tsx
   import TodoList from './HRMS/TodoList';
   ```

2. Use it in your component:
   ```tsx
   function App() {
     return (
       <div>
         <TodoList />
       </div>
     );
   }
   ```

## Features

- **Role-based Access**: Different features for employees, admins, and super admins
- **CRUD Operations**: Create, read, update, and delete todos
- **Status Management**: Mark todos as pending, completed, or overdue
- **Employee Assignment**: Admins can assign todos to specific employees
- **Filtering**: Filter todos by status
- **Real-time Updates**: Immediate UI updates after API calls
- **Form Validation**: Comprehensive validation for all inputs
- **Error Handling**: Proper error messages and user feedback

## Troubleshooting

1. **CORS Issues**: Ensure the backend has CORS properly configured
2. **Authentication**: Make sure the JWT token is valid and stored in localStorage
3. **API Errors**: Check the browser console and backend logs for error details
4. **Database**: Ensure MongoDB is running and the connection string is correct

## Testing

Run the backend test script to verify the API:
```bash
cd backend
node test-todo-api.js
```

## File Structure

```
project/
├── src/
│   ├── HRMS/
│   │   ├── TodoList.tsx
│   │   └── TodoModal.tsx
│   ├── components/
│   │   └── common/
│   │       ├── DeleteModal.tsx
│   │       └── AlertMessages.tsx
│   └── services/
│       └── getService.ts
└── backend/
    ├── models/
    │   └── todo.model.js
    ├── controllers/
    │   └── todo.controller.js
    ├── routes/
    │   └── todo.routes.js
    └── server.js
``` 