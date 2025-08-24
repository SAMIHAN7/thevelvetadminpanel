'use client';
import React, { useState, useEffect } from 'react';
import { Upload, X, Filter, Search, Grid, List, Edit, Trash2, Eye, Plus, ImageIcon } from 'lucide-react';
import { CldUploadButton } from 'next-cloudinary';
import { useCookies } from 'next-client-cookies';
const cloudPresetName = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;
const BASE_URL = `${process.env.NEXT_PUBLIC_ROUTES_API_URL}/gallery`;

const GalleryAdminPanel = () =>
{
    const cookie = useCookies();
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [selectedTag, setSelectedTag] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newImage, setNewImage] = useState({ imageUrl: '', tag: 'food' });
    const [selectedImages, setSelectedImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const tagColors = {
        food: 'from-red-500 to-orange-500',
        ambience: 'from-green-500 to-yellow-500',
        all: 'from-purple-500 to-pink-500'
    };

    const tagBorders = {
        food: 'border-red-500 shadow-red-500/20',
        ambience: 'border-green-500 shadow-green-500/20',
        all: 'border-purple-500 shadow-purple-500/20'
    };

    useEffect(() =>
    {
        fetchImages();
    }, []);

    useEffect(() =>
    {
        filterImages();
    }, [selectedTag, searchQuery, images]);

    const fetchImages = async () =>
    {
        try
        {
            const res = await fetch(`${BASE_URL}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': cookie.get('auth')
                }
            });
            const data = await res.json();
            setImages(data?.data || []);
        } catch (err)
        {
            console.error('Failed to fetch gallery:', err);
        }
    };

    const filterImages = () =>
    {
        let filtered = images;
        if (selectedTag !== 'all')
        {
            filtered = filtered.filter(img => img?.tag === selectedTag);
        }
        if (searchQuery)
        {
            filtered = filtered.filter(img =>
                img?.tag?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setFilteredImages(filtered);
    };

    const handleAddImage = async () =>
    {
        if (!newImage.imageUrl) return;
        try
        {
            const res = await fetch(`${BASE_URL}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'auth-token': cookie.get('auth')
                },
                body: JSON.stringify(newImage)
            });
            if (res.ok)
            {
                fetchImages();
                setNewImage({ imageUrl: '', tag: 'food' });
                setShowUploadModal(false);
            }
        } catch (err)
        {
            console.error('Failed to add image:', err);
        }
    };

    const handleDeleteImage = async (id) =>
    {
        try
        {
            const res = await fetch(`${BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': cookie.get('auth')
                }
            });
            if (res.ok)
            {
                fetchImages();
                setSelectedImages(selectedImages.filter(selectedId => selectedId !== id));
            }
        } catch (err)
        {
            console.error('Failed to delete image:', err);
        }
    };

    const handleBulkDelete = async () =>
    {
        await Promise.all(
            selectedImages.map(id => fetch(`${BASE_URL}/${id}`, { 
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': cookie.get('auth')
                }
            }))
        );
        fetchImages();
        setSelectedImages([]);
    };

    const toggleImageSelection = (id) =>
    {
        setSelectedImages(prev =>
            prev.includes(id)
                ? prev.filter(selectedId => selectedId !== id)
                : [...prev, id]
        );
    };

    const handleUploadComplete = (result) =>
    {
        if (result?.info?.secure_url)
        {
            setNewImage(prev => ({ ...prev, imageUrl: result?.info?.secure_url }));
        }
    };


    const TagButton = ({ tag, label, count }) => (
        <button
            onClick={() => setSelectedTag(tag)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${selectedTag === tag
                    ? `bg-gradient-to-r ${tagColors[tag]} text-white shadow-lg ${tagBorders[tag]}`
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                }`}
        >
            {label} ({count})
        </button>
    );

    // ... keep rest of UI and modal the same
    // Just replace <input type="url" ... /> with Cloudinary upload + preview input

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
            <div className="max-w-7xl mx-auto">
                {/* existing header, controls, and gallery UI here */}
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
                        Gallery Management
                    </h1>
                    <p className="text-gray-400">Manage your restaurant's gallery images</p>
                </div>

                {/* Controls */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search images..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e?.target?.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                            />
                        </div>

                        {/* Tag Filters */}
                        <div className="flex gap-2">
                            <TagButton tag="all" label="All" count={images.length} />
                            <TagButton tag="food" label="Food" count={images.filter(img => img.tag === 'food').length} />
                            <TagButton tag="ambience" label="Ambience" count={images.filter(img => img.tag === 'ambience').length} />
                        </div>

                        {/* View Mode & Actions */}
                        <div className="flex items-center gap-3">
                            <div className="flex bg-gray-900 rounded-xl border border-gray-600 overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>

                            {selectedImages.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Delete ({selectedImages.length})
                                </button>
                            )}

                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Add Image
                            </button>
                        </div>
                    </div>
                </div>

                {/* Gallery */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredImages.map((image) => (
                            <div
                                key={image._id}
                                className={`group relative bg-gray-800 rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${selectedImages.includes(image._id) ? tagBorders[image.tag] : 'border-gray-600'
                                    }`}
                            >
                                <div className="aspect-square relative overflow-hidden">
                                    <img
                                        src={image.imageUrl}
                                        alt={image.tag}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Selection Checkbox */}
                                    <div className="absolute top-3 left-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedImages.includes(image._id)}
                                            onChange={() => toggleImageSelection(image._id)}
                                            className="w-5 h-5 rounded border-gray-400 bg-gray-800 text-yellow-500 focus:ring-yellow-500 focus:ring-2"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {/* <button className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-white transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button> */}
                                        <button
                                            onClick={() => handleDeleteImage(image._id)}
                                            className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Tag */}
                                <div className="p-4">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${tagColors[image.tag]} text-white`}>
                                        {image.tag}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredImages.map((image) => (
                            <div
                                key={image._id}
                                className={`flex items-center gap-4 bg-gray-800 rounded-2xl p-4 border-2 transition-all duration-300 hover:bg-gray-700 ${selectedImages.includes(image._id) ? tagBorders[image.tag] : 'border-gray-600'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedImages.includes(image._id)}
                                    onChange={() => toggleImageSelection(image._id)}
                                    className="w-5 h-5 rounded border-gray-400 bg-gray-800 text-yellow-500 focus:ring-yellow-500 focus:ring-2"
                                />

                                <div className="w-20 h-20 rounded-xl overflow-hidden">
                                    <img
                                        src={image.imageUrl}
                                        alt={image.tag}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${tagColors[image.tag]} text-white`}>
                                        {image.tag}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-white transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteImage(image._id)}
                                        className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filteredImages.length === 0 && (
                    <div className="text-center py-16">
                        <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No images found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                )}
                {/* inside modal, replace image URL input */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Add New Image</h2>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Upload Image
                                    </label>
                                    <CldUploadButton
                                        uploadPreset={cloudPresetName}
                                        options={{ multiple: false }}
                                        onSuccess={handleUploadComplete}
                                        className="inline-block px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium"
                                    >
                                        Upload
                                    </CldUploadButton>


                                    {newImage.imageUrl && (
                                        <img
                                            src={newImage.imageUrl}
                                            alt="preview"
                                            className="mt-4 w-full h-48 object-cover rounded-xl border border-gray-700"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Tag
                                    </label>
                                    <select
                                        value={newImage.tag}
                                        onChange={(e) => setNewImage({ ...newImage, tag: e?.target?.value })}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                                    >
                                        <option value="food">Food</option>
                                        <option value="ambience">Ambience</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddImage}
                                        disabled={!newImage.imageUrl}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 font-medium"
                                    >
                                        Add Image
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryAdminPanel;
