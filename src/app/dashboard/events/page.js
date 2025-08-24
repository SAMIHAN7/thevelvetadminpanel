'use client';
import React, { useState, useEffect } from 'react';
import
  {
    Search, Plus, Edit, Calendar, Users, Clock, Eye, Trash2, Filter
  } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCookies } from 'next-client-cookies';
const BASEURl = `${process.env.NEXT_PUBLIC_ROUTES_API_URL}/events`;
const EventsManagement = () =>
{
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useRouter();
  const cookie = useCookies();
  // Fetch events from your real API
  useEffect(() =>
  {
    const fetchEvents = async () =>
    {
      try
      {
        const response = await fetch(`${BASEURl}/events`, {
          headers: {
            'Content-Type': 'application/json',
            'auth-token': cookie.get('auth')
          }
        });
        const result = await response.json();
        if (response.ok)
        {
          setEvents(result?.data || []);
        } else
        {
          console.error('Error:', result?.error);
        }
      } catch (error)
      {
        console.error('Fetch failed:', error);
      } finally
      {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getEventStatus = (event) =>
  {
    const now = new Date();
    const regStart = new Date(event.registrationStart);
    const regEnd = new Date(event.registrationEnd);
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);

    if (now < regStart) return 'upcoming';
    if (now >= regStart && now <= regEnd) return 'registration';
    if (now > regEnd && now < eventStart) return 'closed';
    if (now >= eventStart && now <= eventEnd) return 'active';
    return 'completed';
  };

  const getStatusColor = (status) =>
  {
    switch (status)
    {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'registration': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'closed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'active': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'completed': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const filteredEvents = events.filter(event =>
  {
    const matchesSearch = event?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || getEventStatus(event) === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date) =>
  {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateEvent = () =>
  {
     navigate.push(`/dashboard/events/add`);
    // TODO: Navigate to create event page
  };

  const handleEditEvent = (eventId) =>
  {
    // TODO: Navigate to edit event page
    navigate.push(`/dashboard/events/${eventId}`);

  };

  const handleViewEvent = (eventId) =>
  {
    navigate.push(`/dashboard/events/${eventId}`);
  };

  const handleDeleteEvent = async (eventId) =>
  {
    const confirmDelete = confirm('Are you sure you want to delete this event?');
    if (!confirmDelete) return;

    try
    {
      const res = await fetch(`${BASEURl}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': cookie.get('auth')
        }
      });
      const data = await res.json();
      if (res.ok)
      {
        setEvents(events.filter(e => e?._id !== eventId));
        alert('Event deleted');
      } else
      {
        alert(data?.error || 'Error deleting event');
      }
    } catch (error)
    {
      alert('Failed to delete event');
    }
  };

  if (loading)
  {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/20 via-orange-900/20 to-yellow-900/20 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Events Management
              </h1>
              <p className="text-gray-400 mt-2">Manage all your events in one place</p>
            </div>
            <button
              onClick={handleCreateEvent}
              className="mt-4 md:mt-0 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create New Event
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e?.target?.value)}
              className="pl-10 pr-8 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white appearance-none cursor-pointer"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="registration">Registration Open</option>
              <option value="closed">Registration Closed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Event Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) =>
          {
            const status = getEventStatus(event);
            const attendeeCount = event?.attendees?.length || 0;
            const capacityPercentage = (attendeeCount / event.capacity) * 100;

            return (
              <div
                key={event._id}
                onClick={() => handleViewEvent(event._id)}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 hover:border-orange-500/50 cursor-pointer"
              >
                <div className="relative h-48 bg-gray-700">
                  {event?.images?.[0] && (
                    <img
                      src={event.images[0]}
                      alt={event?.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                  {/* {event.password && (
                    <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold">
                      Private
                    </div>
                  )} */}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                    {event?.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {event?.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      <span>{formatDate(event?.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span>Reg: {formatDate(event?.registrationStart)} - {formatDate(event?.registrationEnd)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>{attendeeCount} / {event?.capacity} attendees</span>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Capacity</span>
                      <span>{Math.round(capacityPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${capacityPercentage >= 90 ? 'bg-red-500' :
                            capacityPercentage >= 70 ? 'bg-yellow-500' :
                              'bg-green-500'
                          }`}
                        style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event?._id);
                      }}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event?._id);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No events found */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first event'}
            </p>
            <button
              onClick={handleCreateEvent}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create New Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsManagement;
