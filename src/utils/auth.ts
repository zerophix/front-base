/**
 * 现代化JWT认证系统
 * 支持token刷新、安全存储和自动过期处理
 */

import { createError, globalErrorHandler } from '@/utils/errorHandler';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

/**
 * Token类型定义
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // 访问令牌过期时间戳
  refreshExpiresAt: number; // 刷新令牌过期时间戳
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  tokens: TokenPair | null;
}

/**
 * 安全存储管理器
 */
class SecureStorage {
  private readonly ACCESS_TOKEN_KEY = 'auth_access_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private readonly USER_INFO_KEY = 'auth_user_info';
  private readonly TOKEN_EXPIRES_KEY = 'auth_token_expires';
  private readonly REFRESH_EXPIRES_KEY = 'auth_refresh_expires';

  /**
   * 存储token对
   */
  setTokens(tokens: TokenPair): void {
    if (typeof window === 'undefined') return;

    try {
      // 使用httpOnly cookie存储刷新令牌（需要服务端配合）
      // 这里先用localStorage，生产环境应该使用httpOnly cookie
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
      localStorage.setItem(this.TOKEN_EXPIRES_KEY, tokens.expiresAt.toString());
      localStorage.setItem(this.REFRESH_EXPIRES_KEY, tokens.refreshExpiresAt.toString());
    } catch (error) {
      globalErrorHandler.handle(
        createError.validation('Token存储失败', 'storage'),
        { originalError: error }
      );
    }
  }

  /**
   * 获取token对
   */
  getTokens(): TokenPair | null {
    if (typeof window === 'undefined') return null;

    try {
      const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      const expiresAt = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
      const refreshExpiresAt = localStorage.getItem(this.REFRESH_EXPIRES_KEY);

      if (!accessToken || !refreshToken || !expiresAt || !refreshExpiresAt) {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        expiresAt: parseInt(expiresAt, 10),
        refreshExpiresAt: parseInt(refreshExpiresAt, 10),
      };
    } catch (error) {
      globalErrorHandler.handle(
        createError.validation('Token读取失败', 'storage'),
        { originalError: error }
      );
      return null;
    }
  }

  /**
   * 存储用户信息
   */
  setUserInfo(user: UserInfo): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(user));
    } catch (error) {
      globalErrorHandler.handle(
        createError.validation('用户信息存储失败', 'storage'),
        { originalError: error }
      );
    }
  }

  /**
   * 获取用户信息
   */
  getUserInfo(): UserInfo | null {
    if (typeof window === 'undefined') return null;

    try {
      const userInfo = localStorage.getItem(this.USER_INFO_KEY);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      globalErrorHandler.handle(
        createError.validation('用户信息读取失败', 'storage'),
        { originalError: error }
      );
      return null;
    }
  }

  /**
   * 清除所有认证数据
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_INFO_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
      localStorage.removeItem(this.REFRESH_EXPIRES_KEY);
    } catch (error) {
      globalErrorHandler.handle(
        createError.validation('认证数据清除失败', 'storage'),
        { originalError: error }
      );
    }
  }
}

/**
 * JWT认证管理器
 */
class AuthManager {
  private storage = new SecureStorage();
  private refreshPromise: Promise<TokenPair> | null = null;

