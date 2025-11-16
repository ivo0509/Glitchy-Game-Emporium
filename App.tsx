
import React, { useContext } from 'react';
import { AppContext } from './context/AppContext';
import Header from './components/Header';
import Auth from './components/Auth';
import SellerDashboard from './components/SellerDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import { Role } from './types';

const App: React.FC = () => {
  const { currentUser } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-primary font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {!currentUser ? (
          <Auth />
        ) : currentUser.role === Role.Seller ? (
          <SellerDashboard />
        ) : (
          <CustomerDashboard />
        )}
      </main>
      <footer className="text-center p-4 text-xs text-accent">
        <p>&copy; 2024 Glitchy Game Emporium. All bugs reserved.</p>
      </footer>
    </div>
  );
};

export default App;
