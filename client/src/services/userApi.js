/**
 * @file userApi.js
 * @description Admin user management API calls.
 * Uses the shared axios instance (baseURL + withCredentials).
 */

import axios from '../../src/axiosInstance';

/**
 * List users (admin).
 * @param {Object} params - { page, limit, search, sortField, sortOrder }
 */
export const adminGetUsers = async (params = {}) => {
  const { data } = await axios.get('/admin/users', { params });
  return data; // { users, total, totalPages, page, limit }
};

/**
 * Update flags/role for a user (admin).
 * Send only the fields you want to change.
 * @param {string} userId
 * @param {Object} patch - { isVerified?, premiumMember?, role?, isLocked? }
 */
export const adminUpdateUser = async (userId, patch) => {
  const { data } = await axios.put(`/admin/users/${userId}`, patch);
  return data; // { user }
};

/**
 * Toggle lock/unlock for a user (admin).
 * @param {string} userId
 */
export const adminToggleLock = async (userId) => {
  const { data } = await axios.put(`/admin/users/${userId}/lock`);
  return data; // { message, isLocked }
};

/**
 * Delete user (admin).
 * @param {string} userId
 */
export const adminDeleteUser = async (userId) => {
  const { data } = await axios.delete(`/admin/users/${userId}`);
  return data; // { success: true }
};
