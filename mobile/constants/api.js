/**
 * API configuration
 *
 * HOW TO SET THE CORRECT URL:
 *
 * Android Emulator  → use  http://10.0.2.2:4000/api
 * iOS Simulator     → use  http://localhost:4000/api
 * Physical Device   → use  http://<YOUR_MACHINE_IP>:4000/api
 *                     (find your IP: ipconfig on Windows, ifconfig on Mac/Linux)
 *
 * Current machine IP: 192.168.68.103
 */
export const API_BASE_URL = 'http://10.0.2.2:4000/api';          // Android Emulator default
// export const API_BASE_URL = 'http://localhost:4000/api';        // iOS Simulator
// export const API_BASE_URL = 'http://192.168.68.103:4000/api';   // Physical device on this machine

export const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', subtitle: '5-7 business days', price: 3.99 },
  { id: 'express', label: 'Express Delivery', subtitle: '2-3 business days', price: 7.99 },
  { id: 'overnight', label: 'Overnight Delivery', subtitle: 'Next day delivery', price: 14.99 },
  { id: 'free', label: 'Free Delivery', subtitle: '7-10 business days', price: 0 },
];

export const PLAN_FEATURES = {
  free: { name: 'Basic', price: 0, color: '#8a8580', features: ['Browse all books', 'Standard delivery', 'Email support'] },
  premium: { name: 'Premium', price: 9.99, color: '#1a1f36', features: ['Everything in Basic', '10% off all purchases', 'Free standard shipping', 'Early access to sales', 'Priority support'] },
  ultimate: { name: 'Ultimate', price: 19.99, color: '#c0603a', features: ['Everything in Premium', '20% off all purchases', 'Free express shipping', 'Exclusive releases', 'Personal recommendations', 'VIP support'] },
};

export const GENRES = ['Fiction', 'Classic', 'Mystery', 'Thriller', 'Romance', 'Science Fiction', 'Fantasy', 'History', 'Business', 'Self Development', 'Technology', 'General'];
export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
