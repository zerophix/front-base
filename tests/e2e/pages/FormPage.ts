import { Page, Locator } from '@playwright/test';
import { BasePage } from '../utils/test-helpers';

/**
 * 表单页面对象模型
 * 适用于所有基于BaseFormPage的页面
 */
export class FormPage extends BasePage {
  // 通用表单元素选择器
  private readonly selectors = {
    form: 'form, .ant-form',
    submitButton: '[data-testid="submit-button"], button[type="submit"], .ant-btn-primary',
    resetButton: '[data-testid="reset-button"], button[type="reset"]',
    cancelButton: '[data-testid="cancel-button"]',
    saveButton: '[data-testid="save-button"]',
    formItem: '.ant-form-item',
    formError: '.ant-form-item-explain-error',
    loading: '.ant-spin',
    notification: '.ant-notification',
    modal: '.ant-modal',
    confirmButton: '.ant-modal .ant-btn-primary'
  };

  constructor(page: Page) {
    super(page);
  }

  // 页面元素getter
  get form(): Locator {
    return this.page.locator(this.selectors.form);
  }

  get submitButton(): Locator {
    return this.page.locator(this.selectors.submitButton);
  }

  get resetButton(): Locator {
    return this.page.locator(this.selectors.resetButton);
  }

  get cancelButton(): Locator {
    return this.page.locator(this.selectors.cancelButton);
  }

  get saveButton(): Locator {
    return this.page.locator(this.selectors.saveButton);
  }

  /**
   * 填写表单字段
   */
  async fillField(fieldName: string, value: string) {
    const field = this.page.locator(`[name="${fieldName}"], [data-testid="${fieldName}"]`);
    await field.waitFor({ state: 'visible' });
    
    // 根据字段类型进行不同的操作
    const tagName = await field.evaluate(el => el.tagName.toLowerCase());
    const type = await field.getAttribute('type');
    const className = await field.getAttribute('class');
    
    if (tagName === 'select' || className?.includes('ant-select')) {
      // 下拉选择
      await field.click();
      await this.page.locator(`.ant-select-dropdown .ant-select-item`, { hasText: value }).click();
    } else if (type === 'checkbox') {
      // 复选框
      if (value === 'true' || value === '1') {
        await field.check();
      } else {
        await field.uncheck();
      }
    } else if (type === 'radio') {
      // 单选框
      await this.page.locator(`[name="${fieldName}"][value="${value}"]`).check();
    } else if (className?.includes('ant-picker')) {
      // 日期选择器
      await field.click();
      await this.page.keyboard.type(value);
      await this.page.keyboard.press('Enter');
    } else {
      // 普通输入框
      await field.fill(value);
    }
  }

  /**
   * 批量填写表单
   */
  async fillForm(formData: Record<string, string>) {
    for (const [fieldName, value] of Object.entries(formData)) {
      await this.fillField(fieldName, value);
    }
  }

  /**
   * 提交表单
   */
  async submitForm() {
    await this.submitButton.click();
    
    // 等待提交完成（可能有loading状态）
    const loading = this.page.locator(this.selectors.loading);
    if (await loading.isVisible()) {
      await loading.waitFor({ state: 'hidden', timeout: 10000 });
    }
  }

  /**
   * 重置表单
   */
  async resetForm() {
    await this.resetButton.click();
  }

  /**
   * 取消操作
   */
  async cancelForm() {
    await this.cancelButton.click();
  }

  /**
   * 保存表单（如果有保存按钮）
   */
  async saveForm() {
    await this.saveButton.click();
  }

  /**
   * 获取字段值
   */
  async getFieldValue(fieldName: string): Promise<string> {
    const field = this.page.locator(`[name="${fieldName}"], [data-testid="${fieldName}"]`);
    return await field.inputValue();
  }

  /**
   * 检查字段错误信息
   */
  async getFieldError(fieldName: string): Promise<string | null> {
    const formItem = this.page.locator(`.ant-form-item`).filter({ has: this.page.locator(`[name="${fieldName}"]`) });
    const errorElement = formItem.locator(this.selectors.formError);
    
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }

  /**
   * 检查表单是否有错误
   */
  async hasFormErrors(): Promise<boolean> {
    const errors = this.page.locator(this.selectors.formError);
    return await errors.count() > 0;
  }

