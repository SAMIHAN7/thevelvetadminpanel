'use client'
import React, { useState, useEffect } from 'react';
import { Search, Gift, Plus, Edit3, Trash2, Eye, MoreVertical, Calendar, CheckCircle, XCircle, Power, Zap } from 'lucide-react';
import { useCookies } from 'next-client-cookies';
const BASE_URL = `${process.env.NEXT_PUBLIC_ROUTES_API_URL}/offfer`
console.log(BASE_URL);
const OffersPage = () => {
  const cookie = useCookies();
   const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    offer: '',
    description: '',
    isLive: false
  });

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/all`, {
        headers: {
          'Content-Type': 'application/json',
          'auth-token': cookie.get('auth')
        }
      });
      const data = await res.json();
      setOffers(data?.data || []);
      setFilteredOffers(data?.data || []);
    } catch (err) {
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    let filtered = offers.filter(o =>
      o?.offer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o?.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal = a?.[sortBy], bVal = b?.[sortBy];
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    setFilteredOffers(filtered);
  }, [searchTerm, offers, sortBy, sortOrder]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

 const toggleOfferStatus = async (id) => {
  try {
    const offerToUpdate = offers.find(offer => offer?._id === id);
    if (!offerToUpdate) return;

    const updatedOffer = {
      offer: offerToUpdate?.offer,
      description: offerToUpdate?.description,
      isLive: !offerToUpdate?.isLive
    };

    const res = await fetch(`${BASE_URL}/updateoffer/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'auth-token': cookie.get('auth')
      },
      body: JSON.stringify(updatedOffer)
    });

    if (res.ok) {
      fetchOffers(); // Refresh list
    } else {
      const errData = await res.json();
      console.error('Update failed:', errData?.error);
    }
  } catch (err) {
    console.error('Error updating offer status:', err);
  }
};


  const handleSubmit = async () => {
    if (!formData?.offer?.trim() || !formData?.description?.trim()) return;

    try {
      if (editingOffer) {
        await fetch(`${BASE_URL}/updateoffer/${editingOffer?._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'auth-token': cookie.get('auth')
          },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch(`${BASE_URL}/create`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'auth-token': cookie.get('auth')
          },
          body: JSON.stringify(formData)
        });
      }
      resetForm();
      fetchOffers();
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${BASE_URL}/deletoffer/${id}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': cookie.get('auth')
        }
      });
      fetchOffers();
    } catch (err) {
      console.error('Error deleting offer:', err);
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      offer: offer.offer,
      description: offer.description,
      isLive: offer.isLive
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setEditingOffer(null);
    setFormData({ offer: '', description: '', isLive: false });
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Offers Management</h1>
              <p className="text-gray-400 mt-1">Create and manage promotional offers</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>Add Offer</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Offers</p>
                <p className="text-2xl font-bold text-white">{offers?.length || 0}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                <Gift className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Live Offers</p>
                <p className="text-2xl font-bold text-green-400">
                  {(offers || []).filter(offer => offer?.isLive)?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Draft Offers</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {(offers || []).filter(offer => !offer?.isLive)?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <Edit3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
         
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search offers by title or description..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              value={sortBy}
              onChange={(e) => setSortBy(e?.target?.value)}
            >
              <option value="createdAt">Sort by Created Date</option>
              <option value="updatedAt">Sort by Updated Date</option>
              <option value="offer">Sort by Title</option>
            </select>
            <button
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOffers.map((offer) => (
          <div key={offer?._id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    offer?.isLive ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'
                  }`}>
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-bold text-lg line-clamp-1">{offer?.offer}</h3>
                      <button
                        onClick={() => toggleOfferStatus(offer?._id)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                          offer?.isLive 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {offer?.isLive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        <span>{offer?.isLive ? 'Live' : 'Draft'}</span>
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">ID: {offer?._id}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">{offer?.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-yellow-400" />
                  <span className="text-gray-400 text-sm">Created: {formatDate(offer?.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-orange-400" />
                  <span className="text-gray-400 text-sm">Updated: {formatDate(offer?.updatedAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <button
                  onClick={() => toggleOfferStatus(offer._id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    offer.isLive 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  <Power className="h-4 w-4" />
                  <span>{offer.isLive ? 'Deactivate' : 'Activate'}</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(offer)}
                    className="p-2 text-yellow-400 hover:bg-yellow-500 hover:text-white rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(offer._id)}
                    className="p-2 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOffers.length === 0 && (
        <div className="text-center py-12">
          <Gift className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No offers found</h3>
          <p className="text-gray-500 mb-4">Create your first offer to get started</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg transition-all duration-200"
          >
            Create First Offer
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingOffer ? 'Edit Offer' : 'Create New Offer'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Offer Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.offer}
                  onChange={(e) => setFormData({...formData, offer: e?.target?.value})}
                  placeholder="Enter offer title..."
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e?.target?.value})}
                  placeholder="Enter offer description..."
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isLive"
                  className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                  checked={formData.isLive}
                  onChange={(e) => setFormData({...formData, isLive: e?.target?.checked})}
                />
                <label htmlFor="isLive" className="text-gray-300 text-sm">Make offer live immediately</label>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg transition-all duration-200"
                >
                  {editingOffer ? 'Update' : 'Create'} Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersPage;