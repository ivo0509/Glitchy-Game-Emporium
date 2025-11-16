import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { Game, Invoice, User } from '../types';

const GiftModal: React.FC<{ game: Game; onClose: () => void }> = ({ game, onClose }) => {
    const { currentUser, users, giftGame } = useContext(AppContext);
    const [recipientId, setRecipientId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleGift = async () => {
        if (!recipientId) {
            setError('Please select a recipient.');
            return;
        }
        try {
            const success = await giftGame(recipientId, game.id, message);
            if(success) {
                onClose();
            } else {
                // BUG: Unhelpful generic error message
                setError('Error: Operation failed.');
            }
        } catch (e: any) {
            // BUG: The error object is not a string, will display [Object object]
            setError(`A critical error occurred: ${e}`);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-20">
            <div className="bg-secondary p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-4">Gift "{game.name}"</h3>
                {error && <p className="bg-red-500/50 text-white p-2 rounded-md mb-4">{error}</p>}
                <div className="space-y-4">
                    <select
                        value={recipientId}
                        onChange={e => setRecipientId(e.target.value)}
                        className="w-full bg-accent p-2 rounded-md text-white"
                    >
                        <option value="">Select a user to gift to...</option>
                        {/* BUG: Allows gifting to oneself */}
                        {users.filter(u => u.role === 'CUSTOMER').map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Add a personal message (optional)"
                        className="w-full bg-accent p-2 rounded-md text-white h-24"
                    />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                    <button onClick={handleGift} className="bg-cta hover:bg-cta-hover text-white font-bold py-2 px-4 rounded-md">Send Gift</button>
                </div>
            </div>
        </div>
    );
};

const GameCard: React.FC<{ 
    game: Game, 
    onAddToCart: (game: Game) => void, 
    onAddToWishlist: (gameId: string) => void,
    onGift: (game: Game) => void
}> = ({ game, onAddToCart, onAddToWishlist, onGift }) => (
    <div className="bg-accent p-4 rounded-lg shadow-lg flex flex-col justify-between relative">
        {(game.stock === undefined || game.stock > 0) ? null : 
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">OUT OF STOCK</div>
        }
        <div>
            <div className="h-32 bg-gray-500 rounded-md mb-4 flex items-center justify-center">
              <img src={`https://picsum.photos/seed/${game.id}/400/200`} alt={game.name} className="w-full h-full object-cover rounded-md"/>
            </div>
            <h4 className="text-lg font-bold text-white">{game.name}</h4>
            <p className="text-cta font-semibold text-xl">${typeof game.price === 'number' ? game.price.toFixed(2) : game.price}</p>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => onAddToCart(game)} disabled={(game.stock || 0) <= 0} className="w-full bg-cta hover:bg-cta-hover text-white font-bold py-2 px-4 rounded-md transition disabled:bg-gray-500 disabled:cursor-not-allowed">
              Add to Cart
          </button>
          <button onClick={() => onAddToWishlist(game.id)} title="Add to Wishlist" className="bg-highlight/20 hover:bg-highlight/40 text-white font-bold p-2 rounded-md transition">
            ⭐
          </button>
          <button onClick={() => onGift(game)} title="Gift Game" className="bg-pink-500 hover:bg-pink-600 text-white font-bold p-2 rounded-md transition">
            🎁
          </button>
        </div>
    </div>
);

const CustomerDashboard: React.FC = () => {
  const { 
    currentUser, users, games, updateProfile, deposit, withdraw, editDeposit, addToCart,
    cart, removeFromCart, buyGames, purchasedGames, cancelPurchase, addReview,
    applyDiscount, addToWishlist, removeFromWishlist, sellerNotification,
    tradeRequests, proposeTrade, respondToTrade, chatMessages, sendMessage
  } = useContext(AppContext);
  
  const [activeTab, setActiveTab] = useState('store');
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileDesc, setProfileDesc] = useState(currentUser?.description || '');
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [editBalance, setEditBalance] = useState(currentUser?.balance || 0);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [giftingGame, setGiftingGame] = useState<Game | null>(null);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  
  // Trade state
  const [tradeTargetUserId, setTradeTargetUserId] = useState('');
  const [tradeOfferedGameId, setTradeOfferedGameId] = useState('');
  const [tradeRequestedGameId, setTradeRequestedGameId] = useState('');

  // BUG: This effect creates a recursive loop if an achievement unlocks another achievement.
  // It checks achievements on every render, which is inefficient and dangerous.
  useEffect(() => {
    if (currentUser?.achievements) {
        // Some fake logic that could cause a loop
        if(currentUser.achievements.find(a => a.id === 'achv1' && a.unlocked)) {
            // unlockAchievement('achv1'); 
        }
    }
  });

  // BUG: Chat doesn't auto-scroll to the bottom on new messages.
  useEffect(() => {
    // if (chatBodyRef.current) {
    //   chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    // }
  }, [chatMessages]);


  useEffect(() => {
    setProfileName(currentUser?.name || '');
    setProfileDesc(currentUser?.description || '');
    setEditBalance(currentUser?.balance || 0);
  }, [currentUser]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileName, profileDesc);
  }

  const handleBuy = () => {
    buyGames().then(generatedInvoice => {
        if(generatedInvoice) {
            setInvoice(generatedInvoice);
        }
    });
  }

  const handleReviewSubmit = (e: React.FormEvent, gameId: string) => {
    e.preventDefault();
    addReview(gameId, { rating: reviewRating, comment: reviewComment });
    setReviewRating(5);
    setReviewComment('');
  };
  
  const handleApplyDiscount = () => {
    applyDiscount(discountCode);
    setDiscountCode('');
  };

  const handleProposeTrade = (e: React.FormEvent) => {
    e.preventDefault();
    proposeTrade(tradeTargetUserId, tradeOfferedGameId, tradeRequestedGameId);
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim() === '') return;
    sendMessage(chatMessage);
    // BUG: Input field doesn't clear after sending a message.
    // setChatMessage(''); 
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'store':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map(game => <GameCard key={game.id} game={game} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onGift={setGiftingGame} />)}
          </div>
        );
      case 'cart':
        const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        return (
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Shopping Cart</h3>
            {cart.length === 0 ? <p className="text-highlight">Your cart is empty.</p> : (
              <div>
                <div className="space-y-4">
                    {cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="bg-accent p-3 rounded-md flex justify-between items-center">
                        <p className="text-white">{item.name}</p>
                        <div className="flex items-center gap-4">
                        <p className="text-highlight">${item.price.toFixed(2)}</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300">Remove</button>
                        </div>
                    </div>
                    ))}
                </div>
                <div className="mt-6 flex items-center gap-2">
                    <input type="text" value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder="Discount Code" className="flex-grow bg-accent p-2 rounded-md border-gray-600 text-white"/>
                    <button onClick={handleApplyDiscount} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md">Apply</button>
                </div>
                <div className="text-right font-bold text-white text-xl mt-4 border-t border-gray-600 pt-4">
                  {/* BUG: A hidden input to allow user to break the VAT calculation */}
                  <input type="hidden" id="vat-rate" value="BROKEN" />
                  Total: ${cartTotal.toFixed(2)}
                </div>
                <button onClick={handleBuy} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md">
                  Buy Now
                </button>
              </div>
            )}
          </div>
        );
      case 'purchases':
        return (
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">My Games & Reviews</h3>
            {purchasedGames.length === 0 ? <p className="text-highlight">You haven't bought any games yet.</p> : (
              <div className="space-y-6">
                {purchasedGames.map(game => (
                   <div key={game.id} className="bg-accent p-4 rounded-md">
                     <div className="flex justify-between items-center mb-4">
                        <p className="text-white font-bold">{game.name}</p>
                        <button onClick={() => cancelPurchase(game.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md">
                          Cancel Purchase
                        </button>
                     </div>
                     <form onSubmit={(e) => handleReviewSubmit(e, game.id)} className="flex items-center gap-2">
                        <select value={reviewRating} onChange={e => setReviewRating(parseInt(e.target.value))} className="bg-primary p-2 rounded text-white">
                           <option>5</option><option>4</option><option>3</option><option>2</option><option>1</option>
                        </select>
                        <input type="text" value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Leave a review..." className="flex-grow bg-primary p-2 rounded text-white"/>
                        <button type="submit" className="bg-cta hover:bg-cta-hover text-white font-bold py-2 px-3 rounded-md">Submit</button>
                     </form>
                   </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'trades':
          const incomingTrades = tradeRequests.filter(t => t.toUserId === currentUser?.id && t.status === 'PENDING');
          return (
              <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Trade Center</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                      <div>
                          <h4 className="text-lg font-semibold text-highlight mb-2">Propose a Trade</h4>
                          <form onSubmit={handleProposeTrade} className="space-y-3">
                              <select value={tradeTargetUserId} onChange={e => setTradeTargetUserId(e.target.value)} className="w-full bg-accent p-2 rounded-md text-white">
                                  <option value="">Select User to Trade With...</option>
                                  {users.filter(u => u.id !== currentUser?.id && u.role === 'CUSTOMER').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                              </select>
                              <select value={tradeOfferedGameId} onChange={e => setTradeOfferedGameId(e.target.value)} className="w-full bg-accent p-2 rounded-md text-white">
                                  <option value="">Select Your Game to Offer...</option>
                                  {purchasedGames.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                              </select>
                              <input type="text" value={tradeRequestedGameId} onChange={e => setTradeRequestedGameId(e.target.value)} placeholder="Enter Game ID you want" className="w-full bg-accent p-2 rounded-md text-white"/>
                              <button type="submit" className="w-full bg-cta hover:bg-cta-hover text-white font-bold py-2 px-4 rounded-md">Propose Trade</button>
                          </form>
                      </div>
                      <div>
                          <h4 className="text-lg font-semibold text-highlight mb-2">Incoming Requests</h4>
                          <div className="space-y-2">
                              {incomingTrades.map(trade => (
                                  <div key={trade.id} className="bg-accent p-3 rounded-md">
                                      <p className="text-white">
                                          <span className="font-bold">{trade.fromUserName}</span> wants your{' '}
                                          <span className="text-cta">{games.find(g=>g.id === trade.requestedGameId)?.name || '...'}</span> for their{' '}
                                          <span className="text-cta">{games.find(g=>g.id === trade.offeredGameId)?.name || '...'}</span>.
                                      </p>
                                      <div className="flex justify-end gap-2 mt-2">
                                          <button onClick={() => respondToTrade(trade.id, 'ACCEPTED')} className="bg-green-600 text-white px-3 py-1 rounded">Accept</button>
                                          <button onClick={() => respondToTrade(trade.id, 'DECLINED')} className="bg-red-600 text-white px-3 py-1 rounded">Decline</button>
                                      </div>
                                  </div>
                              ))}
                              {incomingTrades.length === 0 && <p className="text-gray-400">No new trade requests.</p>}
                          </div>
                      </div>
                  </div>
              </div>
          );
      case 'chat':
          return (
              <div className="flex flex-col h-[500px]">
                  <h3 className="text-2xl font-bold text-white mb-4">Global Chat</h3>
                  <div ref={chatBodyRef} className="flex-grow bg-primary p-4 rounded-md overflow-y-auto space-y-4">
                      {chatMessages.map(msg => (
                          <div key={msg.id} className={`flex items-start gap-3 ${msg.userId === currentUser?.id ? 'flex-row-reverse' : ''}`}>
                              <div className="w-8 h-8 rounded-full bg-cta flex items-center justify-center font-bold text-white text-sm">
                                  {msg.userName.substring(0, 1)}
                              </div>
                              <div className={`p-3 rounded-lg max-w-xs ${msg.userId === currentUser?.id ? 'bg-cta-hover' : 'bg-accent'}`}>
                                  <p className="text-white text-sm" dangerouslySetInnerHTML={{ __html: msg.text }}></p>
                                  <p className="text-xs text-gray-400 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                              </div>
                          </div>
                      ))}
                      {chatMessages.length === 0 && <p className="text-gray-500 text-center">Be the first to say something!</p>}
                  </div>
                  <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                      <input 
                          type="text" 
                          value={chatMessage} 
                          onChange={e => setChatMessage(e.target.value)} 
                          placeholder="Type a message... (e.g., <img src=x onerror=alert('XSS!')>)" 
                          className="flex-grow bg-accent p-3 rounded-md text-white"
                      />
                      <button type="submit" className="bg-cta hover:bg-cta-hover text-white font-bold py-2 px-6 rounded-md">Send</button>
                  </form>
              </div>
          )
      case 'wishlist':
          // BUG: This will crash if a wishlist item is null.
          const wishlistGames = currentUser?.wishlist?.map(id => games.find(g => g!.id === id)).filter(Boolean) as Game[] || [];
          return (
              <div>
                  <h3 className="text-2xl font-bold text-white mb-4">My Wishlist</h3>
                  {wishlistGames.length === 0 ? <p className="text-highlight">Your wishlist is empty.</p> : (
                      <div className="space-y-4">
                          {wishlistGames.map(game => (
                              <div key={game.id} className="bg-accent p-3 rounded-md flex justify-between items-center">
                                  <p className="text-white">{game.name}</p>
                                  <button onClick={() => removeFromWishlist(game.id)} className="text-red-400 hover:text-red-300">Remove</button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          );
      case 'profile':
        return (
          <div>
             <h3 className="text-2xl font-bold text-white mb-4">My Profile</h3>
             <div className="grid md:grid-cols-2 gap-8">
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-highlight mb-1">Name</label>
                    <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full bg-accent p-2 rounded-md text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-highlight mb-1">Description</label>
                    <textarea value={profileDesc} onChange={e => setProfileDesc(e.target.value)} className="w-full bg-accent p-2 rounded-md text-white h-24"></textarea>
                  </div>
                  <button type="submit" className="bg-cta hover:bg-cta-hover text-white font-bold py-2 px-4 rounded-md">Update Profile</button>
                </form>
                <div>
                  <h4 className="text-lg font-semibold text-highlight mb-2">Achievements</h4>
                  <div className="space-y-2">
                    {currentUser?.achievements?.map(ach => (
                      <div key={ach.id} className={`p-2 rounded-md ${ach.unlocked ? 'bg-green-800/50' : 'bg-accent/50'}`}>
                        <p className={`font-bold ${ach.unlocked ? 'text-green-300' : 'text-white'}`}>{ach.name}</p>
                        <p className="text-sm text-gray-400">{ach.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        );
      case 'wallet':
        return (
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">My Wallet</h3>
            <p className="text-3xl font-mono text-green-400 mb-6">Balance: ${currentUser?.balance?.toFixed(2)}</p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-accent p-4 rounded-md">
                <h4 className="font-bold text-white mb-2">Deposit</h4>
                <input type="number" value={depositAmount} onChange={e => setDepositAmount(parseFloat(e.target.value) || 0)} className="w-full bg-primary p-2 rounded-md text-white mb-2"/>
                <button onClick={() => deposit(depositAmount)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md">Deposit</button>
              </div>
              <div className="bg-accent p-4 rounded-md">
                <h4 className="font-bold text-white mb-2">Withdraw</h4>
                <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(parseFloat(e.target.value) || 0)} className="w-full bg-primary p-2 rounded-md text-white mb-2"/>
                <button onClick={() => withdraw(withdrawAmount)} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-md">Withdraw</button>
              </div>
              <div className="bg-accent p-4 rounded-md">
                <h4 className="font-bold text-white mb-2">Edit Balance (Debug)</h4>
                <input type="number" value={editBalance} onChange={e => setEditBalance(parseFloat(e.target.value) || 0)} className="w-full bg-primary p-2 rounded-md text-white mb-2"/>
                <button onClick={() => editDeposit(editBalance)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-md">Set Balance</button>
              </div>
            </div>
          </div>
        )
    }
  }

  const TabButton: React.FC<{tab:string, label:string}> = ({ tab, label }) => (
    <button 
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 font-semibold rounded-md transition ${activeTab === tab ? 'bg-cta text-white' : 'text-highlight hover:bg-accent'}`}>
        {label}
    </button>
  );

  return (
    <div>
        {giftingGame && <GiftModal game={giftingGame} onClose={() => setGiftingGame(null)} />}
        {sellerNotification && (
          <div className="bg-yellow-500 text-black p-3 rounded-lg text-center font-semibold mb-4 shadow-lg animate-pulse">
            {sellerNotification}
          </div>
        )}
        <div className="bg-secondary p-2 rounded-lg shadow-lg mb-6 flex justify-center flex-wrap gap-2">
            <TabButton tab="store" label="Store"/>
            <TabButton tab="chat" label="Global Chat"/>
            <TabButton tab="cart" label={`Cart (${cart.length})`}/>
            <TabButton tab="wishlist" label="Wishlist"/>
            <TabButton tab="trades" label="Trade Center"/>
            <TabButton tab="purchases" label="My Games"/>
            <TabButton tab="profile" label="Profile"/>
            <TabButton tab="wallet" label="Wallet"/>
        </div>
        <div className="bg-secondary p-6 rounded-lg shadow-lg min-h-[400px]">
            {renderContent()}
        </div>

        {invoice && (
             <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-20">
                <div className="bg-white text-black p-8 rounded-lg w-full max-w-lg">
                    <h2 className="text-3xl font-bold text-center mb-4">Invoice</h2>
                    <p className="text-sm text-gray-500 text-center mb-6">ID: {invoice.id}</p>
                    <div className="space-y-2 mb-6">
                        {invoice.items.map(item => (
                            <div key={item.id} className="flex justify-between border-b pb-1">
                                <span>{item.name}</span>
                                <span>${item.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2 font-medium">
                        <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span> <span>${invoice.subTotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">VAT (20%):</span> <span>${parseFloat(String(invoice.vat)).toFixed(2)}</span></div>
                        <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2"><span >Total:</span> <span>${invoice.total.toFixed(2)}</span></div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                       <button onClick={() => window.print()} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md">Print</button>
                       <button onClick={() => setInvoice(null)} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-md">Close</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
};

export default CustomerDashboard;