// FIX: Changed 'reac' to 'react' to fix all context-related errors.
import React, { createContext, useState, useEffect } from 'react';
import { User, Role, Game, Customer, CartItem, Invoice, Review, Discount, TradeRequest, Achievement, SellerListing, ChatMessage, Gift, Employee, Supplier, SalesDataPoint } from '../types';

// --- MOCK DATA ---
const initialUsers: User[] = [
  { id: 'seller1', name: 'GameGods', role: Role.Seller, employees: [
      { id: 'emp1', name: 'John Doe', role: 'Support', salary: 30000 },
      { id: 'emp2', name: 'Jane Smith', role: 'Inventory', salary: 'Thirty Five Thousand' } // BUG: Invalid salary
  ], salesHistory: [
      { date: '2024-07-01', amount: 120.50 },
      { date: '2024-07-02', amount: 89.99 },
  ]},
  { id: 'customer1', name: 'NewbieNoob', role: Role.Customer, description: "Just here to play!", balance: 100, wishlist: ['game3', null], achievements: [], lastLogin: '2024-01-01' },
  { id: 'customer2', name: 'ProGamer', role: Role.Customer, description: "Speedruns and stuff.", balance: 500, wishlist: ['game1'], achievements: [], lastLogin: '2024-01-01' },
];

const initialGames: Game[] = [
  { id: 'game1', name: 'Cyberpunk 2078', price: 59.99, sellerId: 'seller1', reviews: [{userId: 'customer1', userName: 'NewbieNoob', rating: 5, comment: 'Glitchy but fun!'}], stock: 10 },
  { id: 'game2', name: 'Witcher 4: Wildest Hunt', price: 69.99, sellerId: 'seller1', stock: 5 },
  { id: 'game3', name: 'Star Citizen', price: 45.00, sellerId: 'seller1', stock: 0 },
];

const initialCustomers: Customer[] = [
  { id: 'cust-a', name: 'Alice', sellerId: 'seller1' },
  { id: 'cust-b', name: 'Bob', sellerId: 'seller1' },
];

const initialAchievements: Achievement[] = [
    { id: 'achv1', name: 'First Purchase', description: 'Buy your first game.', unlocked: false },
    { id: 'achv2', name: 'Reviewer', description: 'Review a game.', unlocked: false },
    { id: 'achv3', name: 'High Roller', description: 'Have over $200 in your wallet.', unlocked: false },
    { id: 'achv4', name: 'Trader', description: 'Complete a trade with another user.', unlocked: false },
    { id: 'achv5', name: 'Generous', description: 'Gift a game to another player.', unlocked: false },
];

const initialSuppliers: Supplier[] = [
    { id: 'sup1', name: 'Key Kings', reliability: 0.9 },
    { id: 'sup2', name: 'Digital Dreams Inc.', reliability: 0.75 },
    { id: 'sup3', name: 'Glitched Goods Co.', reliability: 0.5 }, // BUG: Unreliable supplier
];

