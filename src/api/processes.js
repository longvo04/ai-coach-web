import axiosClient from './axiosClient';

export const listProcesses = async (userId) => {
  const { data } = await axiosClient.get('/goals', { params: { userId } });
  return data;
};

export const listGoalHistory = async (userId) => {
  const { data } = await axiosClient.get('/processes', { params: { userId } });
  return data;
};

export const createProcess = async (userId, payload) => {
  const { data } = await axiosClient.post('/goals', payload, { params: { userId } });
  return data;
};

export const updateProcess = async (goalId, payload) => {
  const { data } = await axiosClient.put(`/goals`, payload, { params: { goalId } });
  return data;
};

export const deleteProcess = async (goalId) => {
  const { data } = await axiosClient.delete(`/goals`, { params: { goalId } });
  return data;
};


