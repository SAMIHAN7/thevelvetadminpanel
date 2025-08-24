'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  FileImage
} from 'lucide-react';
import { CldUploadButton } from 'next-cloudinary';
import { useCookies } from 'next-client-cookies';

const cloudPresetName = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;
const BASEURL = `${process.env.NEXT_PUBLIC_ROUTES_API_URL}/menu`
export default function MenuManagement() {
  const router = useRouter();
  const cookie = useCookies();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', image: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
const handleCategoryClick = (catId) => {
  router.push(`/dashboard/menu/${catId}`); // replace with your desired route
};
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASEURL}/categories`, {
        headers: {
          'Content-Type': 'application/json',
          'auth-token': cookie.get('auth')
        }
      });
      const data = await res.json();
      setCategories(data?.data || []);
      setFilteredCategories(data?.data || []);
    } catch (err) {
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category?.category?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  };

  const openModal = (mode, category = null) => {
    setModalMode(mode);
    setSelectedCategory(category);
    setFormData(category ? { name: category?.category, image: category?.image } : { name: '', image: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setFormData({ name: '', image: '' });
  };

  const handleFormSubmit = async () => {
    if (!formData.name.trim()) return;

    try {
      setFormLoading(true);
      const endpoint = modalMode === 'add' ? `${BASEURL}/create` : `${BASEURL}/updatecategory/${selectedCategory?._id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'auth-token': cookie.get('auth')
        },
        body: JSON.stringify({ category: formData.name, image: formData.image })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      await fetchCategories();
      closeModal();
    } catch (err) {
      setError(err?.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      setDeleteLoading(categoryId);
      const res = await fetch(`${BASEURL}/category/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': cookie.get('auth')
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      await fetchCategories();
    } catch (err) {
      setError(err?.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleImageUpload = async (result) => {
    setFormData(prev => ({ ...prev, image: result?.info?.secure_url || '' }));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading menu categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-orange-400">Menu Management</h1>
          <p className="text-gray-400">Manage your restaurant menu categories</p>
        </div>
        <button
          onClick={() => openModal('add')}
          className="px-4 py-2 bg-orange-500 rounded hover:bg-orange-600 text-white flex items-center gap-2"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      <div className="p-4 bg-gray-800">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>
      </div>

      {error && (
        <div className="mx-6 mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
          <AlertCircle className="text-red-400" size={20} />
          <span className="text-red-400">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">No categories found.</div>
        ) : filteredCategories.map((cat) => (
          <div  onClick={() => handleCategoryClick(cat?._id)} key={cat?._id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <img src={cat?.image} alt={cat?.category} className="w-full h-40 object-cover" />
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{cat?.category}</h3>
              <div className="flex gap-2">
                <button onClick={() => openModal('edit', cat)} className="text-orange-400 hover:text-orange-600">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(cat?._id)} disabled={deleteLoading === cat?._id} className="text-red-400 hover:text-red-600">
                  {deleteLoading === cat?._id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">{modalMode === 'add' ? 'Add Category' : 'Edit Category'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="Category Name"
              />

              <CldUploadButton
                uploadPreset={cloudPresetName}
                onSuccess={handleImageUpload}
                className="bg-orange-500 px-4 py-2 text-white rounded cursor-pointer hover:bg-orange-600"
              >
                Upload Image
              </CldUploadButton>

              {formData.image && (
                <img src={formData.image} alt="Preview" className="w-full h-32 object-cover rounded border border-gray-600" />
              )}

              <div className="flex gap-4 pt-2">
                <button onClick={closeModal} className="flex-1 py-2 bg-gray-600 text-white rounded hover:bg-gray-500">Cancel</button>
                <button
                  onClick={handleFormSubmit}
                  disabled={formLoading || !formData.name.trim()}
                  className="flex-1 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : modalMode === 'add' ? 'Add Category' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
