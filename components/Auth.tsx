
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Role } from '../types';

const Auth: React.FC = () => {
  const { login, register, users } = useContext(AppContext);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.Customer);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(userId)) {
      setError('Invalid User ID. Please check the list of available users.');
    } else {
      setError('');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
        setError('Name cannot be empty.');
        return;
    }
    register(name, role);
    setError('');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-secondary rounded-lg shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-white mb-6">{isRegister ? 'Register' : 'Login'}</h2>
      {error && <p className="bg-red-500/50 text-white p-3 rounded-md mb-4 text-center">{error}</p>}
      
      {isRegister ? (
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-highlight mb-2" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-accent p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-cta focus:outline-none text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-highlight mb-2" htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full bg-accent p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-cta focus:outline-none text-white"
            >
              <option value={Role.Customer}>Customer</option>
              <option value={Role.Seller}>Seller</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-cta hover:bg-cta-hover text-white font-bold py-3 px-4 rounded-md transition duration-300">
            Register
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-highlight mb-2" htmlFor="userId">User ID</label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g., seller1 or customer1"
              className="w-full bg-accent p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-cta focus:outline-none text-white"
            />
          </div>
          <button type="submit" className="w-full bg-cta hover:bg-cta-hover text-white font-bold py-3 px-4 rounded-md transition duration-300">
            Login
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <button onClick={() => setIsRegister(!isRegister)} className="text-cta hover:underline">
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </div>

      <div className="mt-8 p-4 border-t border-accent">
        <h3 className="text-lg font-semibold text-center text-white mb-2">Available User IDs for Login</h3>
        <ul className="text-center text-highlight">
            {users.map(user => (
                <li key={user.id}><span className="font-bold">{user.id}</span> ({user.role})</li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default Auth;
