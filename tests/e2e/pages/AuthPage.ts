import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../utils/test-helpers';

/**
 * 认证页面对象模型
 * 包含登录、注册、权限验证等功能
 */
export class AuthPage extends BasePage {
  // 登录页面元素
  readonly loginForm: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberCheckbox: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly wechatLoginButton: Locator;
  readonly loginErrorAlert: Locator;

  // 微信登录模态框
  readonly wechatModal: Locator;
  readonly wechatQrCode: Locator;
  readonly wechatCloseButton: Locator;

  // 用户菜单和登出
  readonly userMenu: Locator;
  readonly userAvatar: Locator;
  readonly logoutButton: Locator;
  readonly userProfileLink: Locator;

  // 权限相关
  readonly unauthorizedMessage: Locator;
  readonly accessDeniedAlert: Locator;

  constructor(page: Page) {
    super(page);
    
    // 登录表单元素
    this.loginForm = page.locator('form, [data-testid="login-form"]');
    this.usernameInput = page.locator('input[name="username"], [data-testid="username-input"]');
    this.passwordInput = page.locator('input[name="password"], [data-testid="password-input"]');
    this.rememberCheckbox = page.locator('input[name="remember"], [data-testid="remember-checkbox"]');
    this.loginButton = page.locator('button[type="submit"], [data-testid="login-button"]');
    this.forgotPasswordLink = page.locator('a[href*="forgot"], [data-testid="forgot-password-link"]');
    this.wechatLoginButton = page.locator('[data-testid="wechat-login-button"], .wechat-login-btn');
    this.loginErrorAlert = page.locator('.ant-alert-error, [data-testid="login-error"]');

    // 微信登录模态框
    this.wechatModal = page.locator('.ant-modal, [data-testid="wechat-modal"]');
    this.wechatQrCode = page.locator('.qr-code, [data-testid="wechat-qr-code"]');
    this.wechatCloseButton = page.locator('.ant-modal-close, [data-testid="wechat-close-button"]');

    // 用户菜单
    this.userMenu = page.locator('.ant-dropdown-menu, [data-testid="user-menu"]');
    this.userAvatar = page.locator('.ant-avatar, [data-testid="user-avatar"]');
    this.logoutButton = page.locator('[data-testid="logout-button"], .logout-btn');
    this.userProfileLink = page.locator('[data-testid="user-profile-link"], .profile-link');

    // 权限相关
    this.unauthorizedMessage = page.locator('.unauthorized, [data-testid="unauthorized-message"]');
    this.accessDeniedAlert = page.locator('.ant-alert-warning, [data-testid="access-denied"]');
  }

  /**
   * 导航到登录页面
   */
  async gotoLogin(): Promise<void> {
    await this.goto('/login');
    await this.helpers.waitForPageLoad();
  }

  /**
   * 执行登录操作
   */
  async login(username: string, password: string, remember: boolean = false): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    
    if (remember) {
      await this.rememberCheckbox.check();
    }
    
