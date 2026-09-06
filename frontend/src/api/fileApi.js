import axiosClient from "./axiosClient";

export const fileApi = {
  // includeContent fetches full documents in one request instead of one per file
  getAll: (workspaceId, { includeContent = false } = {}) =>
    axiosClient.get(`/workspaces/${workspaceId}/files`, {
      params: includeContent ? { includeContent: "true" } : undefined,
    }),
  getById: (workspaceId, fileId) =>
    axiosClient.get(`/workspaces/${workspaceId}/files/${fileId}`),
  create: (workspaceId, name) =>
    axiosClient.post(`/workspaces/${workspaceId}/files`, { name }),
  update: (workspaceId, fileId, data) =>
    axiosClient.patch(`/workspaces/${workspaceId}/files/${fileId}`, data),
  remove: (workspaceId, fileId) =>
    axiosClient.delete(`/workspaces/${workspaceId}/files/${fileId}`),
};
