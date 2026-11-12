import Notification from '../models/Notification.js';

export const createNotification = async (userId, title, message, type = 'system', data = {}) => {
  try {
    await Notification.create({ user: userId, title, message, type, data });
  } catch (err) {
    console.error('Notification creation error:', err.message);
  }
};