interface AppContextType {
  currentUser: User | null;
  users: User[];
  games: Game[];
  customers: Customer[];
  cart: CartItem[];
  purchasedGames: Game[];
  sellerBalance: number;
  sellerNotification: string;
  tradeRequests: TradeRequest[];
  sellerListings: SellerListing[];
  chatMessages: ChatMessage[];
  gifts: Gift[];
  suppliers: Supplier[];
  login: (id: string) => boolean;
  register: (name: string, role: Role) => void;
  logout: () => void;
  // Seller Actions
  addGame: (name: string, price: string) => void;
  editGame: (id: string, name: string, price: number) => void;
  removeGame: (id: string) => void;
  addCustomer: (name: string) => void;
  editCustomer: (id: string, name: string) => void;
  removeCustomer: (id: string, name: string) => void;
  withdrawSellerFunds: () => Promise<void>;
  createDiscount: (discount: Discount) => void;
  sendNotification: (message: string) => void;
  listGameForSellers: (gameId: string, price: number) => void;
  buyFromSeller: (listingId: string) => void;
  hireEmployee: (employee: Omit<Employee, 'id'>) => void;
  fireEmployee: (employeeId: string) => void;
  editEmployee: (employee: Employee) => void;
  orderStock: (supplierId: string, gameId: string, quantity: number) => Promise<string>;
  // Customer Actions
  updateProfile: (name: string, description: string) => void;
  deposit: (amount: number) => void;
  withdraw: (amount: number) => void;
  editDeposit: (newBalance: number) => void;
  addToCart: (game: Game) => void;
  removeFromCart: (gameId: string) => void;
  buyGames: () => Promise<Invoice | null>;
  cancelPurchase: (gameId: string) => void;
  addReview: (gameId: string, review: Omit<Review, 'userId' | 'userName'>) => void;
  applyDiscount: (code: string) => void;
  addToWishlist: (gameId: string) => void;
  removeFromWishlist: (gameId: string) => void;
  proposeTrade: (toUserId: string, offeredGameId: string, requestedGameId: string) => void;
  respondToTrade: (tradeId: string, response: 'ACCEPTED' | 'DECLINED') => void;
  unlockAchievement: (achievementId: string) => void;
  sendMessage: (text: string) => void;
  giftGame: (toUserId: string, gameId: string, message: string) => Promise<boolean>;
}

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    // BUG: achievements are not loaded from localStorage, causing them to reset on refresh.
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [games, setGames] = useState<Game[]>(initialGames);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [purchasedGames, setPurchasedGames] = useState<Game[]>([]);
  const [sellerBalance, setSellerBalance] = useState<number>(0);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [sellerNotification, setSellerNotification] = useState<string>('');
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([]);
  const [sellerListings, setSellerListings] = useState<SellerListing[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);


  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      // Achievement check logic
      if(currentUser.balance && currentUser.balance > 200) unlockAchievement('achv3');
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);


  // --- AUTH ---
  const login = (id: string): boolean => {
    const user = users.find(u => u.id === id);
    if (user) {
      // Daily Reward BUG: Simple string comparison allows multiple claims if user logs into an old account.
      // It also doesn't properly check if the date is actually different.
      const today = new Date().toDateString();
      if (user.lastLogin !== today) {
        alert("Welcome back! Here's a daily login bonus of $5!");
        user.balance = (user.balance || 0) + 5;
        user.lastLogin = today;
      }
      setCurrentUser({...user, achievements: user.achievements || initialAchievements});
      setUsers(users.map(u => u.id === user.id ? user : u));
      return true;
    }
    return false;
  };

  const register = (name: string, role: Role) => {
    const newUser: User = { id: `user-${Date.now()}`, name, role, balance: role === Role.Customer ? 50 : undefined, wishlist: [], achievements: initialAchievements, lastLogin: new Date().toDateString() };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
  };
  
  // --- SELLER ACTIONS ---
  const addGame = (name: string, price: string) => {
    if (!currentUser || currentUser.role !== Role.Seller) return;
    const newGame = { id: `game-${Date.now()}`, name, price: parseFloat(price) || 0, sellerId: currentUser.id, stock: 0 };
    setGames([...games, newGame]);
  };

  const editGame = (id: string, name:string, price:number) => {
     setGames(games.map(g => g.id === id ? {...g, name, price} : g));
  };
  
  const removeGame = (id: string) => {
    setGames(games.filter(g => g.id !== id));
  };

  const addCustomer = (name: string) => {
    if (!currentUser || currentUser.role !== Role.Seller) return;
    const newCustomer: Customer = { id: `cust-${Date.now()}`, name, sellerId: currentUser.id };
    // BUG: Direct state mutation. React might not re-render correctly.
    customers.push(newCustomer);
    setCustomers(customers);
  };

  const editCustomer = (id: string, name: string) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, name } : c));
  };

  const removeCustomer = (id: string, name: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const withdrawSellerFunds = (): Promise<void> => {
    // BUG: This promise never resolves, causing UI to hang in a loading state.
    return new Promise((resolve, reject) => {
      // setSellerBalance(0);
      // resolve();
    });
  };

  const createDiscount = (discount: Discount) => {
    if (discounts.some(d => d.code.toLowerCase() === discount.code.toLowerCase())) {
      alert('A discount with this code already exists.');
      return;
    }
    setDiscounts([...discounts, discount]);
  };

  const sendNotification = (message: string) => {
    setSellerNotification(message);
    setTimeout(() => setSellerNotification(''), 8000);
  };

  const listGameForSellers = (gameId: string, price: number) => {
    if (!currentUser || currentUser.role !== Role.Seller) return;
    const game = games.find(g => g.id === gameId);
    if (!game) return;
    const newListing: SellerListing = {
      id: `sell-list-${Date.now()}`,
      gameId: game.id,
      gameName: game.name,
      sellerId: currentUser.id,
      price: price
    };
    // BUG: This also removes the game from the customer-facing store.
    setGames(games.filter(g => g.id !== gameId));
    setSellerListings(prev => [...prev, newListing]);
  };
  
  const buyFromSeller = (listingId: string) => {
    if (!currentUser || currentUser.role !== Role.Seller) return;
    const listing = sellerListings.find(l => l.id === listingId);
    if (!listing || sellerBalance < listing.price) {
        alert("Cannot buy this game.");
        return;
    }
    // BUG: Deducts money from a random customer, not the seller.
    const randomCustomer = users.find(u => u.role === Role.Customer);
    if(randomCustomer) {
        const updatedCustomer = { ...randomCustomer, balance: (randomCustomer.balance || 0) - listing.price };
        setUsers(users.map(u => u.id === randomCustomer.id ? updatedCustomer : u));
    }

    const newGameForSeller: Game = {
        id: listing.gameId,
        name: listing.gameName,
        price: listing.price * 1.5, // Seller marks it up
        sellerId: currentUser.id,
    };
    setGames(prev => [...prev, newGameForSeller]);
    setSellerListings(prev => prev.filter(l => l.id !== listingId));
  };

  const hireEmployee = (employeeData: Omit<Employee, 'id'>) => {
    if (!currentUser) return;
    const newEmployee: Employee = { ...employeeData, id: `emp-${Date.now()}`};
    const updatedUser = {
      ...currentUser,
      employees: [...(currentUser.employees || []), newEmployee]
    };
    // BUG: This state update is not immediate, causing a visual glitch where the UI doesn't update right away.
    setTimeout(() => {
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    }, 1000);
  };
  
  const fireEmployee = (employeeId: string) => {
      if (!currentUser) return;
      const updatedEmployees = currentUser.employees?.filter(e => e.id !== employeeId);
      const updatedUser = { ...currentUser, employees: updatedEmployees };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };
  
  const editEmployee = (employeeToEdit: Employee) => {
      if (!currentUser || !currentUser.employees) return;
      // BUG: Direct state mutation. Editing one employee's name will change all employees' names.
      currentUser.employees.forEach(emp => {
          if (emp.id === employeeToEdit.id) {
              emp.name = employeeToEdit.name;
              emp.role = employeeToEdit.role;
              emp.salary = employeeToEdit.salary;
          }
      });
      setCurrentUser({ ...currentUser });
  };
  
  const orderStock = (supplierId: string, gameId: string, quantity: number): Promise<string> => {
    return new Promise((resolve) => {
        const supplier = suppliers.find(s => s.id === supplierId);
        const game = games.find(g => g.id === gameId);
        if (!supplier || !game) {
            resolve("Error: Invalid supplier or game.");
            return;
        }

        // BUG: Race condition possible. Multiple quick clicks can lead to incorrect stock counts.
        setTimeout(() => {
            const receivedQuantity = Math.floor(quantity * supplier.reliability);
            // BUG: Off-by-one error. Sometimes you get one less than you should.
            const finalQuantity = Math.random() > 0.5 ? receivedQuantity : receivedQuantity - 1; 

            setGames(prevGames => prevGames.map(g => 
                g.id === gameId ? { ...g, stock: (g.stock || 0) + finalQuantity } : g
            ));

            resolve(`Order placed with ${supplier.name}. Expected ${quantity}, received ${finalQuantity}.`);
        }, 1500); // Simulate network delay
    });
};

  // --- CUSTOMER ACTIONS ---
  const updateProfile = (name: string, description: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, name, description };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const deposit = (amount: number) => {
    if (!currentUser) return;
    setTimeout(() => {
      setCurrentUser(prevUser => {
        if (!prevUser) return null;
        const newBalance = (prevUser.balance || 0) + amount;
        return { ...prevUser, balance: newBalance };
      });
    }, 500);
  };

  const withdraw = (amount: number) => {
    if (!currentUser || !currentUser.balance || currentUser.balance < amount) return;
    setTimeout(() => {
      setCurrentUser(prevUser => {
        if (!prevUser || (prevUser.balance || 0) < amount) return prevUser;
        const newBalance = (prevUser.balance || 0) - amount;
        return { ...prevUser, balance: newBalance };
      });
    }, 500);
  };
  
  const editDeposit = (newBalance: number) => {
    if (!currentUser || newBalance < 0) return;
    setCurrentUser({...currentUser, balance: newBalance });
  }

  const addToCart = (game: Game) => {
    if ((game.stock || 0) <= 0) {
        alert("Sorry, this game is out of stock!");
        return;
    }
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === game.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === game.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        const cartItem: CartItem = { ...game, quantity: 1 };
        return [...prevCart, cartItem];
      }
    });
  };

  const removeFromCart = (gameId: string) => {
    setCart(cart.filter(item => item.id !== gameId));
  };
  
  const buyGames = async (): Promise<Invoice | null> => {
    if (!currentUser || !currentUser.balance) return null;
    
    const subTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    // BUG: vat can be a string, causing 'NaN' in calculations if not handled.
    const vat: string | number = (document.getElementById('vat-rate') as HTMLInputElement)?.value || '0.20';
    const total = subTotal + (subTotal * parseFloat(vat as string));

    if (currentUser.balance < total) {
      alert("Insufficient funds!");
      return null;
    }
    
    // Decrement stock
    cart.forEach(cartItem => {
        const gameInStore = games.find(g => g.id === cartItem.id);
        if (gameInStore) {
            gameInStore.stock = (gameInStore.stock || 0) - cartItem.quantity;
        }
    });
    setGames([...games]); // Force update

    // BUG: Race condition. Cart is cleared immediately, but balance update is delayed.
    setCart([]);
    await new Promise(res => setTimeout(res, 500)); // Fake network delay

    const newSalesData: SalesDataPoint = { date: new Date().toISOString().split('T')[0], amount: subTotal };
    const seller = users.find(u => u.id === 'seller1'); // Assuming single seller for simplicity
    if (seller) {
        seller.salesHistory = [...(seller.salesHistory || []), newSalesData];
        setUsers([...users]);
    }


    setCurrentUser({ ...currentUser, balance: currentUser.balance - total });
    setPurchasedGames([...purchasedGames, ...cart]);
    setSellerBalance(prev => prev + subTotal);
    unlockAchievement('achv1');
    
    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      items: cart,
      subTotal,
      vat,
      total,
      date: new Date()
    };
    return invoice;
  };

  const cancelPurchase = (gameId: string) => {
    const game = purchasedGames.find(g => g.id === gameId);
    if (!game || !currentUser) return;
    
    const refundAmount = game.price * 1.20;
    setCurrentUser({ ...currentUser, balance: (currentUser.balance || 0) + refundAmount });
    setSellerBalance(prev => prev - game.price);
    setPurchasedGames(purchasedGames.filter(g => g.id !== gameId));
  };
  
  const addReview = (gameId: string, review: Omit<Review, 'userId' | 'userName'>) => {
    if (!currentUser) return;
    const newReview: Review = { ...review, userId: currentUser.id, userName: currentUser.name };
    setGames(games.map(g => g.id === gameId ? { ...g, reviews: [...(g.reviews || []), newReview] } : g ));
    unlockAchievement('achv2');
  };

  const applyDiscount = (code: string) => {
    const discount = discounts.find(d => d.code.toLowerCase() === code.toLowerCase());
    if (!discount) {
      alert("Invalid discount code!");
      return;
    }
    setCart(cart.map(item => {
      if (discount.gameId.toLowerCase() === 'all' || item.id === discount.gameId) {
        return { ...item, price: item.price * (1 - discount.percentage / 100) };
      }
      return item;
    }));
  };

  const addToWishlist = (gameId: string) => {
    if (!currentUser) return;
    const currentWishlist = currentUser.wishlist || [];
    if (currentWishlist.includes(gameId)) return;
    const newWishlist = [...currentWishlist, gameId];
    setCurrentUser({ ...currentUser, wishlist: newWishlist });
    setUsers(users.map(u => u.id === currentUser.id ? { ...u, wishlist: newWishlist } : u));
  };

  const removeFromWishlist = (gameId: string) => {
    if (!currentUser || !currentUser.wishlist) return;
    const newWishlist = currentUser.wishlist.filter(id => id !== gameId);
    setCurrentUser({ ...currentUser, wishlist: newWishlist });
    setUsers(users.map(u => u.id === currentUser.id ? { ...u, wishlist: newWishlist } : u));
  };

  const proposeTrade = (toUserId: string, offeredGameId: string, requestedGameId: string) => {
      if (!currentUser) return;
      // BUG: Crashes if toUserId is invalid.
      const toUser = users.find(u => u.id === toUserId)!;
      const newTrade: TradeRequest = {
          id: `trade-${Date.now()}`,
          fromUserId: currentUser.id,
          fromUserName: currentUser.name,
          toUserId: toUser.id,
          // BUG: The offered and requested games are swapped.
          offeredGameId: requestedGameId,
          requestedGameId: offeredGameId,
          status: 'PENDING'
      };
      setTradeRequests(prev => [...prev, newTrade]);
  };

  const respondToTrade = (tradeId: string, response: 'ACCEPTED' | 'DECLINED') => {
      const trade = tradeRequests.find(t => t.id === tradeId);
      if (!trade || !currentUser || currentUser.id !== trade.toUserId) return;
      
      if (response === 'ACCEPTED') {
          // BUG: Accepter loses their game, but doesn't receive the new one.
          const gameToRemove = purchasedGames.find(g => g.id === trade.requestedGameId);
          if(gameToRemove) {
              setPurchasedGames(purchasedGames.filter(g => g.id !== gameToRemove.id));
          }
          unlockAchievement('achv4');
      }
      setTradeRequests(tradeRequests.map(t => t.id === tradeId ? {...t, status: response} : t));
  };
  
  const unlockAchievement = (achievementId: string) => {
    if (!currentUser) return;
    // BUG: Unlocking an achievement sends the achievement object, not its name, to the notification.
    const achievement = currentUser.achievements?.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
        sendNotification(`Achievement Unlocked: ${achievement as any}`);
        const updatedAchievements = currentUser.achievements?.map(a => a.id === achievementId ? {...a, unlocked: true} : a);
        setCurrentUser({...currentUser, achievements: updatedAchievements });
    }
  };

  const sendMessage = (text: string) => {
    if (!currentUser) return;
     // BUG: Randomly fails to send message, with no feedback to the user.
    if (Math.random() < 0.3) {
      console.error("Simulated network error: Message not sent.");
      return;
    }
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      text, // BUG: XSS vulnerability, text is not sanitized.
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const giftGame = async (toUserId: string, gameId: string, message: string): Promise<boolean> => {
    const game = games.find(g => g.id === gameId);
    const recipient = users.find(u => u.id === toUserId);

    // BUG: This will crash with a TypeError if recipient is not found.
    if (!currentUser || !game || !recipient.name) {
      return false;
    }
    
    // BUG: Gift service fee is parsed from a string, resulting in NaN
    const serviceFee = parseFloat("5% fee"); 
    const totalCost = game.price + serviceFee; // This will be NaN
    
    // BUG: No check if balance is sufficient, can lead to negative or NaN balance
    setCurrentUser({...currentUser, balance: (currentUser.balance || 0) - totalCost});

    const newGift: Gift = {
      id: `gift-${Date.now()}`,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId: toUserId,
      toUserName: recipient.name,
      gameId: game.id,
      gameName: game.name,
      date: new Date(),
      message,
    };
    setGifts(prev => [...prev, newGift]);
    unlockAchievement('achv5');
    // BUG: The recipient never actually receives the game in their purchased games list.
    return true;
  };


  return (
    <AppContext.Provider value={{
      currentUser, users, games, customers, cart, purchasedGames, sellerBalance, sellerNotification,
      tradeRequests, sellerListings, chatMessages, gifts, suppliers,
      login, register, logout, addGame, editGame, removeGame, addCustomer,
      editCustomer, removeCustomer, withdrawSellerFunds, createDiscount, sendNotification,
      listGameForSellers, buyFromSeller, hireEmployee, fireEmployee, editEmployee, orderStock,
      updateProfile, deposit, withdraw, editDeposit, addToCart, removeFromCart, buyGames,
      cancelPurchase, addReview, applyDiscount, addToWishlist, removeFromWishlist,
      proposeTrade, respondToTrade, unlockAchievement, sendMessage, giftGame
    }}>
      {children}
    </AppContext.Provider>
  );
};