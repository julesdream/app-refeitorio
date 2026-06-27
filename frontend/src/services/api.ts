import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: "http://localhost:3001/api/v1",
  timeout: 10000, 
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@AppRefeitorio:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;