import axiosClient from "./axiosClient";

export const invitationApi = {
  // workspace-scoped (owner)
  create: (workspaceId, data) => axiosClient.post(`/workspaces/${workspaceId}/invitations`, data),
  getForWorkspace: (workspaceId) => axiosClient.get(`/workspaces/${workspaceId}/invitations`),
  cancel: (workspaceId, invitationId) =>
    axiosClient.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`),

  // user-scoped (invitee)
  getMine: () => axiosClient.get(`/invitations/me`),
  accept: (invitationId) => axiosClient.post(`/invitations/${invitationId}/accept`),
  decline: (invitationId) => axiosClient.post(`/invitations/${invitationId}/decline`),
};