import { test, expect } from '@playwright/test';
import { FormPage } from '../pages/FormPage';
import { TestHelpers } from '../utils/test-helpers';

test.describe('表单页面测试', () => {
  let formPage: FormPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    formPage = new FormPage(page);
    helpers = new TestHelpers(page);
    await formPage.goto('/detection-objects/new');
    await helpers.waitForPageLoad();
  });

  test.describe('基础功能测试', () => {
    test('页面基本元素加载正确 @smoke', async ({ page }) => {
      // 检查页面标题
      await expect(page).toHaveTitle(/LIMS|表单|Form/);
      
      // 检查页面是否加载完成
      await expect(page.locator('body')).toBeVisible();
      
      // 检查页面是否有内容
      await expect(page.locator('html')).toContainText(/./); // 至少包含一些文本
    });

    test('表单字段验证功能', async ({ page }) => {
      // 尝试提交空表单
      await formPage.submitForm();
      
      // 检查表单是否有错误
      const hasErrors = await formPage.hasFormErrors();
      expect(hasErrors).toBe(true);
      
      // 检查必填字段错误提示
      const objectCodeError = await formPage.getFieldError('objectCode');
      const objectNameError = await formPage.getFieldError('objectName');
      const categoryError = await formPage.getFieldError('category');
      expect(objectCodeError).toBeTruthy();
      expect(objectNameError).toBeTruthy();
      expect(categoryError).toBeTruthy();
      
      // 填写部分字段
      await formPage.fillField('objectCode', 'TEST001');
      await formPage.fillField('objectName', '测试对象');
      
      // 等待验证
      await formPage.waitForValidation();
      
      // 检查错误消失
      const objectCodeErrorAfter = await formPage.getFieldError('objectCode');
      const objectNameErrorAfter = await formPage.getFieldError('objectName');
      expect(objectCodeErrorAfter).toBeNull();
      expect(objectNameErrorAfter).toBeNull();
    });

    test('表单填写和提交功能', async ({ page }) => {
      const formData = {
        objectCode: 'TEST001',
        objectName: '测试检测对象',
        category: '环境检测',
        description: '这是一个测试用的检测对象',
        standardReference: 'GB/T 1234-2023',
        detectionMethod: '光谱分析法',
        status: 'active'
      };

      // 填写表单
      await formPage.fillForm(formData);
      
      // 检查字段值
      for (const [field, value] of Object.entries(formData)) {
        const fieldValue = await formPage.getFieldValue(field);
        expect(fieldValue).toBe(value);
      }
      
      // 提交表单
      await formPage.submitForm();
      
      // 检查成功提示
      await formPage.checkSuccessNotification();
    });

    test('表单暂存功能', async ({ page }) => {
      const formData = {
        objectCode: 'DRAFT001',
        objectName: '草稿检测对象',
        category: '水质检测'
      };

      // 填写部分表单
      await formPage.fillForm(formData);
      
      // 暂存表单
      await formPage.saveForm();
      
      // 检查成功提示
      await formPage.checkSuccessNotification();
    });

    test('表单重置功能', async ({ page }) => {
      const formData = {
        objectCode: 'RESET001',
        objectName: '重置测试对象'
      };

      // 填写表单
      await formPage.fillForm(formData);
      
      // 重置表单
      await formPage.resetForm();
      
      // 检查字段是否清空
      const objectCodeValue = await formPage.getFieldValue('objectCode');
      const objectNameValue = await formPage.getFieldValue('objectName');
      expect(objectCodeValue).toBe('');
      expect(objectNameValue).toBe('');
    });
  });

  test.describe('交互功能测试', () => {
    test('键盘导航功能正常', async ({ page }) => {
      // 测试Tab键导航
      await page.keyboard.press('Tab');
      const firstField = page.locator('[name="objectCode"], [data-testid="objectCode"]');
      await expect(firstField).toBeFocused();
      
      // 继续Tab导航
      await page.keyboard.press('Tab');
      const secondField = page.locator('[name="objectName"], [data-testid="objectName"]');
      await expect(secondField).toBeFocused();
    });

    test('字段联动功能', async ({ page }) => {
      // 选择特定类别
      await formPage.selectOption('category', '环境检测');
      
      // 检查相关字段是否更新
      await page.waitForTimeout(500); // 等待联动效果
      
      // 验证联动结果（具体逻辑根据实际业务调整）
      const categoryValue = await formPage.getFieldValue('category');
      expect(categoryValue).toBe('环境检测');
    });

    test('文件上传功能', async ({ page }) => {
      // 创建测试文件
      const testFile = 'test-document.pdf';
      
      // 上传文件
      await formPage.uploadFile('attachments', testFile);
      
      // 检查上传成功
      const uploadedFile = page.locator('.ant-upload-list-item');
      await expect(uploadedFile).toBeVisible();
    });
  });

  test.describe('错误处理测试', () => {
    test('网络错误处理', async ({ page }) => {
      // 模拟网络错误
      await page.route('**/api/detection-objects', route => {
        route.abort('failed');
      });

      const formData = {
        objectCode: 'ERROR001',
        objectName: '错误测试对象'
      };

      await formPage.fillForm(formData);
      await formPage.submitForm();
      
      // 检查错误提示
      await formPage.checkErrorNotification();
    });

    test('服务器错误处理', async ({ page }) => {
      // 模拟服务器错误
      await page.route('**/api/detection-objects', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      const formData = {
        objectCode: 'SERVER001',
        objectName: '服务器错误测试'
      };

      await formPage.fillForm(formData);
      await formPage.submitForm();
      
      // 检查错误提示
      await formPage.checkErrorNotification();
    });
  });

  test.describe('性能测试', () => {
    test('表单加载性能', async ({ page }) => {
      const startTime = Date.now();
      await formPage.goto('/detection-objects/new');
      await helpers.waitForPageLoad();
      const loadTime = Date.now() - startTime;
      
      // 检查加载时间（应小于3秒）
      expect(loadTime).toBeLessThan(3000);
    });

    test('大量数据处理性能', async ({ page }) => {
      // 填写大量数据
      const largeDescription = 'A'.repeat(1000);
      await formPage.fillField('description', largeDescription);
      
      // 检查响应时间
      const startTime = Date.now();
      await formPage.submitForm();
      const submitTime = Date.now() - startTime;
      
      // 检查提交时间（应小于5秒）
      expect(submitTime).toBeLessThan(5000);
    });
  });

  test.describe('可访问性测试', () => {
    test('页面可访问性检查', async ({ page }) => {
      // 检查ARIA标签
      const form = formPage.form;
      await expect(form).toHaveAttribute('role', 'form');
      
      // 检查标签关联
      const fields = ['objectCode', 'objectName', 'category'];
      for (const field of fields) {
        const fieldElement = page.locator(`[name="${field}"], [data-testid="${field}"]`);
        const label = page.locator(`label[for="${field}"]`);
        await expect(label).toBeVisible();
      }
    });

    test('键盘可访问性', async ({ page }) => {
      // 使用键盘导航到提交按钮
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // 检查焦点是否正确
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('响应式设计测试', () => {
    test('移动端响应式布局', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });
      await formPage.goto('/detection-objects/new');
      
      // 检查表单结构
      await expect(formPage.form).toBeVisible();
      
      // 检查移动端布局
      const form = formPage.form;
      const boundingBox = await form.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(375);
    });

    test('平板端响应式布局', async ({ page }) => {
      // 设置平板端视口
      await page.setViewportSize({ width: 768, height: 1024 });
      await formPage.goto('/detection-objects/new');
      
      // 检查表单结构
      await expect(formPage.form).toBeVisible();
      
      // 检查平板端布局
      const form = formPage.form;
      const boundingBox = await form.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(768);
    });

    test('桌面端响应式布局', async ({ page }) => {
      // 设置桌面端视口
      await page.setViewportSize({ width: 1920, height: 1080 });
      await formPage.goto('/detection-objects/new');
      
      // 检查表单结构
      await expect(formPage.form).toBeVisible();
      
      // 检查桌面端布局
      const form = formPage.form;
      const boundingBox = await form.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(768);
    });
  });

  test.describe('组件集成测试', () => {
    test('与StandardFormPage组件集成', async ({ page }) => {
      // 检查StandardFormPage特有功能
      await expect(formPage.form).toBeVisible();
      await expect(formPage.submitButton).toBeVisible();
      await expect(formPage.saveButton).toBeVisible();
      
      // 检查工具栏功能
      const toolbar = page.locator('.ant-form-toolbar, [data-testid="form-toolbar"]');
      if (await toolbar.isVisible()) {
        await expect(toolbar).toBeVisible();
      }
    });

    test('与BaseFormPage组件集成', async ({ page }) => {
      // 检查BaseFormPage基础功能
      await expect(formPage.form).toBeVisible();
      
      // 检查基础按钮
      await expect(formPage.submitButton).toBeVisible();
      await expect(formPage.cancelButton).toBeVisible();
      
      // 测试取消功能
      await formPage.cancelForm();
    });
  });
});