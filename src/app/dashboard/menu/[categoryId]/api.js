const API_BASE = `${process.env.NEXT_PUBLIC_ROUTES_API_URL}/menu`; // Replace with your actual backend URL if different

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'API request failed');
  }
  return response.json();
};

const api = {
  getSubcategories: async () => {
    const res = await fetch(`${API_BASE}/subcategories`);
    return handleResponse(res);
  },

  addSubcategory: async (data) => {
    const res = await fetch(`${API_BASE}/subcategories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  editSubcategory: async (id, data) => {
    const res = await fetch(`${API_BASE}/subcategories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteSubcategory: async (id) => {
    const res = await fetch(`${API_BASE}/subcategories/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  addItem: async (subcategoryId, item) => {
    const res = await fetch(`${API_BASE}/subcategories/${subcategoryId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse(res);
  },

  editItem: async (subcategoryId, itemId, item) => {
    const res = await fetch(`${API_BASE}/subcategories/${subcategoryId}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse(res);
  },

  deleteItem: async (subcategoryId, itemId) => {
    const res = await fetch(`${API_BASE}/subcategories/${subcategoryId}/items/${itemId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  }
};

export default api;