  /**
   * 登录
   */
  async login(username: string, password: string): Promise<AuthState> {
    try {
      const response = await fetch(`${API_BASE}/v1/login/account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const json = await response.json();
      
      // 根据后端返回的响应码判断登录结果
      if (json.code === '0000') {
        // 登录成功
        const user: UserInfo = {
          id: username,
          username: json.data?.username || username,
          email: json.data?.email || '',
          roles: json.data?.roles || ['user'],
          permissions: json.data?.permissions || [],
        };

        // 由于后端暂时没有返回JWT token，我们暂时创建一个简单的token标识
        const longTTL = Date.now() + 24 * 60 * 60 * 1000; // 24小时
        const tokens: TokenPair = {
          accessToken: `session_${username}_${Date.now()}`,
          refreshToken: `refresh_${username}_${Date.now()}`,
          expiresAt: longTTL,
          refreshExpiresAt: longTTL + 7 * 24 * 60 * 60 * 1000, // 7天
        };

        this.storage.setTokens(tokens);
        this.storage.setUserInfo(user);

        return {
          isAuthenticated: true,
          user,
          tokens,
        };
      } else {
        // 登录失败
        throw createError.auth(json.message || '用户名或密码错误');
      }
    } catch (error) {
      // 如果是网络错误或其他错误
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw createError.auth('无法连接到服务器，请检查网络连接');
      }
      globalErrorHandler.handle(error);
      throw error;
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      // 直接清理本地认证数据，避免调用不存在的登出接口
      this.storage.clear();
    } catch (error) {
      globalErrorHandler.handle(error);
      this.storage.clear();
    }
  }

  async loginWithToken(token: string, provider: 'wechat' | 'account' = 'wechat'): Promise<AuthState> {
    try {
      const longTTL = Date.now() + 365 * 24 * 60 * 60 * 1000;
      const tokens: TokenPair = {
        accessToken: String(token),
        refreshToken: String(token),
        expiresAt: longTTL,
        refreshExpiresAt: longTTL,
      };

      const user: UserInfo = {
        id: provider,
        username: provider === 'wechat' ? 'WeChat User' : 'User',
        email: '',
        roles: ['user'],
        permissions: [],
      };

      this.storage.setTokens(tokens);
      this.storage.setUserInfo(user);

      return { isAuthenticated: true, user, tokens };
    } catch (error) {
      globalErrorHandler.handle(error);
      throw error;
    }
  }

  /**
   * 获取当前认证状态
   */
  getAuthState(): AuthState {
    const tokens = this.storage.getTokens();
    const user = this.storage.getUserInfo();

    if (!tokens && !user) {
      return {
        isAuthenticated: false,
        user: null,
        tokens: null,
      };
    }

    // 检查刷新令牌是否过期（仅在存在令牌时）
    if (tokens && Date.now() > tokens.refreshExpiresAt) {
      this.storage.clear();
      return {
        isAuthenticated: false,
        user: null,
        tokens: null,
      };
    }

    return {
      isAuthenticated: Boolean(user) || Boolean(tokens),
      user,
      tokens,
    };
  }

  /**
   * 获取有效的访问令牌（自动刷新）
   */
  async getValidAccessToken(): Promise<string | null> {
    const tokens = this.storage.getTokens();
    
    if (!tokens) {
      return null;
    }

    // 检查刷新令牌是否过期
    if (Date.now() > tokens.refreshExpiresAt) {
      this.storage.clear();
      return null;
    }

    // 如果访问令牌还有5分钟以上有效期，直接返回
    if (Date.now() < tokens.expiresAt - 5 * 60 * 1000) {
      return tokens.accessToken;
    }

    // 需要刷新令牌
    try {
      const newTokens = await this.refreshTokens();
      return newTokens.accessToken;
    } catch (error) {
      globalErrorHandler.handle(error);
      this.storage.clear();
      return null;
    }
  }

  /**
   * 刷新令牌
   */
  private async refreshTokens(): Promise<TokenPair> {
    // 防止并发刷新
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * 执行令牌刷新
   */
  private async performTokenRefresh(): Promise<TokenPair> {
    const tokens = this.storage.getTokens();
    
    if (!tokens) {
      throw createError.auth('无刷新令牌');
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (!response.ok) {
      throw createError.auth('令牌刷新失败');
    }

    const data = await response.json();
    const newTokens: TokenPair = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || tokens.refreshToken, // 某些实现不会返回新的刷新令牌
      expiresAt: Date.now() + (data.expiresIn * 1000),
      refreshExpiresAt: data.refreshExpiresIn 
        ? Date.now() + (data.refreshExpiresIn * 1000)
        : tokens.refreshExpiresAt,
    };

    this.storage.setTokens(newTokens);
    return newTokens;
  }

  /**
   * 检查权限
   */
  hasPermission(permission: string): boolean {
    const authState = this.getAuthState();
    return authState.user?.permissions.includes(permission) || false;
  }

  /**
   * 检查角色
   */
  hasRole(role: string): boolean {
    const authState = this.getAuthState();
    return authState.user?.roles.includes(role) || false;
  }
}

// 导出单例实例
export const authManager = new AuthManager();

// 便捷函数
export const login = (username: string, password: string) => authManager.login(username, password);
export const logout = () => authManager.logout();
export const getAuthState = () => authManager.getAuthState();
export const getValidAccessToken = () => authManager.getValidAccessToken();
export const hasPermission = (permission: string) => authManager.hasPermission(permission);
export const hasRole = (role: string) => authManager.hasRole(role);

// 类型守卫
export const isAuthenticated = (): boolean => {
  const authState = getAuthState();
  return authState.isAuthenticated;
};