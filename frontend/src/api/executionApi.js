import axiosClient from './axiosClient';

export const executionApi = {
  run: (workspaceId, { language, content, stdin }) =>
    axiosClient.post(`/workspaces/${workspaceId}/execute`, { language, content, stdin }),
};