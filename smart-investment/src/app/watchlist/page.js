"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

//watchlist page
export default function WatchlistPage() {
  const [user, setUser] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  //form data state
  const [formData, setFormData] = useState({
    symbol: "",
    quantity: "",
    purchasePrice: "",
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  //check auth state (load watchlist if logged in)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      //load watchlist if logged in
      if (currentUser) {
        loadWatchlist(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);


  //load watchlist holdings from firestore///////////////////////////////////
  const loadWatchlist = async (userId) => {
    try {
      //query watchlist by userId
      const q = query(collection(db, "watchlists"), where("userId", "==", userId));
      //get docs
      const querySnapshot = await getDocs(q);
      const holdingsData = [];
      //fetch current prices for each holding
      for (const docSnap of querySnapshot.docs) {
        const holding = { id: docSnap.id, ...docSnap.data() };
        //fetch current stock price from stocks API
        try {
          const res = await fetch(`/api/stocks/${holding.symbol}`);
          if (res.ok) {
            const stockData = await res.json();
            const currentPrice = stockData.quote?.regularMarketPrice || holding.purchasePrice;
            //calculate current value and gain/loss
            holding.currentPrice = currentPrice;
            holding.currentValue = currentPrice * holding.quantity;
            holding.costBasis = holding.purchasePrice * holding.quantity;
            holding.gain = holding.currentValue - holding.costBasis;
            holding.gainPercent = ((holding.gain / holding.costBasis) * 100);
          }
        } catch (error) {
          console.error(`Error fetching price for ${holding.symbol}:`, error);
          //fallback to purchase price if API fails (like an invalid symbol)
          holding.currentPrice = holding.purchasePrice;
          holding.currentValue = holding.purchasePrice * holding.quantity;
          holding.costBasis = holding.purchasePrice * holding.quantity;
          holding.gain = 0;
          holding.gainPercent = 0;
        }
        //add to holdings array
        holdingsData.push(holding);
      }
      //set holdings state
      setHoldings(holdingsData);
    } catch (error) {
      console.error("Error loading watchlist:", error);
      alert("Failed to load watchlist. Check console for details.");
    } finally {
      setLoading(false); 
    }
  };
  ////////////////////////////////////////////////////////////////

  //add new holding to Firestore///////////////////////////////////////
  const handleAddHolding = async (e) => {
    //prevent default form submission
    e.preventDefault();
    if (!user) return;
    //try to add holding
    try {
      const newHolding = {
        userId: user.uid,
        symbol: formData.symbol.toUpperCase().trim(),
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        purchaseDate: formData.purchaseDate,
        createdAt: new Date().toISOString()
      };
      //validate inputs
      if (newHolding.quantity <= 0 || newHolding.purchasePrice <= 0) {
        alert("Quantity and price must be greater than 0");
        return;
      }
      //add doc to firestore
      await addDoc(collection(db, "watchlists"), newHolding);
      //reset form
      setFormData({
        symbol: "",
        quantity: "",
        purchasePrice: "",
        purchaseDate: new Date().toISOString().split('T')[0]
      });
      setShowAddModal(false);
      //reload watchlist
      setLoading(true);
      loadWatchlist(user.uid);
    } catch (error) {
      console.error("Error adding holding:", error);
      alert("Failed to add holding. Check console for details.");
    }
  };
  ////////////////////////////////////////////////////////////////
  
  //delete holding from Firestore/////////////////////////////////////////////////////////////////////////
  const handleDelete = async (holdingId) => {
    //confirm deletion if yes then continue
    if (!confirm("Are you sure?")) return;
    //try to delete holding
    try {
      //delete doc from firestore
      await deleteDoc(doc(db, "watchlists", holdingId));
      //reload portfolio/////////
      setLoading(true);
      loadWatchlist(user.uid);
      ///////////////////////////////
    } catch (error) {
      //error handling then alert user
      //console log error for debugging
      console.error("Error deleting holding: ", error);
      alert("Failed to delete this holding");
    }
  };
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Calculate watchlist totals/////////////////////////////
  const totals = holdings.reduce((acc, holding) => {
    acc.totalValue += holding.currentValue || 0;
    acc.totalInvested += holding.costBasis || 0;
    acc.totalGain += holding.gain || 0;
    return acc;
  }, { totalValue: 0, totalInvested: 0, totalGain: 0 });
  ////////////////////////////////////////////////////////
  const totalGainPercent = totals.totalInvested > 0 
    ? ((totals.totalGain / totals.totalInvested) * 100) 
    : 0;

  //loading state page
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  //not logged in state (must be logged in to view watchlist)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-gray-700 mb-4">Please sign in to view your watchlist</p>
          <a href="/login" className="text-blue-500 hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      {/*background vid*/}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="object-cover w-full h-full">
          <source src="/homeback.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/*container for conetent*/}
      <div className="relative z-20 p-4 md:p-8">
        {/*section tag*/}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white"> Watchlist</h1>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <button
            onClick={() => window.location.href = '/dashboard' }
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition shadow-lg"
          >
            Bact To Dashboard
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition shadow-lg"
          >
            + Add Holding
          </button>
        </div>

        {/*watchlist total stats*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-5 ring ring-4 ring-gray-100">
            <p className="text-gray-600 text-sm font-normal">Total Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${totals.totalValue.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-5 ring ring-4 ring-gray-100">
            <p className="text-gray-600 text-sm font-normal">Total Invested</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${totals.totalInvested.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-5 ring ring-4 ring-gray-100">
            <p className="text-gray-600 text-sm font-normal">Total Gain/Loss</p>
            <p className={`text-2xl font-bold mt-1 ${totals.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.totalGain >= 0 ? '+' : ''} ${totals.totalGain.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-5 ring ring-4 ring-gray-100">
            <p className="text-gray-600 text-sm font-normal">Total Return Percentage</p>
            <p className={`text-2xl font-bold mt-1 ${totalGainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/*portfolio holdings stats*/}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden p-3 ring ring-4 ring-gray-100">
          {holdings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xl mb-2 font-bold">No holdings recorded</p>
              <p className="text-gray-400">Click "+Add Holding" to begin tracking your investments</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Symbol</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Shares</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Avg Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Current Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Market Value</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Gain/Loss</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Return %</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {holdings.map((holding) => (
                    <tr key={holding.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-blue-600">{holding.symbol}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{holding.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-700">${holding.purchasePrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">${holding.currentPrice?.toFixed(2) || 'N/A'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        ${holding.currentValue?.toFixed(2) || 'N/A'}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${holding.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {holding.gain >= 0 ? '+' : ''}${holding.gain?.toFixed(2) || '0.00'}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${holding.gainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {holding.gainPercent >= 0 ? '+' : ''}{holding.gainPercent?.toFixed(2) || '0.00'}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(holding.id)}
                          className="text-red-500 hover:text-red-700 font-medium transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/*add holding modal*/}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10 p-4">
          <div className="bg-white rounded-lg p-6 md:p-10 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center justify-center">Add New Acquisition</h2>
            <form onSubmit={handleAddHolding}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Symbol (Required)
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                  placeholder="such as AAPL"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Shares (Required)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  placeholder="such as 10.5"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Price (per share) (Required)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                  placeholder="such as 150.69"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date (Required)
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                  className="w-full border border-gray-400 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-900 transition font-medium"
                >
                  Add Holding
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-900 transition font-medium"
                >
                  Nevermind
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}