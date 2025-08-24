'use client';
import React, { useState } from 'react';
import { ArrowLeft, Upload, X, Calendar, Users, Lock, Image, Save, AlertCircle } from 'lucide-react';
import { CldUploadButton } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import { useCookies } from 'next-client-cookies';

const CreateEventPage = () => {
  const router = useRouter();
  const cookie = useCookies();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: [],
    capacity: '',
    password: '',
    startTime: '',
    endTime: '',
    registrationStart: '',
    registrationEnd: ''
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cloudPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;

  const handleInputChange = (e) => {
    const { name, value } = e?.target || {};
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors?.[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const removeImage = (id) => {
    const img = previewImages.find(i => i.id === id);
    if (!img) return;
    setPreviewImages(prev => prev.filter(i => i.id !== id));
    setFormData(prev => ({ ...prev, images: prev.images.filter(url => url !== img.url) }));
  };

  const validate = () => {
    const errs = {};
    ['name', 'description', 'capacity', 'startTime', 'endTime', 'registrationStart', 'registrationEnd']
      .forEach(field => {
        if (!formData?.[field]?.trim()) errs[field] = 'Required';
      });

    if (formData?.startTime && formData?.endTime && new Date(formData.startTime) >= new Date(formData.endTime)) {
      errs.endTime = 'End must be after start';
    }
    if (formData?.registrationStart && formData?.registrationEnd && new Date(formData.registrationStart) >= new Date(formData.registrationEnd)) {
      errs.registrationEnd = 'Registration end must be after start';
    }
    if (formData?.registrationEnd && formData?.startTime && new Date(formData.registrationEnd) > new Date(formData.startTime)) {
      errs.registrationEnd = 'Registration must end before event starts';
    }

    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_ROUTES_API_URL}/events/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'auth-token': cookie.get('auth')
        },
        body: JSON.stringify({
          ...formData,
          capacity: Number(formData.capacity)
        })
      });
      const json = await resp.json();

      if (!resp.ok) throw new Error(json?.error || 'Failed to create event');

      alert('Event created successfully!');
      router.push('/events');
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => router.back();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-6 flex items-center gap-4">
        <button onClick={handleGoBack}>
          <ArrowLeft className="text-gray-400 w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
          Create New Event
        </h1>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Basics */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl mb-4 flex items-center gap-2"><Calendar /> Basic Info</h2>
          <input
            name="name"
            value={formData?.name || ''}
            onChange={handleInputChange}
            placeholder="Event Name"
            className={`w-full p-3 mb-3 rounded border ${errors.name ? 'border-red-500' : 'border-gray-600'} bg-gray-700`}
          />
          {errors?.name && <p className="text-red-400">{errors.name}</p>}

          <textarea
            name="description"
            value={formData?.description || ''}
            onChange={handleInputChange}
            placeholder="Description"
            rows={3}
            className={`w-full p-3 mb-3 rounded border ${errors.description ? 'border-red-500' : 'border-gray-600'} bg-gray-700`}
          />
          {errors?.description && <p className="text-red-400">{errors.description}</p>}

          <div className="flex gap-4">
            <input
              type="number"
              name="capacity"
              value={formData?.capacity || ''}
              onChange={handleInputChange}
              placeholder="Capacity"
              className={`flex-1 p-3 rounded border ${errors.capacity ? 'border-red-500' : 'border-gray-600'} bg-gray-700`}
            />
            <input
              type="text"
              name="password"
              value={formData?.password || ''}
              onChange={handleInputChange}
              placeholder="Password (optional)"
              className="flex-1 p-3 rounded border border-gray-600 bg-gray-700"
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl mb-4 flex items-center gap-2"><Image /> Event Images</h2>
          <CldUploadButton
            uploadPreset={cloudPreset}
            options={{ multiple: true }}
            onSuccess={(res) => {
              const url = res?.info?.secure_url;
              const name = res?.info?.original_filename;
              const newId = `${Date.now()}-${Math.random()}`;
              setPreviewImages(prev => [...(prev || []), { id: newId, url, name }]);
              setFormData(prev => ({ ...prev, images: [...(prev?.images || []), url] }));
            }}
            className="bg-orange-500 px-4 py-2 rounded text-white"
          >
            Upload Event Images
          </CldUploadButton>

          {previewImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {previewImages?.map(img => (
                <div key={img?.id} className="relative group">
                  <img src={img?.url} alt={img?.name} className="w-full h-32 object-cover rounded border border-gray-600" />
                  <button
                    type="button"
                    onClick={() => removeImage(img?.id)}
                    className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl mb-4 flex items-center gap-2"><Users /> Schedule & Registration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label>Event Start / End *</label>
              <input type="datetime-local" name="startTime" value={formData?.startTime || ''} onChange={handleInputChange}
                className={`w-full p-3 rounded border ${errors?.startTime ? 'border-red-500' : 'border-gray-600'} bg-gray-700 mb-2`} />
              <input type="datetime-local" name="endTime" value={formData?.endTime || ''} onChange={handleInputChange}
                className={`w-full p-3 rounded border ${errors?.endTime ? 'border-red-500' : 'border-gray-600'} bg-gray-700`} />
              {errors?.startTime && <p className="text-red-400">{errors.startTime}</p>}
              {errors?.endTime && <p className="text-red-400">{errors.endTime}</p>}
            </div>
            <div>
              <label>Registration Start / End *</label>
              <input type="datetime-local" name="registrationStart" value={formData?.registrationStart || ''} onChange={handleInputChange}
                className={`w-full p-3 rounded border ${errors?.registrationStart ? 'border-red-500' : 'border-gray-600'} bg-gray-700 mb-2`} />
              <input type="datetime-local" name="registrationEnd" value={formData?.registrationEnd || ''} onChange={handleInputChange}
                className={`w-full p-3 rounded border ${errors?.registrationEnd ? 'border-red-500' : 'border-gray-600'} bg-gray-700`} />
              {errors?.registrationStart && <p className="text-red-400">{errors.registrationStart}</p>}
              {errors?.registrationEnd && <p className="text-red-400">{errors.registrationEnd}</p>}
            </div>
          </div>

          <div className="p-4 mt-4 bg-blue-900/20 border border-blue-700/50 rounded">
            <AlertCircle className="w-5 h-5 text-blue-400 inline-block mr-2" />
            <span className="text-blue-300">Ensure registration ends before the event starts.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button onClick={handleGoBack} className="p-3 rounded bg-gray-700">Cancel</button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            className={`p-3 rounded text-white ${isSubmitting ? 'bg-gray-600' : 'bg-orange-600 hover:bg-orange-700'}`}>
            {isSubmitting ? 'Creating...' : <>
              <Save className="inline-block mr-1" /> Create Event
            </>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
