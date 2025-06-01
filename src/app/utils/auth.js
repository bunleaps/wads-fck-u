'use client';

export const getToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('token');
};

export const getUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');

  if (token && userString) {
    try {
      const userDetails = JSON.parse(userString);
      // Assuming userDetails contains a 'role' property
      return { token, details: userDetails };
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
      // Token exists, but user data might be corrupted. Handle as appropriate.
      // For now, returning null for details.
      return { token, details: null };
    }
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Optionally, redirect to login or reload:
  // window.location.href = '/auth/login';
};