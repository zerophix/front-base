import {
  authManager,
  login,
  logout,
  getAuthState,
  getValidAccessToken,
  hasPermission,
  hasRole,
  isAuthenticated,
  TokenPair,
  UserInfo,
  AuthState
} from '../../utils/auth';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch
global.fetch = jest.fn();

// Mock errorHandler
jest.mock('../errorHandler', () => ({
  createError: jest.fn((type, message) => new Error(message)),
  globalErrorHandler: {
    handle: jest.fn(),
  },
}));

describe('Auth System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('SecureStorage', () => {
    it('should store and retrieve tokens', () => {
      const tokens: TokenPair = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        expiresAt: Date.now() + 3600000,
        refreshExpiresAt: Date.now() + 7200000,
      };

      // Test setTokens
      authManager['storage'].setTokens(tokens);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_access_token', tokens.accessToken);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_refresh_token', tokens.refreshToken);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token_expires', tokens.expiresAt.toString());
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_refresh_expires', tokens.refreshExpiresAt.toString());
    });

    it('should retrieve stored tokens', () => {
      const tokens: TokenPair = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        expiresAt: Date.now() + 3600000,
        refreshExpiresAt: Date.now() + 7200000,
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        switch (key) {
          case 'auth_access_token': return tokens.accessToken;
          case 'auth_refresh_token': return tokens.refreshToken;
          case 'auth_token_expires': return tokens.expiresAt.toString();
          case 'auth_refresh_expires': return tokens.refreshExpiresAt.toString();
          default: return null;
        }
      });

      const retrievedTokens = authManager['storage'].getTokens();
      expect(retrievedTokens).toEqual(tokens);
    });

    it('should store and retrieve user info', () => {
      const userInfo: UserInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        permissions: ['read'],
      };

      authManager['storage'].setUserInfo(userInfo);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_user_info', JSON.stringify(userInfo));

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(userInfo));
      const retrievedUserInfo = authManager['storage'].getUserInfo();
      expect(retrievedUserInfo).toEqual(userInfo);
    });

    it('should clear all stored data', () => {
      authManager['storage'].clear();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_access_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_refresh_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_user_info');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token_expires');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_refresh_expires');
    });
  });

  describe('AuthManager', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
          expiresIn: 3600,
          refreshExpiresIn: 7200,
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            roles: ['user'],
            permissions: ['read'],
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const authState = await login('testuser', 'password');

      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user?.username).toBe('testuser');
      expect(authState.tokens?.accessToken).toBe('access_token');
    });

    it('should handle login failure', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Invalid credentials' }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(login('testuser', 'wrongpassword')).rejects.toThrow();
    });

    it('should logout successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await logout();

      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });

    it('should get auth state', () => {
      const userInfo: UserInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        permissions: ['read'],
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'auth_user_info') return JSON.stringify(userInfo);
        if (key === 'auth_access_token') return 'access_token';
        if (key === 'auth_refresh_token') return 'refresh_token';
        if (key === 'auth_token_expires') return (Date.now() + 3600000).toString();
        if (key === 'auth_refresh_expires') return (Date.now() + 7200000).toString();
        return null;
      });

      const authState = getAuthState();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user).toEqual(userInfo);
    });

    it('should check permissions', () => {
      const userInfo: UserInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['admin'],
        permissions: ['read', 'write'],
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'auth_user_info') return JSON.stringify(userInfo);
        if (key === 'auth_access_token') return 'access_token';
        if (key === 'auth_refresh_token') return 'refresh_token';
        if (key === 'auth_token_expires') return (Date.now() + 3600000).toString();
        if (key === 'auth_refresh_expires') return (Date.now() + 7200000).toString();
        return null;
      });

      expect(hasPermission('read')).toBe(true);
      expect(hasPermission('delete')).toBe(false);
    });

    it('should check roles', () => {
      const userInfo: UserInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['admin', 'user'],
        permissions: ['read', 'write'],
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'auth_user_info') return JSON.stringify(userInfo);
        if (key === 'auth_access_token') return 'access_token';
        if (key === 'auth_refresh_token') return 'refresh_token';
        if (key === 'auth_token_expires') return (Date.now() + 3600000).toString();
        if (key === 'auth_refresh_expires') return (Date.now() + 7200000).toString();
        return null;
      });

      expect(hasRole('admin')).toBe(true);
      expect(hasRole('superuser')).toBe(false);
    });

    it('should check authentication status', () => {
      // Not authenticated
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(isAuthenticated()).toBe(false);

      // Authenticated with valid token
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'auth_access_token') return 'access_token';
        if (key === 'auth_refresh_token') return 'refresh_token';
        if (key === 'auth_token_expires') return (Date.now() + 3600000).toString();
        if (key === 'auth_refresh_expires') return (Date.now() + 7200000).toString();
        if (key === 'auth_user_info') return JSON.stringify({
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['user'],
          permissions: ['read'],
        });
        return null;
      });
      expect(isAuthenticated()).toBe(true);

      // Expired token
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'auth_access_token') return 'access_token';
        if (key === 'auth_token_expires') return (Date.now() - 3600000).toString();
        return null;
      });
      expect(isAuthenticated()).toBe(false);
    });

    it('should get valid access token', async () => {
      // Valid token
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'auth_access_token') return 'valid_token';
        if (key === 'auth_refresh_token') return 'refresh_token';
        if (key === 'auth_token_expires') return (Date.now() + 3600000).toString();
        if (key === 'auth_refresh_expires') return (Date.now() + 7200000).toString();
        return null;
      });

      const token = await getValidAccessToken();
      expect(token).toBe('valid_token');
    });

    it('should refresh expired token', async () => {
      // Expired access token but valid refresh token
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'auth_access_token') return 'expired_token';
        if (key === 'auth_refresh_token') return 'refresh_token';
        if (key === 'auth_token_expires') return (Date.now() - 1000).toString();
        if (key === 'auth_refresh_expires') return (Date.now() + 3600000).toString();
        return null;
      });

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
          expiresIn: 3600,
          refreshExpiresIn: 7200,
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const token = await getValidAccessToken();
      expect(token).toBe('new_access_token');
    });
  });
});