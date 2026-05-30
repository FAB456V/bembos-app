import api from './api';

export async function createOrder(orderData) {
  const response = await api.post('/orders', orderData);
  return response.data.order;
}

export async function getOrder(orderId) {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.order;
}

export async function getHistory(userId) {
  const response = await api.get(`/orders/history/${userId}`);
  return response.data.orders;
}

export async function getLatestLocation(orderId) {
  const response = await api.get(`/tracking/${orderId}/location`);
  return response.data.location;
}
