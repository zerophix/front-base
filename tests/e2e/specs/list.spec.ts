import { test, expect } from '@playwright/test';
import { ListPage } from '../pages/ListPage';
import { TestHelpers } from '../utils/test-helpers';

test.describe('列表页面测试', () => {
  let listPage: ListPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    listPage = new ListPage(page);
    helpers = new TestHelpers(page);
    
    // 设置认证状态
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('auth_user_info', JSON.stringify({
        id: 'test-user',
        username: 'testuser',
        roles: ['user'],
        permissions: ['read', 'write']
      }));
    });
  });

  test.describe('人员列表页面测试', () => {
    test.beforeEach(async ({ page }) => {
      await listPage.goto('/personnel/list');
      await helpers.waitForPageLoad();
    });

    test('页面基本元素显示正确', async ({ page }) => {
      // 检查页面标题
      await expect(page).toHaveTitle(/人员一览表|人员列表/);
      
      // 检查页面容器
      await expect(listPage.pageContainer).toBeVisible();
      
      // 检查可编辑表格
      await expect(listPage.editableTable).toBeVisible();
      
      // 检查表格基本结构
      await expect(listPage.table).toBeVisible();
      await expect(listPage.tableHeader).toBeVisible();
      await expect(listPage.tableBody).toBeVisible();
      
      // 检查操作按钮
      await expect(listPage.addRowButton).toBeVisible();
      await expect(listPage.batchImportButton).toBeVisible();
      await expect(listPage.submitButton).toBeVisible();
      await expect(listPage.saveButton).toBeVisible();
    });

    test('表格列标题显示正确', async ({ page }) => {
      const expectedColumns = [
        '上岗证编号',
        '姓名', 
        '部门',
        '主要从事项目',
        '检测项目',
        '备注',
        '照片'
      ];
      
      for (const columnName of expectedColumns) {
        await expect(page.locator(`th:has-text("${columnName}")`)).toBeVisible();
      }
    });

    test('添加新行功能', async ({ page }) => {
      // 获取初始行数
      const initialRowCount = await listPage.getTableRowCount();
      
      // 添加新行
      await listPage.addTableRow();
      
      // 检查行数增加
      const newRowCount = await listPage.getTableRowCount();
      expect(newRowCount).toBe(initialRowCount + 1);
    });

    test('编辑表格单元格', async ({ page }) => {
      // 确保至少有一行数据
      const rowCount = await listPage.getTableRowCount();
      if (rowCount === 0) {
        await listPage.addTableRow();
      }
      
      // 编辑第一行的姓名字段（假设姓名是第二列）
      await listPage.editTableCell(0, 1, '张三');
      
      // 验证编辑结果
      const rowData = await listPage.getRowData(0);
      expect(rowData[1]).toContain('张三');
    });

    test('删除表格行', async ({ page }) => {
      // 添加一行用于测试删除
      await listPage.addTableRow();
      const initialRowCount = await listPage.getTableRowCount();
      
      // 删除最后一行
      await listPage.deleteTableRow(initialRowCount - 1);
      
      // 检查行数减少
      const newRowCount = await listPage.getTableRowCount();
      expect(newRowCount).toBe(initialRowCount - 1);
    });

    test('表单提交功能', async ({ page }) => {
      // 模拟API响应
      await page.route('**/api/personnel/list', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, message: '提交成功' })
        });
      });
      
      // 填写一些数据
      await listPage.editTableCell(0, 0, 'CERT001');
      await listPage.editTableCell(0, 1, '张三');
      await listPage.editTableCell(0, 2, '技术部');
      
      // 提交表单
      await listPage.submitForm();
      
      // 检查成功消息
      const successMessage = await listPage.getSuccessMessage();
      expect(successMessage).toContain('成功');
    });

    test('表单保存功能', async ({ page }) => {
      // 模拟API响应
      await page.route('**/api/personnel/list/save', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, message: '保存成功' })
        });
      });
      
      // 填写一些数据
      await listPage.editTableCell(0, 0, 'CERT002');
      await listPage.editTableCell(0, 1, '李四');
      
      // 保存表单
      await listPage.saveForm();
      
      // 检查成功消息
      const successMessage = await listPage.getSuccessMessage();
      expect(successMessage).toContain('保存');
    });

    test('批量导入功能', async ({ page }) => {
      // 模拟文件上传
      await page.route('**/api/personnel/import', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ 
            success: true, 
            message: '导入成功',
            imported: 5
          })
        });
      });
      
      // 创建测试文件内容
      const csvContent = `上岗证编号,姓名,部门
CERT001,张三,技术部
CERT002,李四,质量部`;
      
      // 点击批量导入按钮
      await listPage.batchImportButton.click();
      
      // 等待上传模态框出现
      await expect(page.locator('.ant-modal')).toBeVisible();
      
      // 模拟文件上传（实际测试中可能需要创建临时文件）
      await page.evaluate((content) => {
        const file = new File([content], 'test.csv', { type: 'text/csv' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          input.files = dataTransfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, csvContent);
      
      // 确认导入
      await page.locator('.ant-modal .ant-btn-primary').click();
      
      // 检查导入结果
      await expect(page.locator('.ant-message-success')).toBeVisible();
    });

    test('表格数据验证', async ({ page }) => {
      // 添加新行
      await listPage.addTableRow();
      
      // 尝试提交空数据
      await listPage.submitForm();
      
      // 检查验证错误
      const errorElements = page.locator('.ant-form-item-explain-error');
      const errorCount = await errorElements.count();
      expect(errorCount).toBeGreaterThan(0);
    });
  });

  test.describe('分包样品清单页面测试', () => {
    test.beforeEach(async ({ page }) => {
      await listPage.goto('/project/subcontract-sample-list');
      await helpers.waitForPageLoad();
    });

    test('页面基本元素显示正确', async ({ page }) => {
      // 检查页面标题
      await expect(page).toHaveTitle(/分包样品清单/);
      
      // 检查主表单字段
      const expectedFields = [
        '项目编号',
        '项目名称',
        '送样单位',
        '接样单位',
        '送样人',
        '接样人'
      ];
      
      for (const fieldName of expectedFields) {
        await expect(page.locator(`label:has-text("${fieldName}")`)).toBeVisible();
      }
      
      // 检查样品明细表格
      await expect(listPage.editableTable).toBeVisible();
    });

    test('主表单字段填写', async ({ page }) => {
      // 填写项目信息
      await page.locator('input[id*="projectNumber"]').fill('PRJ001');
      await page.locator('input[id*="projectName"]').fill('测试项目');
      await page.locator('input[id*="sampleSubmitUnit"]').fill('测试公司');
      await page.locator('input[id*="sampleReceiveUnit"]').fill('检测机构');
      
      // 检查填写结果
      await expect(page.locator('input[id*="projectNumber"]')).toHaveValue('PRJ001');
      await expect(page.locator('input[id*="projectName"]')).toHaveValue('测试项目');
    });

    test('样品明细表格操作', async ({ page }) => {
      // 添加样品明细行
      await listPage.addTableRow();
      
      // 填写样品信息
      await listPage.editTableCell(0, 1, '混凝土');
      await listPage.editTableCell(0, 2, 'S001');
      await listPage.editTableCell(0, 3, 'B001');
      
      // 验证填写结果
      const rowData = await listPage.getRowData(0);
      expect(rowData[1]).toContain('混凝土');
      expect(rowData[2]).toContain('S001');
    });

    test('表单完整提交流程', async ({ page }) => {
      // 模拟API响应
      await page.route('**/api/project/subcontract-sample-list', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, message: '提交成功' })
        });
      });
      
      // 填写主表单
      await page.locator('input[id*="projectNumber"]').fill('PRJ002');
      await page.locator('input[id*="projectName"]').fill('完整测试项目');
      await page.locator('input[id*="sampleSubmitUnit"]').fill('提交单位');
      await page.locator('input[id*="sampleReceiveUnit"]').fill('接收单位');
      
      // 填写样品明细
      await listPage.editTableCell(0, 1, '钢筋');
      await listPage.editTableCell(0, 2, 'S002');
      
      // 提交表单
      await listPage.submitForm();
      
      // 检查提交结果
      const successMessage = await listPage.getSuccessMessage();
      expect(successMessage).toContain('成功');
    });
  });

  test.describe('文件受控清单页面测试', () => {
    test.beforeEach(async ({ page }) => {
      await listPage.goto('/quality/doc-controlled-list');
      await helpers.waitForPageLoad();
    });

    test('页面基本元素显示正确', async ({ page }) => {
      // 检查页面标题
      await expect(page).toHaveTitle(/文件受控清单/);
      
      // 检查表单字段
      const expectedFields = [
        '文件编号',
        '文件名称',
        '文件类型',
        '版本号',
        '发布日期',
        '生效日期'
      ];
      
      for (const fieldName of expectedFields) {
        await expect(page.locator(`label:has-text("${fieldName}")`)).toBeVisible();
      }
    });

    test('文件类型选择功能', async ({ page }) => {
      // 点击文件类型下拉框
      await page.locator('.ant-select[id*="docType"]').click();
      
      // 检查选项
      const expectedOptions = ['手册', '程序文件', '作业指导书', '记录表格', '外来文件'];
      for (const option of expectedOptions) {
        await expect(page.locator(`.ant-select-item:has-text("${option}")`)).toBeVisible();
      }
      
      // 选择一个选项
      await page.locator('.ant-select-item:has-text("程序文件")').click();
      
      // 验证选择结果
      await expect(page.locator('.ant-select[id*="docType"] .ant-select-selection-item')).toHaveText('程序文件');
    });

    test('日期字段功能', async ({ page }) => {
      // 点击发布日期字段
      await page.locator('.ant-picker[id*="issueDate"]').click();
      
      // 检查日期选择器显示
      await expect(page.locator('.ant-picker-dropdown')).toBeVisible();
      
      // 选择今天
      await page.locator('.ant-picker-cell-today').click();
      
      // 验证日期已选择
      const dateValue = await page.locator('.ant-picker[id*="issueDate"] input').inputValue();
      expect(dateValue).toBeTruthy();
    });

    test('表单验证功能', async ({ page }) => {
      // 尝试提交空表单
      await listPage.submitButton.click();
      
      // 检查必填字段验证
      const errorElements = page.locator('.ant-form-item-explain-error');
      const errorCount = await errorElements.count();
      expect(errorCount).toBeGreaterThan(0);
      
      // 检查具体错误信息
      await expect(page.locator('.ant-form-item-explain-error')).toContainText(['请输入', '请选择']);
    });
  });

  test.describe('通用列表功能测试', () => {
    test.beforeEach(async ({ page }) => {
      // 使用人员列表作为测试页面
      await listPage.goto('/personnel/list');
      await helpers.waitForPageLoad();
    });

    test('页面加载性能', async ({ page }) => {
      const startTime = Date.now();
      
      await listPage.goto('/personnel/list');
      await helpers.waitForPageLoad();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // 页面应在5秒内加载完成
    });

    test('表格响应式布局', async ({ page }) => {
      // 测试移动端
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(listPage.table).toBeVisible();
      
      // 测试平板端
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(listPage.table).toBeVisible();
      
      // 测试桌面端
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(listPage.table).toBeVisible();
    });

    test('键盘导航支持', async ({ page }) => {
      // 使用Tab键导航到表格
      await page.keyboard.press('Tab');
      
      // 检查焦点是否在可交互元素上
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // 使用方向键在表格中导航
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowRight');
      
      // 使用Enter键激活编辑
      await page.keyboard.press('Enter');
    });

    test('表格可访问性', async ({ page }) => {
      // 检查表格ARIA属性
      await expect(listPage.table).toHaveAttribute('role', 'table');
      
      // 检查表头ARIA属性
      const headers = page.locator('th');
      const headerCount = await headers.count();
      
      for (let i = 0; i < headerCount; i++) {
        await expect(headers.nth(i)).toHaveAttribute('role', 'columnheader');
      }
      
      // 检查表格行ARIA属性
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        await expect(rows.first()).toHaveAttribute('role', 'row');
      }
    });

    test('错误处理', async ({ page }) => {
      // 模拟网络错误
      await page.route('**/api/**', route => {
        route.abort('failed');
      });
      
      // 尝试提交表单
      await listPage.submitForm();
      
      // 检查错误处理
      const errorMessage = await listPage.getErrorMessage();
      expect(errorMessage).toBeTruthy();
    });

    test('加载状态显示', async ({ page }) => {
      // 模拟慢速网络
      await page.route('**/api/**', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ success: true })
          });
        }, 2000);
      });
      
      // 触发加载
      await listPage.submitForm();
      
      // 检查加载状态
      await expect(listPage.loading).toBeVisible();
      
      // 等待加载完成
      await listPage.waitForLoadingComplete();
      await expect(listPage.loading).not.toBeVisible();
    });

    test('数据持久化', async ({ page }) => {
      // 填写数据
      await listPage.editTableCell(0, 0, 'PERSIST001');
      await listPage.editTableCell(0, 1, '持久化测试');
      
      // 保存数据
      await listPage.saveForm();
      
      // 刷新页面
      await page.reload();
      await helpers.waitForPageLoad();
      
      // 检查数据是否保持（这里需要根据实际实现调整）
      // 实际项目中可能需要模拟API返回保存的数据
    });

    test('并发操作处理', async ({ page }) => {
      // 模拟并发提交
      const submitPromises = [
        listPage.submitForm(),
        listPage.saveForm()
      ];
      
      // 等待所有操作完成
      await Promise.allSettled(submitPromises);
      
      // 检查页面状态正常
      await expect(listPage.table).toBeVisible();
    });
  });

  test.describe('多浏览器兼容性测试', () => {
    test('Chrome浏览器兼容性', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', '仅在Chrome中运行');
      
      await listPage.goto('/personnel/list');
      await helpers.waitForPageLoad();
      
      // 测试基本功能
      await expect(listPage.table).toBeVisible();
      await listPage.addTableRow();
      await listPage.editTableCell(0, 1, 'Chrome测试');
    });

    test('Firefox浏览器兼容性', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', '仅在Firefox中运行');
      
      await listPage.goto('/personnel/list');
      await helpers.waitForPageLoad();
      
      // 测试基本功能
      await expect(listPage.table).toBeVisible();
      await listPage.addTableRow();
      await listPage.editTableCell(0, 1, 'Firefox测试');
    });

    test('Safari浏览器兼容性', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', '仅在Safari中运行');
      
      await listPage.goto('/personnel/list');
      await helpers.waitForPageLoad();
      
      // 测试基本功能
      await expect(listPage.table).toBeVisible();
      await listPage.addTableRow();
      await listPage.editTableCell(0, 1, 'Safari测试');
    });
  });
});