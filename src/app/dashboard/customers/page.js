'use client';
import React, { useEffect, useState } from 'react';
import {
  Search, Users, Phone, Mail, Calendar, UserPlus,
  Edit3, Trash2, Eye, X
} from 'lucide-react';
import { useCookies } from 'next-client-cookies';

const apiBase = `${process.env.NEXT_PUBLIC_ROUTES_API_URL}/customers`;

export default function CustomersPage() {
  const cookie = useCookies();
  // State
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null); // { mode, customer, attendedEvents }
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState('');
  
  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(`${apiBase}/customers`, {
          headers: {
            'Content-Type': 'application/json',
            'auth-token': cookie.get('auth')
          }
        });
        const json = await res.json();
        if (res.ok) {
          setCustomers(json?.data || []);
          setFilteredCustomers(json?.data || []);
        } else {
          console.error(json?.error);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);
  
  // Filter & sort logic
  useEffect(() => {
    let arr = customers.filter(c =>
      c?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c?.phone?.includes(searchTerm) ||
      c?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    arr.sort((a, b) => {
      let aV = a[sortBy], bV = b[sortBy];
      if (['createdAt', 'updatedAt'].includes(sortBy)) {
        aV = new Date(aV); bV = new Date(bV);
      }
      return sortOrder === 'asc' ? (aV > bV ? 1 : -1) : (aV < bV ? 1 : -1);
    });
    setFilteredCustomers(arr);
  }, [searchTerm, customers, sortBy, sortOrder]);
  
  function formatDate(dt) {
    return new Date(dt).toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
  
  function statusColor(createdAt) {
    const diff = (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
    return diff <= 7 ? 'bg-green-500' : (diff <= 30 ? 'bg-yellow-500' : 'bg-orange-500');
  }
  
  // CRUD actions
  async function deleteCustomer(id) {
    if (!confirm('Delete this customer?')) return;
    try {
      const r = await fetch(`${apiBase}/customer/${id}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': cookie.get('auth')
        }
      });
      const j = await r.json();
      if (r.ok) {
        setCustomers(cs => cs.filter(c => c._id !== id));
      } else console.error(j.error);
    } catch (e) { console.error(e) }
  }
  
  async function openModal(mode, customer = {}) {
    if (mode === 'view') {
      try {
        const r = await fetch(`${apiBase}/customer/${customer._id}`, {
          headers: {
            'Content-Type': 'application/json',
            'auth-token': cookie.get('auth')
          }
        });
        const j = await r.json();
        if (r.ok) {
          setModalData({ mode: 'view', customer: j.data.customer, attendedEvents: j.data.attendedEvents });
        }
      } catch (e) { console.error(e) }
    } else {
      setForm({ name: customer.name || '', phone: customer.phone || '', email: customer.email || '' });
      setModalData({ mode, customer });
    }
  }
  
  async function submitForm() {
    const { mode, customer } = modalData;
    const url = mode === 'add'
      ? `${apiBase}/register/PLACEHOLDER_EVENT_ID` // replace if needed
      : `${apiBase}/customer/${customer?._id}`;
    const method = mode === 'add' ? 'POST' : 'PUT';
    try {
      const r = await fetch(url, {
        method, headers:{ 
          'Content-Type':'application/json',
          'auth-token': cookie.get('auth')
        },
        body: JSON.stringify(form)
      });
      const j = await r.json();
      if (r.ok) {
        if (mode === 'add') {
          setCustomers(cs => [{ ...form, _id: j?.customerId, createdAt: new Date(), updatedAt: new Date() }, ...cs]);
        } else {
          setCustomers(cs => cs.map(c => c?._id === customer?._id ? j?.data : c));
        }
        setModalData(null);
      } else {
        setErrors(j?.error);
      }
    } catch (e) {
      console.error(e);
      setErrors('Submission failed');
    }
  }
  
  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      <p>Loading customers...</p>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-900 p-4 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
            <Users className="h-8 w-8 text-white"/>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="text-gray-400">Manage your customers</p>
          </div>
        </div>
        {/* <button
          onClick={() => openModal('add')}
          className="bg-green-500 px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-green-600"
        >
          <UserPlus className="h-5 w-5 text-white"/>
          <span>Add Customer</span>
        </button> */}
      </div>
      
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-3 bg-gray-800 rounded-lg"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            {['name','email','createdAt','updatedAt'].map(val => (
              <option key={val} value={val}>{'Sort by ' + val}</option>
            ))}
          </select>
          <button
            className="px-4 py-3 bg-gray-800 rounded-lg"
            onClick={() => setSortOrder(o => o==='asc'? 'desc':'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
      
      {/* Customers Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              {['Customer','Contact','Status','Created','Updated','Actions'].map(h => (
                <th key={h} className="p-4 text-left text-gray-300">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c, i) => (
              <tr key={c._id}
                  className={`border-b ${i%2? 'bg-gray-750':'bg-gray-800'} hover:bg-gray-700`}>
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {c.name.split(' ').map(n=>n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{c.name}</p>
                    <p className="text-gray-400 text-sm">ID: {c._id}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2"><Phone className="text-green-400"/> {c.phone}</div>
                  <div className="flex items-center gap-2"><Mail className="text-blue-400"/> {c.email}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${statusColor(c.createdAt)}`}></div>
                    <span className="text-gray-300 text-sm">
                      { (Date.now() - new Date(c.createdAt))/(1000*60*60*24) <= 7 ? 'New':'Active' }
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <Calendar className="text-yellow-400 inline"/> {formatDate(c.createdAt)}
                </td>
                <td className="p-4">
                  <Calendar className="text-orange-400 inline"/> {formatDate(c.updatedAt)}
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => openModal('view', c)} className="p-2 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white"><Eye/></button>
                  <button onClick={() => openModal('edit', c)} className="p-2 text-yellow-400 rounded-lg hover:bg-yellow-500 hover:text-white"><Edit3/></button>
                  <button onClick={() => deleteCustomer(c._id)} className="p-2 text-red-400 rounded-lg hover:bg-red-500 hover:text-white"><Trash2/></button>
                </td>
              </tr>
            ))}
            {filteredCustomers.length===0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 rounded p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modalData.mode === 'view' ? 'View Customer' : (modalData.mode === 'add' ? 'Add Customer' : 'Edit Customer')}
              </h2>
              <button onClick={() => setModalData(null)}><X/></button>
            </div>

            {modalData.mode === 'view' ? (
              <div className="space-y-4">
                <p><strong>Name:</strong> {modalData.customer.name}</p>
                <p><strong>Phone:</strong> {modalData.customer.phone}</p>
                <p><strong>Email:</strong> {modalData.customer.email}</p>
                <p><strong>Registered Events:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  {modalData.attendedEvents.map(ev => (
                    <li key={ev._id}>{ev.name} ({formatDate(ev.startTime)} – {formatDate(ev.endTime)})</li>
                  ))}
                </ul>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); submitForm(); }}>
                <input
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Name" className="w-full px-3 py-2 bg-gray-700 rounded"
                  required
                />
                <input
                  value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="Phone" className="w-full px-3 py-2 bg-gray-700 rounded"
                  pattern="\d{10}" required
                />
                <input
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="Email" className="w-full px-3 py-2 bg-gray-700 rounded"
                  type="email" required
                />
                {errors && <p className="text-red-300">{errors}</p>}
                <div className="text-right">
                  <button type="submit" className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">
                    {modalData.mode === 'add' ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
