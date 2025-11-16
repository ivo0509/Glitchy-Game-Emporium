import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Game, Customer, Discount, Employee } from '../types';

const TabButton: React.FC<{tab:string, label:string, activeTab: string, onClick: (tab: string) => void}> = ({ tab, label, activeTab, onClick }) => (
    <button 
        onClick={() => onClick(tab)}
        className={`px-4 py-2 font-semibold rounded-md transition whitespace-nowrap ${activeTab === tab ? 'bg-cta text-white' : 'text-highlight hover:bg-accent'}`}>
        {label}
    </button>
);

const SellerDashboard: React.FC = () => {
  const { 
    currentUser, games, customers, addGame, removeGame, editGame, addCustomer, removeCustomer, editCustomer, 
    sellerBalance, withdrawSellerFunds, createDiscount, sendNotification, sellerListings, 
    listGameForSellers, buyFromSeller, suppliers, hireEmployee, fireEmployee, editEmployee, orderStock
  } = useContext(AppContext);
  
  const [activeTab, setActiveTab] = useState('games');
  
  // Games state
  const [newGameName, setNewGameName] = useState('');
  const [newGamePrice, setNewGamePrice] = useState('');
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Customers state
  const [newCustomerName, setNewCustomerName] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Promotions state
  const [discountCode, setDiscountCode] = useState('');
  const [discountGameId, setDiscountGameId] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [announcement, setAnnouncement] = useState('');

  // Seller marketplace state
  const [listForSaleGameId, setListForSaleGameId] = useState('');
  const [listForSalePrice, setListForSalePrice] = useState('');
  const [marketplaceError, setMarketplaceError] = useState('');
  
  // Employee state
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState<'Support' | 'Inventory' | 'Marketing'>('Support');
  const [newEmployeeSalary, setNewEmployeeSalary] = useState('');
  
  // Supplier state
  const [orderGameId, setOrderGameId] = useState('');
  const [orderSupplierId, setOrderSupplierId] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);


  useEffect(() => {
    // BUG: Simulated network error that randomly appears.
    if (Math.random() < 0.1) {
      setMarketplaceError("NetworkError: Failed to fetch inventory data. Please try again.");
    } else {
      setMarketplaceError('');
    }
  }, [sellerListings]);


  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGameName.trim() === '' || isNaN(parseFloat(newGamePrice)) || parseFloat(newGamePrice) <= 0) {
        alert("Please enter a valid game name and a positive price.");
        return;
    }
    addGame(newGameName, newGamePrice);
    setNewGameName('');
    setNewGamePrice('');
  };

  const handleEditGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGame) {
      editGame(editingGame.id, editingGame.name, editingGame.price);
      setEditingGame(null);
    }
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomerName.trim() === '') return;
    addCustomer(newCustomerName);
    setNewCustomerName('');
  };

  const handleEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if(editingCustomer) {
      editCustomer(editingCustomer.id, editingCustomer.name);
      setEditingCustomer(null);
    }
  }

  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const newDiscount: Discount = {
        code: discountCode,
        gameId: discountGameId,
        percentage: parseInt(discountPercentage, 10)
    };
    createDiscount(newDiscount);
    setDiscountCode('');
    setDiscountGameId('');
    setDiscountPercentage('');
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    sendNotification(announcement);
    setAnnouncement('');
  }
  
  const handleListForSellers = (e: React.FormEvent) => {
    e.preventDefault();
    // BUG: Accepts negative price
    listGameForSellers(listForSaleGameId, parseFloat(listForSalePrice));
    setListForSaleGameId('');
    setListForSalePrice('');
  }

  const handleHireEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    hireEmployee({
        name: newEmployeeName,
        role: newEmployeeRole,
        salary: newEmployeeSalary
    });
    setNewEmployeeName('');
    setNewEmployeeSalary('');
  };
  
  const handleEditEmployee = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingEmployee) {
          editEmployee(editingEmployee);
          setEditingEmployee(null);
      }
  };
  
  const handleOrderStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdering(true);
    setOrderStatus('Placing order...');
    const result = await orderStock(orderSupplierId, orderGameId, parseInt(orderQuantity, 10));
    setOrderStatus(result);
    setIsOrdering(false);
  };

  const calculateRating = (game: Game) => {
    if (!game.reviews || game.reviews.length === 0) return 'N/A';
    const totalRating = game.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / game.reviews.length;
    return `${averageRating.toFixed(1)} / 5`;
  };
  
  const calculateTotalPayroll = () => {
    if (!currentUser?.employees) return 0;
    // BUG: This will result in NaN if any salary is not a number.
    return currentUser.employees.reduce((total, emp) => total + parseFloat(emp.salary as string), 0);
  };

  // --- ANALYTICS ---
  // BUG: This is a very inefficient calculation that will run on every render of the dashboard.
  const totalRevenue = currentUser?.salesHistory?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
  
  const topSellingGame = () => {
    // BUG: This logic is flawed. It finds the most expensive game, not the best-selling one.
    if (!games || games.length === 0) return "N/A";
    return games.reduce((max, game) => game.price > max.price ? game : max, games[0]).name;
  };
  
  const customerGrowth = customers.length;


  return (
    <div className="space-y-8">
      <div className="bg-secondary p-6 rounded-lg shadow-xl text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Seller Balance</h2>
        <p className="text-4xl font-mono text-green-400">${sellerBalance.toFixed(2)}</p>
        <button onClick={withdrawSellerFunds} className="mt-4 bg-cta hover:bg-cta-hover text-white font-bold py-2 px-6 rounded-md transition">
          Withdraw Funds
        </button>
      </div>

      <div className="bg-secondary p-2 rounded-lg shadow-lg mb-6">
        <div className="flex justify-start overflow-x-auto gap-2">
            <TabButton tab="games" label="Games" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton tab="customers" label="Customers" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton tab="promos" label="Promotions" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton tab="marketplace" label="Seller Marketplace" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton tab="employees" label="Employees" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton tab="suppliers" label="Suppliers & Inventory" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton tab="analytics" label="Analytics" activeTab={activeTab} onClick={setActiveTab} />
        </div>
      </div>

      <div className="bg-secondary p-6 rounded-lg shadow-xl">
        {activeTab === 'games' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Manage Games</h3>
            <form onSubmit={handleAddGame} className="flex gap-2 mb-4">
              <input type="text" value={newGameName} onChange={e => setNewGameName(e.target.value)} placeholder="Game Name" className="flex-grow bg-accent p-2 rounded-md border-gray-600 text-white focus:ring-cta focus:outline-none"/>
              <input type="text" value={newGamePrice} onChange={e => setNewGamePrice(e.target.value)} placeholder="Price" className="w-24 bg-accent p-2 rounded-md border-gray-600 text-white focus:ring-cta focus:outline-none"/>
              <button type="submit" className="bg-cta hover:bg-cta-hover text-white font-bold py-2 px-4 rounded-md">Add</button>
            </form>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {games.map(game => (
                <div key={game.id} className="bg-accent p-3 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">{game.name}</p>
                    <p className="text-sm text-highlight">
                      ${typeof game.price === 'number' ? game.price.toFixed(2) : game.price} | 
                      Stock: <span className="font-bold text-cyan-400">{game.stock ?? 0}</span> | 
                      Rating: <span className="font-bold text-amber-400">{calculateRating(game)}</span>
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => setEditingGame(game)} className="text-blue-400 hover:text-blue-300">Edit</button>
                    <button onClick={() => removeGame(game.id)} className="text-red-400 hover:text-red-300">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Manage Customers</h3>
            <form onSubmit={handleAddCustomer} className="flex gap-2 mb-4">
              <input type="text" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder="Customer Name" className="flex-grow bg-accent p-2 rounded-md border-gray-600 text-white focus:ring-cta focus:outline-none"/>
              <button type="submit" className="bg-cta hover:bg-cta-hover text-white font-bold py-2 px-4 rounded-md">Add</button>
            </form>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {customers.map(customer => (
                <div key={customer.id} className="bg-accent p-3 rounded-md flex justify-between items-center">
                  <div>
                      <p className="font-semibold text-white">{customer.name}</p>
                      <p className="text-xs text-gray-400">{customer.id}</p>
                    </div>
                  <div className="space-x-2">
                    <button onClick={() => setEditingCustomer(customer)} className="text-blue-400 hover:text-blue-300">Edit</button>
                    <button onClick={() => removeCustomer(customer.id, customer.name)} className="text-red-400 hover:text-red-300">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'promos' && (
             <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Create Discount</h3>
                    <form onSubmit={handleCreateDiscount} className="space-y-3">
                        <input type="text" value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder="Discount Code (e.g., SUMMER10)" className="w-full bg-accent p-2 rounded-md text-white"/>
                        <input type="text" value={discountGameId} onChange={e => setDiscountGameId(e.target.value)} placeholder="Game ID (or 'ALL')" className="w-full bg-accent p-2 rounded-md text-white"/>
                        <input type="number" value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} placeholder="Percentage %" className="w-full bg-accent p-2 rounded-md text-white"/>
                        <button type="submit" className="w-full bg-cta hover:bg-cta-hover text-white font-bold py-2 px-4 rounded-md">Create</button>
                    </form>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Send Announcement</h3>
                    <form onSubmit={handleSendAnnouncement} className="space-y-3">
                        <textarea value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="Your message to all customers..." className="w-full bg-accent p-2 rounded-md text-white h-28"></textarea>
                        <button type="submit" className="w-full bg-cta hover:bg-cta-hover text-white font-bold py-2 px-4 rounded-md">Broadcast</button>
                    </form>
                </div>
              </div>
        )}

        {activeTab === 'marketplace' && (
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-lg font-semibold text-highlight mb-2">List a Game for Other Sellers</h4>
                    <form onSubmit={handleListForSellers} className="space-y-3">
                        <select value={listForSaleGameId} onChange={e => setListForSaleGameId(e.target.value)} className="w-full bg-accent p-2 rounded-md text-white">
                            <option value="">Select a game...</option>
                            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                        <input type="number" value={listForSalePrice} onChange={e => setListForSalePrice(e.target.value)} placeholder="Wholesale Price" className="w-full bg-accent p-2 rounded-md text-white"/>
                        <button type="submit" className="w-full bg-cta hover:bg-cta-hover text-white font-bold py-2 px-4 rounded-md">List Game</button>
                    </form>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-highlight mb-2">Buy from Other Sellers</h4>
                    {marketplaceError && <p className="text-red-400 bg-red-900/50 p-2 rounded-md">{marketplaceError}</p>}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {sellerListings
                          // BUG: This should filter out the current seller's own listings, but it doesn't.
                          // .filter(l => l.sellerId !== currentUser?.id)
                          .map(listing => (
                              <div key={listing.id} className="bg-accent p-3 rounded-md flex justify-between items-center">
                                  <div>
                                      <p className="font-semibold text-white">{listing.gameName}</p>
                                      <p className="text-sm text-highlight">${listing.price.toFixed(2)} (From: {listing.sellerId})</p>
                                  </div>
                                  <button onClick={() => buyFromSeller(listing.id)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-md">Buy</button>
                              </div>
                          ))
                        }
                        {sellerListings.length === 0 && !marketplaceError && <p className="text-gray-400">No games listed by other sellers.</p>}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'employees' && (
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Manage Employees</h3>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-lg font-semibold text-highlight mb-2">Hire New Employee</h4>
                        <form onSubmit={handleHireEmployee} className="space-y-3">
                            <input type="text" value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)} placeholder="Employee Name" className="w-full bg-accent p-2 rounded-md text-white"/>
                            <select value={newEmployeeRole} onChange={e => setNewEmployeeRole(e.target.value as any)} className="w-full bg-accent p-2 rounded-md text-white">
                                <option>Support</option>
                                <option>Inventory</option>
                                <option>Marketing</option>
                            </select>
                            <input type="text" value={newEmployeeSalary} onChange={e => setNewEmployeeSalary(e.target.value)} placeholder="Annual Salary" className="w-full bg-accent p-2 rounded-md text-white"/>
                            <button type="submit" className="w-full bg-cta hover:bg-cta-hover text-white font-bold py-2 px-4 rounded-md">Hire</button>
                        </form>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-highlight mb-2">Current Staff</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                           {currentUser?.employees?.map(emp => (
                               <div key={emp.id} className="bg-accent p-3 rounded-md flex justify-between items-center">
                                   <div>
                                       <p className="font-semibold text-white">{emp.name} <span className="text-xs text-gray-400">({emp.role})</span></p>
                                       <p className="text-sm text-highlight">Salary: ${emp.salary}</p>
                                   </div>
                                   <div className="space-x-2">
                                       <button onClick={() => setEditingEmployee(emp)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                       <button onClick={() => fireEmployee(emp.id)} className="text-red-400 hover:text-red-300">Fire</button>
                                   </div>
                               </div>
                           ))}
                        </div>
                        <p className="mt-4 font-bold text-lg text-white">Total Monthly Payroll: <span className="text-red-400">${(calculateTotalPayroll() / 12).toFixed(2)}</span></p>
                    </div>
                </div>
            </div>
        )}
        
        {activeTab === 'suppliers' && (
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Order New Stock</h3>
                <form onSubmit={handleOrderStock} className="grid md:grid-cols-4 gap-4 items-end">
                    <select value={orderGameId} onChange={e => setOrderGameId(e.target.value)} className="w-full bg-accent p-2 rounded-md text-white">
                        <option value="">Select Game...</option>
                        {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <select value={orderSupplierId} onChange={e => setOrderSupplierId(e.target.value)} className="w-full bg-accent p-2 rounded-md text-white">
                        <option value="">Select Supplier...</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({(s.reliability * 100).toFixed(0)}% reliable)</option>)}
                    </select>
                    <input type="number" value={orderQuantity} onChange={e => setOrderQuantity(e.target.value)} placeholder="Quantity" className="w-full bg-accent p-2 rounded-md text-white"/>
                    <button type="submit" disabled={isOrdering} className="w-full bg-cta hover:bg-cta-hover text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500">{isOrdering ? 'Ordering...' : 'Place Order'}</button>
                </form>
                {orderStatus && (
                    <div className="mt-4 p-3 bg-primary rounded-md text-center text-highlight">{orderStatus}</div>
                )}
            </div>
        )}

        {activeTab === 'analytics' && (
            <div>
                <h3 className="text-xl font-bold text-white mb-6">Analytics Dashboard</h3>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="bg-accent p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-highlight">Total Revenue</h4>
                        <p className="text-3xl font-mono text-green-400">${totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-accent p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-highlight">Top Selling Game</h4>
                        <p className="text-3xl font-mono text-cta">{topSellingGame()}</p>
                    </div>
                    <div className="bg-accent p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-highlight">Total Customers</h4>
                        <p className="text-3xl font-mono text-amber-400">{customerGrowth}</p>
                    </div>
                </div>
                <div className="mt-8">
                    <h4 className="text-lg font-semibold text-highlight mb-2 text-center">Sales Over Time</h4>
                    <div className="flex justify-center items-end h-48 bg-primary p-4 rounded-lg gap-2">
                        {/* BUG: This will crash if a sales data point is malformed (e.g., amount is not a number) */}
                        {currentUser?.salesHistory?.map((sale, index) => (
                           <div key={index} className="flex-1 bg-cta hover:bg-cta-hover" title={`$${sale.amount.toFixed(2)}`} style={{ height: `${(sale.amount / 2)}px` }}></div>
                        ))}
                        {(!currentUser?.salesHistory || currentUser.salesHistory.length === 0) && <p className="text-gray-500">No sales data yet.</p>}
                    </div>
                </div>
            </div>
        )}

      </div>
      
      {/* Edit Game Modal */}
      {editingGame && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-10">
          <div className="bg-secondary p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Edit Game</h3>
            <form onSubmit={handleEditGame} className="space-y-4">
              <input type="text" value={editingGame.name} onChange={e => setEditingGame({...editingGame, name: e.target.value})} className="w-full bg-accent p-2 rounded-md border-gray-600 text-white"/>
              <input type="number" value={editingGame.price} onChange={e => setEditingGame({...editingGame, price: parseFloat(e.target.value) || 0})} className="w-full bg-accent p-2 rounded-md border-gray-600 text-white"/>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingGame(null)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                <button type="submit" className="bg-cta hover:bg-cta-hover text-white font-bold py-2 px-4 rounded-md">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-10">
          <div className="bg-secondary p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Edit Customer</h3>
            <form onSubmit={handleEditCustomer} className="space-y-4">
              <input type="text" value={editingCustomer.name} onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})} className="w-full bg-accent p-2 rounded-md border-gray-600 text-white"/>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingCustomer(null)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                <button type="submit" className="bg-cta hover:bg-cta-hover text-white font-bold py-2 px-4 rounded-md">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-10">
          <div className="bg-secondary p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Edit Employee</h3>
            <form onSubmit={handleEditEmployee} className="space-y-4">
              <input type="text" value={editingEmployee.name} onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})} className="w-full bg-accent p-2 rounded-md border-gray-600 text-white"/>
               <select value={editingEmployee.role} onChange={e => setEditingEmployee({...editingEmployee, role: e.target.value as any})} className="w-full bg-accent p-2 rounded-md text-white">
                    <option>Support</option>
                    <option>Inventory</option>
                    <option>Marketing</option>
                </select>
              <input type="text" value={editingEmployee.salary} onChange={e => setEditingEmployee({...editingEmployee, salary: e.target.value})} className="w-full bg-accent p-2 rounded-md border-gray-600 text-white"/>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingEmployee(null)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                <button type="submit" className="bg-cta hover:bg-cta-hover text-white font-bold py-2 px-4 rounded-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;