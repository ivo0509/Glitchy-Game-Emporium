
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ShoppingCartIcon, UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';
import { Role } from '../types';


const Header: React.FC = () => {
  const { currentUser, logout, cart } = useContext(AppContext);

  return (
    <header className="bg-secondary shadow-lg">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
          <span className="text-cta">Glitchy</span> Game Emporium
        </h1>
        <nav className="flex items-center space-x-4 md:space-x-6">
          {currentUser && (
            <>
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-6 w-6 text-highlight" />
                <span className="hidden md:inline text-white font-medium">{currentUser.name}</span>
              </div>
              {currentUser.role === Role.Customer && (
                 <div className="relative">
                    <ShoppingCartIcon className="h-6 w-6 text-highlight cursor-pointer" />
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {cart.length}
                        </span>
                    )}
                </div>
              )}
              <button onClick={logout} className="flex items-center space-x-2 text-highlight hover:text-white transition duration-200">
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
