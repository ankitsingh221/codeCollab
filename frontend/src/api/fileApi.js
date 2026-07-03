import axiosClient from './axiosClient';

export const fileApi = {
  getAll: (workspaceId) => axiosClient.get(`/workspaces/${workspaceId}/files`),
  getById: (workspaceId, fileId) => axiosClient.get(`/workspaces/${workspaceId}/files/${fileId}`),
  create: (workspaceId, name) => axiosClient.post(`/workspaces/${workspaceId}/files`, { name }),
  update: (workspaceId, fileId, data) =>
    axiosClient.patch(`/workspaces/${workspaceId}/files/${fileId}`, data),
  remove: (workspaceId, fileId) => axiosClient.delete(`/workspaces/${workspaceId}/files/${fileId}`),
};