import axiosClient from "./axiosClient";

export const memberApi = {
  getAll: (workspaceId) => axiosClient.get(`/workspaces/${workspaceId}/members`),
  updateRole: (workspaceId, memberId, role) =>
    axiosClient.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role }),
  remove: (workspaceId, memberId) =>
    axiosClient.delete(`/workspaces/${workspaceId}/members/${memberId}`),
  leave: (workspaceId) => axiosClient.delete(`/workspaces/${workspaceId}/members/me`),
};