  /**
   * 获取所有表单错误
   */
  async getFormErrors(): Promise<string[]> {
    const errors = this.page.locator(this.selectors.formError);
    const count = await errors.count();
    const errorMessages: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const text = await errors.nth(i).textContent();
      if (text) {
        errorMessages.push(text.trim());
      }
    }
    
    return errorMessages;
  }

  /**
   * 等待表单验证完成
   */
  async waitForValidation() {
    // 等待一小段时间让验证完成
    await this.page.waitForTimeout(500);
  }

  /**
   * 检查提交按钮是否可用
   */
  async isSubmitButtonEnabled(): Promise<boolean> {
    return await this.submitButton.isEnabled();
  }

  /**
   * 检查成功通知
   */
  async checkSuccessNotification(message?: string) {
    const notification = this.page.locator('.ant-notification-notice-success');
    await notification.waitFor({ state: 'visible', timeout: 5000 });
    
    if (message) {
      await this.helpers.checkNotification(message, 'success');
    }
  }

  /**
   * 检查错误通知
   */
  async checkErrorNotification(message?: string) {
    const notification = this.page.locator('.ant-notification-notice-error');
    await notification.waitFor({ state: 'visible', timeout: 5000 });
    
    if (message) {
      await this.helpers.checkNotification(message, 'error');
    }
  }

  /**
   * 确认模态框操作
   */
  async confirmModal() {
    const modal = this.page.locator(this.selectors.modal);
    await modal.waitFor({ state: 'visible' });
    
    const confirmButton = modal.locator(this.selectors.confirmButton);
    await confirmButton.click();
    
    await modal.waitFor({ state: 'hidden' });
  }

  /**
   * 取消模态框操作
   */
  async cancelModal() {
    const modal = this.page.locator(this.selectors.modal);
    await modal.waitFor({ state: 'visible' });
    
    const cancelButton = modal.locator('.ant-btn').filter({ hasText: '取消' });
    await cancelButton.click();
    
    await modal.waitFor({ state: 'hidden' });
  }

  /**
   * 上传文件
   */
  async uploadFile(fieldName: string, filePath: string) {
    const uploadInput = this.page.locator(`[name="${fieldName}"] input[type="file"], .ant-upload input[type="file"]`);
    await uploadInput.setInputFiles(filePath);
    
    // 等待上传完成
    await this.page.waitForTimeout(1000);
  }

  /**
   * 选择下拉选项
   */
  async selectOption(fieldName: string, optionText: string) {
    const selectField = this.page.locator(`[name="${fieldName}"], [data-testid="${fieldName}"]`);
    await selectField.click();
    
    const option = this.page.locator('.ant-select-dropdown .ant-select-item', { hasText: optionText });
    await option.click();
  }

  /**
   * 选择多个选项
   */
  async selectMultipleOptions(fieldName: string, optionTexts: string[]) {
    const selectField = this.page.locator(`[name="${fieldName}"], [data-testid="${fieldName}"]`);
    
    for (const optionText of optionTexts) {
      await selectField.click();
      const option = this.page.locator('.ant-select-dropdown .ant-select-item', { hasText: optionText });
      await option.click();
    }
    
    // 点击其他地方关闭下拉框
    await this.page.click('body');
  }

  /**
   * 设置日期
   */
  async setDate(fieldName: string, date: string) {
    const dateField = this.page.locator(`[name="${fieldName}"], [data-testid="${fieldName}"]`);
    await dateField.click();
    
    // 清空现有值
    await dateField.fill('');
    
    // 输入新日期
    await dateField.type(date);
    await this.page.keyboard.press('Enter');
  }

  /**
   * 设置日期范围
   */
  async setDateRange(fieldName: string, startDate: string, endDate: string) {
    const dateRangeField = this.page.locator(`[name="${fieldName}"], [data-testid="${fieldName}"]`);
    await dateRangeField.click();
    
    // 输入开始日期
    await this.page.keyboard.type(startDate);
    await this.page.keyboard.press('Tab');
    
    // 输入结束日期
    await this.page.keyboard.type(endDate);
    await this.page.keyboard.press('Enter');
  }
}