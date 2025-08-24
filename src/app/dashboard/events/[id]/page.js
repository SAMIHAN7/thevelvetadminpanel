'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Calendar, Edit3, Save, XCircle, Users, Trash2, Plus, Clipboard, Check
} from 'lucide-react';
import { CldUploadButton } from 'next-cloudinary';
import { useCookies } from 'next-client-cookies';

const cloudPresetName = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;

const EventDetailPage = () => {
  const { id } = useParams();
  const cookie = useCookies();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const newImageRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  // IST Conversion Utility
  const toISTInput = (utcDate) => {
    if (!utcDate) return '';
    const date = new Date(utcDate);
    const offsetIST = 5.5 * 60; // minutes
    const localDate = new Date(date.getTime() + offsetIST * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  const toUTC = (localInput) => {
    return new Date(localInput).toISOString();
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_ROUTES_API_URL}/events/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'auth-token': cookie.get('auth')
          }
        });
        const data = await res.json();
        console.log('Fetched event:', data);
        if (data?.success) {
          setEvent(data?.event);
          setForm(data?.event);
        } else {
          console.error(data?.message || 'Failed to fetch event');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e?.target || {};
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e?.target || {};
    setForm(prev => ({ ...prev, [name]: toUTC(value) }));
  };

  const handleAddImage = () => {
    const url = newImageRef?.current?.value;
    if (url) {
      setForm(prev => ({ ...prev, images: [...(prev?.images || []), url] }));
      if (newImageRef?.current) {
        newImageRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = (idx) => {
    const updatedImages = [...(form?.images || [])];
    updatedImages.splice(idx, 1);
    setForm(prev => ({ ...prev, images: updatedImages }));
  };

  const handleCopyAttendees = () => {
    const list = (form?.attendees || []).map(a => `${a?.name} <${a?.email}>`).join('\n');
    navigator?.clipboard?.writeText(list);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_ROUTES_API_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': cookie.get('auth')
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (data?.success) {
        setEvent(data?.updatedEvent);
        setEditMode(false);
      } else {
        alert(data?.message || 'Failed to update event');
      }
    } catch (err) {
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloudUpload = (result) => {
    const url = result?.info?.secure_url;
    if (url) {
      setForm(prev => ({
        ...prev,
        images: [...(prev?.images || []), url]
      }));
    }
  };

  if (!form || !event) return <div className="text-white p-6">Loading event...</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">{editMode ? 'Edit Event' : 'Event Details'}</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-1">
                <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditMode(false)} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg flex items-center gap-1">
              <Edit3 className="w-4 h-4" /> Edit
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-5">
        {/* Event Name */}
        <div>
          <label className="text-sm text-gray-400">Event Name</label>
          {editMode ? (
            <input name="name" value={form?.name || ''} onChange={handleChange}
              className="mt-1 w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white" />
          ) : <p className="text-xl font-semibold">{event?.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="text-sm text-gray-400">Description</label>
          {editMode ? (
            <textarea name="description" value={form?.description || ''} onChange={handleChange}
              className="mt-1 w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white" rows={3} />
          ) : <p className="text-gray-300">{event?.description}</p>}
        </div>

        {/* Capacity / Password */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Capacity</label>
            {editMode ? (
              <input type="number" name="capacity" value={form?.capacity || ''} onChange={handleChange}
                className="mt-1 w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white" />
            ) : <p>{event?.capacity}</p>}
          </div>
          {/* <div>
            <label className="text-sm text-gray-400">Password</label>
            {editMode ? (
              <input type="text" name="password" value={form.password} onChange={handleChange}
                className="mt-1 w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white" />
            ) : <p>{event.password || 'N/A'}</p>}
          </div> */}
          
        </div>

        {/* Time Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          {['startTime', 'endTime', 'registrationStart', 'registrationEnd'].map(field => (
            <div key={field}>
              <label className="text-sm text-gray-400 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              {editMode ? (
                <input
                  type="datetime-local"
                  name={field}
                  value={toISTInput(form?.[field])}
                  onChange={handleDateChange}
                  className="mt-1 w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-yellow-400" />
                  <p>{new Date(event?.[field]).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Images */}
        <div>
          <label className="text-sm text-gray-400">Images</label>
          <div className="flex gap-4 mt-2 flex-wrap">
            {(form?.images || []).map((img, idx) => (
              <div key={idx} className="relative group">
                <img src={img} alt="event" className="w-24 h-24 object-cover rounded-md border border-gray-600" />
                {editMode && (
                  <button onClick={() => handleDeleteImage(idx)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {editMode && (
              <div className="flex flex-col gap-1">
                <input ref={newImageRef} placeholder="Image URL"
                  className="p-2 bg-gray-700 border border-gray-600 text-sm text-white rounded-md" />
                <button onClick={handleAddImage}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-sm text-white rounded-md flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
                <CldUploadButton
                  onSuccess={handleCloudUpload}
                  uploadPreset={cloudPresetName}
                  options={{ multiple: false }}
                  style={{
                    backgroundColor: '#EA7A17',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    marginTop: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Upload via Cloudinary
                </CldUploadButton>
              </div>
            )}
          </div>
        </div>

        {/* Attendees */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-400">Attendees ({event?.attendees?.length || 0})</label>
            <button onClick={handleCopyAttendees}
              className="text-sm px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white flex items-center gap-1">
              {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy List'}
            </button>
          </div>
          <ul className="space-y-1">
            {(form?.attendees || []).map((att, idx) => (
              <li key={idx} className="bg-gray-700 p-2 rounded-md text-sm text-white flex justify-between items-center">
                <span>{att?.name}</span>
                <span className="text-gray-400 text-xs">{att?.email}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
