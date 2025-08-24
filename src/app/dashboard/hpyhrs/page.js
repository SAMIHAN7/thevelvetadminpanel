'use client';

import { useEffect, useState, useRef } from 'react';
import { Edit3, Save, XCircle, Trash2, Plus, Image } from 'lucide-react';
import { CldUploadButton } from 'next-cloudinary';
import { useCookies } from 'next-client-cookies';

const cloudPresetName = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;
const BASE_URL = `${process.env.NEXT_PUBLIC_ROUTES_API_URL}/hpyhrs`;

const HappyHoursPage = () => {
  const cookie = useCookies();
  const [happyHour, setHappyHour] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [deleted, setDeleted] = useState(false);
  const imageInput = useRef(null);

  // Fetch happy hour
  const fetchHappyHour = async () => {
    try {
      const res = await fetch(BASE_URL, {
        headers: {
          'Content-Type': 'application/json',
          'auth-token': cookie.get('auth')
        }
      });
      const data = await res.json();
      if (data?.data) {
        setHappyHour(data.data);
        setForm(data.data);
      } else {
        setDeleted(true);
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
    }
  };

  useEffect(() => {
    fetchHappyHour();
  }, []);

  const handleTimeChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.startTime || !form.endTime || !form.image) return;

    try {
      const method = happyHour ? 'PUT' : 'POST';
      const url = happyHour ? `${BASE_URL}/${happyHour._id}` : BASE_URL;

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'auth-token': cookie.get('auth')
        },
        body: JSON.stringify(form),
      });
 console.log('Response:', res);
      if (!res.ok) throw new Error('Failed to save');

      const result = await res.json();
      setHappyHour(result.data);
      setForm(result.data);
      setEditMode(false);
      setDeleted(false);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = () => {
    setHappyHour(null);
    setForm({});
    setEditMode(false);
    setDeleted(true);
  };

  const handleImageUpload = (result) => {
    setForm({ ...form, image: result?.info?.secure_url || '' });
  };

  if (!deleted && !happyHour) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-300 text-lg">Loading Happy Hours...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
            <Image className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Happy Hours</h1>
            <p className="text-gray-400 mt-1">Manage your club's Happy Hour timings</p>
          </div>
        </div>

        {!deleted && (
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-1"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" /> Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg flex items-center gap-1"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              
              </>
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        {deleted ? (
          <div className="text-center py-12">
            <Image className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Happy Hours Set</h3>
            <p className="text-gray-500 mb-4">Click below to create new Happy Hours</p>
            <button
              onClick={() => {
                setForm({
                  startTime: '17:00',
                  endTime: '20:00',
                  image: ''
                });
                setEditMode(true);
                setDeleted(false);
              }}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black px-6 py-3 rounded-lg transition-all duration-200"
            >
              <Plus className="inline w-4 h-4 mr-1" />
              Create Happy Hour
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-400">Start Time</label>
              {editMode ? (
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime || ''}
                  onChange={handleTimeChange}
                  className="mt-1 w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white"
                />
              ) : (
                <p className="text-white mt-2">{happyHour.startTime}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-400">End Time</label>
              {editMode ? (
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime || ''}
                  onChange={handleTimeChange}
                  className="mt-1 w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white"
                />
              ) : (
                <p className="text-white mt-2">{happyHour.endTime}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-400">Banner Image</label>
              {editMode ? (
                <>
                  <CldUploadButton
                    options={{ multiple: false }}
                    onSuccess={handleImageUpload}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm"
                    uploadPreset={cloudPresetName}
                  >
                    Upload Image
                  </CldUploadButton>
                  {form.image && (
                    <img
                      src={form.image}
                      alt="preview"
                      className="mt-4 h-48 w-full object-cover rounded-md border border-gray-600"
                    />
                  )}
                </>
              ) : (
                <img
                  src={happyHour.image}
                  alt="Happy Hour"
                  className="mt-2 h-48 w-full object-cover rounded-md border border-gray-600"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HappyHoursPage;
