import instance from '../config/api';
import { tokenStore } from '../utils/tokenStore';

class AuthService {
  async login(email: string, password: string) {
    const response = await instance.post('/auth/login', { email, password });
    
    const accessToken = response.data.accessToken;

    if (accessToken) {
      tokenStore.set(accessToken);
    }

    return response.data;
  }

  async logout() {
    try {
      await instance.post('/auth/logout');
    } finally {
      tokenStore.clear();
    }
  }

  async refreshToken() {
    const response = await instance.post('/auth/refresh');
    const accessToken = response.data.accessToken;

    if (accessToken) {
      tokenStore.set(accessToken);
    }

    return response.data;
  }

  async verifySession() {
    const response = await instance.get('/auth/me'); 
    const accessToken = response.data.accessToken;

    if (accessToken) {
      tokenStore.set(accessToken);
    }

    return response.data;
  }
}

export const authService = new AuthService();