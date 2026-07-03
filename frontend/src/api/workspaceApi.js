import axiosClient from './axiosClient';

export const workspaceApi = {
  // Create a new workspace
  createWorkspace: (data) => {
    return axiosClient.post('/workspaces', data);
  },

  // Get all workspaces for current user
  getWorkspaces: () => {
    return axiosClient.get('/workspaces');
  },

  // Get a single workspace by ID
  getWorkspaceById: (id) => {
    return axiosClient.get(`/workspaces/${id}`);
  },

  // Update workspace
  updateWorkspace: (id, data) => {
    return axiosClient.patch(`/workspaces/${id}`, data);
  },

  // Delete workspace
  deleteWorkspace: (id) => {
    return axiosClient.delete(`/workspaces/${id}`);
  }
};