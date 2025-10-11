'use client';
const cloudPresetName = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;
import { CldUploadButton } from 'next-cloudinary';
import
  {
    Search,
    Plus,
    Edit2,
    Trash2,
    X,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Loader2,
    FileImage,
    Clock,
    DollarSign,
    Leaf,
    Egg
  } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCookies } from 'next-client-cookies';

const initialSubcategoryData = { name: '' };
const initialItemData = {
  name: '',
  image: '',
  description: '',
  type: 'Veg',
  price: {
    standard: '',
    happyHour: '',
    isHappyHourActive: false
  }
};

export default function SubmenuManagement()
{
  const { categoryId } = useParams();
  const cookie = useCookies();
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('subcategory');
  const [modalMode, setModalMode] = useState('add');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [expandedSubcategories, setExpandedSubcategories] = useState(new Set());

  const apiBase = `${process.env.NEXT_PUBLIC_ROUTES_API_URL}/menu`;

  const fetchSubcategories = async () =>
  {
    setLoading(true);
    setError(null);
    try
    {
      const res = await fetch(`${apiBase}/category/${categoryId}/subcategories`, {
        headers: {
          'Content-Type': 'application/json',
          'auth-token': cookie.get('auth')
        }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load subcategories');
      setSubcategories(json?.data || []);
      setFilteredSubcategories(json?.data || []);
    } catch (err)
    {
      setError(err?.message);
    } finally
    {
      setLoading(false);
    }
  };

  useEffect(() =>
  {
    fetchSubcategories();
  }, [categoryId]);

  const handleSearch = (term) =>
  {
    setSearchTerm(term);
    if (!term.trim()) return setFilteredSubcategories(subcategories);
    const filtered = subcategories
      .map(sub => ({
        ...sub,
        items: (sub?.items || []).filter(item =>
          item?.name?.toLowerCase().includes(term.toLowerCase()) ||
          item?.description?.toLowerCase().includes(term.toLowerCase())
        )
      }))
      .filter(sub =>
        sub?.name?.toLowerCase().includes(term.toLowerCase()) ||
        (sub?.items?.length || 0) > 0
      );
    setFilteredSubcategories(filtered);
  };

  const openModal = (type, mode, sub = null, item = null) =>
  {
    setModalType(type);
    setModalMode(mode);
    setSelectedSubcategory(sub);
    setSelectedItem(item);
    setFormData(
      type === 'subcategory'
        ? mode === 'edit'
          ? { name: sub?.name }
          : initialSubcategoryData
        : mode === 'edit'
          ? { ...item }
          : initialItemData
    );
    setShowModal(true);
  };

  const closeModal = () =>
  {
    setShowModal(false);
    setFormData({});
    setSelectedSubcategory(null);
    setSelectedItem(null);
  };

  const handleFormSubmit = async () =>
  {
    if (!formData?.name?.trim()) return;
    setFormLoading(true);
    setError(null);
    try
    {
      let res, json;

      if (modalType === 'subcategory')
      {
        const endpoint = modalMode === 'add'
          ? `${apiBase}/subcategory/create/${categoryId}`
          : `${apiBase}/updatesubcategory/${categoryId}/${selectedSubcategory?._id}`;
        const method = modalMode === 'add' ? 'POST' : 'PUT';

        res = await fetch(endpoint, {
          method,
          headers: { 
            'Content-Type': 'application/json',
            'auth-token': cookie.get('auth')
          },
          body: JSON.stringify({ name: formData?.name })
        });
        json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to save subcategory');

      } else
      {
        const payload = {
          ...formData,
          price: {
            standard: Number(formData.price.standard),
            happyHour: Number(formData.price.happyHour) || 0,
            isHappyHourActive: formData.price.isHappyHourActive
          }
        };

        const endpoint = modalMode === 'add'
          ? `${apiBase}/item/create/${categoryId}/${selectedSubcategory._id}`
          : `${apiBase}/updateitem/${categoryId}/${selectedSubcategory._id}/${selectedItem._id}`;
        res = await fetch(endpoint, {
          method: modalMode === 'add' ? 'POST' : 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'auth-token': cookie.get('auth')
          },
          body: JSON.stringify(payload)
        });
        json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to save item');
      }

      await fetchSubcategories();
      closeModal();
    } catch (err)
    {
      setError(err?.message);
    } finally
    {
      setFormLoading(false);
    }
  };

  const handleDelete = async (type, subId, itemId = null) =>
  {
    const key = `${type}-${subId}-${itemId || 'sub'}`;
    if (!window.confirm(`Delete this ${type}?`)) return;
    setDeleteLoading(key);
    setError(null);

    try
    {
      const endpoint = type === 'subcategory'
        ? `${apiBase}/subcategory/${categoryId}/${subId}`
        : `${apiBase}/item/${categoryId}/${subId}/${itemId}`;
      const res = await fetch(endpoint, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': cookie.get('auth')
        }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');

      await fetchSubcategories();
    } catch (err)
    {
      setError(err?.message);
    } finally
    {
      setDeleteLoading(null);
    }
  };

  const toggleExpanded = (id) =>
  {
    const next = new Set(expandedSubcategories);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedSubcategories(next);
  };

  const getTypeColor = t =>
    t === 'Veg' ? 'text-green-500' : t === 'Non-Veg' ? 'text-red-500' : 'text-orange-500';
  const getTypeIcon = t =>
    t === 'Egg' ? <Egg className="w-4 h-4 text-orange-500" /> :
      <Leaf className={`w-4 h-4 ${getTypeColor(t)}`} />;

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <Loader2 className="animate-spin" size={32} />
      <span className="ml-2">Loading...</span>
    </div>
  );

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Submenu Management</h1>
        <button
          onClick={() => openModal('subcategory', 'add')}
          className="bg-orange-500 px-3 py-2 rounded text-white hover:bg-orange-600"
        >
          <Plus className="inline-block mr-1" size={16} /> Add Subcategory
        </button>
      </div>

      <input
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search subcategories or items..."
        className="bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-4 w-full"
      />

      {error && (
        <div className="bg-red-500/20 text-red-300 p-2 rounded flex justify-between items-center mb-4">
          <span><AlertCircle size={16} className="inline mr-1" />{error}</span>
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      {filteredSubcategories.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileImage size={48} className="mx-auto mb-2" />
          No subcategories found
        </div>
      ) : filteredSubcategories.map(sub => (
        <div key={sub._id} className="mb-4 bg-gray-800 rounded p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button onClick={() => toggleExpanded(sub._id)} className="text-white">
                {expandedSubcategories.has(sub._id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <h2 className="text-lg font-semibold">{sub.name}</h2>
              <span className="text-gray-400 text-sm">({sub.items.length} items)</span>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => openModal('item', 'add', sub)} className="text-blue-400 hover:text-blue-300">Add Item</button>
              <button onClick={() => openModal('subcategory', 'edit', sub)} className="text-orange-400 hover:text-orange-300"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete('subcategory', sub._id)} disabled={deleteLoading === `subcategory-${sub._id}-sub`} className="text-red-400 hover:text-red-300">
                {deleteLoading === `subcategory-${sub._id}-sub` ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            </div>
          </div>

          {expandedSubcategories.has(sub._id) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {sub.items.map(item => (
                <div key={item._id} className="bg-gray-700 rounded p-3 border border-gray-600">
                  <img src={item.image} alt={item.name} className="h-32 w-full object-cover rounded mb-2" />
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">{item.description}</p>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-green-400">₹{item.price.standard}</span>
                    {item.price.isHappyHourActive && (
                      <span className="text-orange-400 flex items-center">
                        <Clock size={14} className="mr-1" />
                        ₹{item.price.happyHour}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-0.5 rounded text-xs border ${getTypeColor(item.type)}`}>{item.type}</span>
                    <div className="flex space-x-2">
                      <button onClick={() => openModal('item', 'edit', sub, item)} className="text-orange-400 hover:text-orange-300"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete('item', sub._id, item._id)} disabled={deleteLoading === `item-${sub._id}-${item._id}`} className="text-red-400 hover:text-red-300">
                        {deleteLoading === `item-${sub._id}-${item._id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 w-full max-w-md rounded p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">{modalMode === 'add' ? 'Add' : 'Edit'} {modalType === 'subcategory' ? 'Subcategory' : 'Item'}</h2>
              <button onClick={closeModal}><X size={20} /></button>
            </div>

            {modalType === 'subcategory' ? (
              <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Subcategory name" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded" />
            ) : (
              <>
                <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Item name" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded" />
                <div className="space-y-2">
                  <CldUploadButton
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME}
                    options={{ maxFiles: 1 }}
                    onSuccess={(result) =>
                    {
                      const info = result?.info;
                      if (info?.secure_url)
                      {
                        setFormData(prev => ({
                          ...prev,
                          image: info.secure_url
                        }));
                      }
                    }}
                    className="w-full"
                  >
                    <div className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-center cursor-pointer">
                      Upload Image
                    </div>
                  </CldUploadButton>

                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-24 w-full object-cover mt-2 rounded"
                    />
                  )}
                </div>
                <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded" />
                <select value={formData.type || 'Veg'} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded">
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Egg">Egg</option>
                   <option value="None">None</option>
                </select>
                <input value={formData.price?.standard || ''} onChange={e => setFormData({ ...formData, price: { ...formData.price, standard: e.target.value } })} placeholder="Standard Price" type="number" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded" />
                <div className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.price?.isHappyHourActive || false} onChange={e => setFormData({ ...formData, price: { ...formData.price, isHappyHourActive: e.target.checked } })} />
                  <label>Enable Happy Hour Price</label>
                </div>
                {formData.price?.isHappyHourActive && (
                  <input value={formData.price?.happyHour || ''} onChange={e => setFormData({ ...formData, price: { ...formData.price, happyHour: e.target.value } })} placeholder="Happy Hour Price" type="number" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded" />
                )}
              </>
            )}

            <div className="flex justify-end">
              <button onClick={handleFormSubmit} disabled={formLoading} className="bg-orange-500 px-4 py-2 rounded hover:bg-orange-600">
                {formLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