    await this.loginButton.click();
  }

  /**
   * 快速登录（使用默认测试账号）
   */
  async quickLogin(): Promise<void> {
    await this.login('testuser', 'Test123!@#');
  }

  /**
   * 检查登录成功
   */
  async checkLoginSuccess(): Promise<void> {
    // 等待页面跳转到主页
    await this.page.waitForURL('/home', { timeout: 10000 });
    
    // 检查用户头像或菜单是否显示
    await expect(this.userAvatar).toBeVisible();
  }

  /**
   * 检查登录失败
   */
  async checkLoginFailure(expectedError?: string): Promise<void> {
    await expect(this.loginErrorAlert).toBeVisible();
    
    if (expectedError) {
      await expect(this.loginErrorAlert).toContainText(expectedError);
    }
  }

  /**
   * 执行登出操作
   */
  async logout(): Promise<void> {
    // 点击用户头像打开菜单
    await this.userAvatar.click();
    
    // 等待菜单显示
    await expect(this.userMenu).toBeVisible();
    
    // 点击登出按钮
    await this.logoutButton.click();
    
    // 等待跳转到登录页
    await this.page.waitForURL('/login', { timeout: 10000 });
  }

  /**
   * 打开微信登录模态框
   */
  async openWeChatLogin(): Promise<void> {
    await this.wechatLoginButton.click();
    await expect(this.wechatModal).toBeVisible();
  }

  /**
   * 关闭微信登录模态框
   */
  async closeWeChatLogin(): Promise<void> {
    await this.wechatCloseButton.click();
    await expect(this.wechatModal).not.toBeVisible();
  }

  /**
   * 检查微信二维码是否显示
   */
  async checkWeChatQrCode(): Promise<void> {
    await expect(this.wechatQrCode).toBeVisible();
  }

  /**
   * 检查是否已登录
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      await expect(this.userAvatar).toBeVisible({ timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查是否未登录
   */
  async isLoggedOut(): Promise<boolean> {
    try {
      await expect(this.loginForm).toBeVisible({ timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查权限被拒绝
   */
  async checkAccessDenied(): Promise<void> {
    await expect(this.accessDeniedAlert).toBeVisible();
  }

  /**
   * 检查未授权访问
   */
  async checkUnauthorized(): Promise<void> {
    await expect(this.unauthorizedMessage).toBeVisible();
  }

  /**
   * 模拟会话过期
   */
  async simulateSessionExpiry(): Promise<void> {
    try {
      // 清除本地存储中的认证信息
      await this.page.evaluate(() => {
        try {
          localStorage.removeItem('auth_access_token');
          localStorage.removeItem('auth_refresh_token');
          localStorage.removeItem('auth_user_info');
          localStorage.removeItem('auth_token_expires');
          localStorage.removeItem('auth_refresh_expires');
        } catch (error) {
          console.warn('无法访问localStorage:', error);
        }
      });
    } catch (error) {
      console.warn('模拟会话过期失败:', error);
    }
    
    // 刷新页面触发重新认证
    await this.page.reload();
  }

  /**
   * 设置认证状态（用于测试）
   */
  async setAuthState(authenticated: boolean): Promise<void> {
    if (authenticated) {
      try {
        // 设置模拟的认证信息
        await this.page.evaluate(() => {
          try {
            const mockTokens = {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
              expiresAt: Date.now() + 3600000, // 1小时后过期
              refreshExpiresAt: Date.now() + 86400000 // 24小时后过期
            };
            
            const mockUser = {
              id: 'test-user-id',
              username: 'testuser',
              email: 'test@example.com',
              roles: ['user'],
              permissions: ['read', 'write']
            };
            
            localStorage.setItem('auth_access_token', mockTokens.accessToken);
            localStorage.setItem('auth_refresh_token', mockTokens.refreshToken);
            localStorage.setItem('auth_user_info', JSON.stringify(mockUser));
            localStorage.setItem('auth_token_expires', mockTokens.expiresAt.toString());
            localStorage.setItem('auth_refresh_expires', mockTokens.refreshExpiresAt.toString());
          } catch (error) {
            console.warn('无法设置localStorage:', error);
          }
        });
      } catch (error) {
        console.warn('设置认证状态失败:', error);
      }
    } else {
      await this.simulateSessionExpiry();
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<any> {
    try {
      return await this.page.evaluate(() => {
        try {
          const userInfo = localStorage.getItem('auth_user_info');
          return userInfo ? JSON.parse(userInfo) : null;
        } catch (error) {
          console.warn('无法访问localStorage:', error);
          return null;
        }
      });
    } catch (error) {
      console.warn('获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 检查记住密码功能
   */
  async checkRememberMe(): Promise<void> {
    const isChecked = await this.rememberCheckbox.isChecked();
    expect(isChecked).toBe(true);
    
    // 检查本地存储中是否保存了用户名
    const rememberedUsername = await this.page.evaluate(() => {
      return localStorage.getItem('remember_username');
    });
    
    expect(rememberedUsername).toBeTruthy();
  }

  /**
   * 清除记住的用户名
   */
  async clearRememberedUsername(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.removeItem('remember_username');
    });
  }

  /**
   * 检查表单验证错误
   */
  async checkFormValidationError(field: 'username' | 'password', expectedMessage: string): Promise<void> {
    const errorElement = this.page.locator(`.ant-form-item-explain-error:has-text("${expectedMessage}")`);
    await expect(errorElement).toBeVisible();
  }

  /**
   * 检查登录按钮状态
   */
  async checkLoginButtonState(enabled: boolean): Promise<void> {
    if (enabled) {
      await expect(this.loginButton).toBeEnabled();
    } else {
      await expect(this.loginButton).toBeDisabled();
    }
  }

  /**
   * 检查密码字段是否被遮盖
   */
  async checkPasswordMasked(): Promise<void> {
    const passwordType = await this.passwordInput.getAttribute('type');
    expect(passwordType).toBe('password');
  }

  /**
   * 访问需要权限的页面
   */
  async accessProtectedPage(path: string): Promise<void> {
    await this.goto(path);
  }

  /**
   * 检查页面重定向到登录页
   */
  async checkRedirectToLogin(): Promise<void> {
    await this.page.waitForURL('/login', { timeout: 10000 });
    await expect(this.loginForm).toBeVisible();
  }
}