import { Page, Locator } from '@playwright/test';
import { BasePage } from '../utils/test-helpers';

/**
 * 列表页面对象模型
 * 适用于所有包含列表、表格、分页等功能的页面
 */
export class ListPage extends BasePage {
  // 列表页面元素选择器
  private readonly selectors = {
    // 页面容器
    pageContainer: '.ant-pro-page-container, .page-container',
    pageHeader: '.ant-pro-page-container-children-container .ant-pro-page-header, .page-header',
    pageContent: '.ant-pro-page-container-children-content, .page-content',
    
    // 搜索和筛选
    searchForm: '.search-form, .ant-form',
    searchInput: 'input[placeholder*="搜索"], input[placeholder*="查找"], .search-input',
    searchButton: '.search-button, button[type="submit"]',
    resetButton: '.reset-button, button[type="reset"]',
    advancedSearch: '.advanced-search',
    filterDropdown: '.ant-dropdown',
    
    // 表格
    table: '.ant-table, table',
    tableHeader: '.ant-table-thead',
    tableBody: '.ant-table-tbody',
    tableRow: '.ant-table-tbody tr',
    tableCell: 'td',
    tableHeaderCell: 'th',
    
    // 可编辑表格
    editableTable: '.editable-table',
    editableRow: '.editable-row',
    editableCell: '.editable-cell',
    editInput: '.editable-cell input',
    editSelect: '.editable-cell .ant-select',
    editDatePicker: '.editable-cell .ant-picker',
    
    // 表格操作
    addRowButton: '[data-testid="add-row"], .add-row-button',
    deleteRowButton: '[data-testid="delete-row"], .delete-row-button',
    editRowButton: '[data-testid="edit-row"], .edit-row-button',
    saveRowButton: '[data-testid="save-row"], .save-row-button',
    cancelRowButton: '[data-testid="cancel-row"], .cancel-row-button',
    dragHandle: '.drag-handle, .ant-table-row-expand-icon',
    
    // 批量操作
    selectAllCheckbox: '.ant-table-selection-column .ant-checkbox-input',
    rowCheckbox: '.ant-table-selection-column .ant-checkbox-input',
    batchActions: '.batch-actions',
    batchDeleteButton: '.batch-delete-button',
    batchExportButton: '.batch-export-button',
    batchImportButton: '.batch-import-button',
    
    // 分页
    pagination: '.ant-pagination',
    paginationPrev: '.ant-pagination-prev',
    paginationNext: '.ant-pagination-next',
    paginationItem: '.ant-pagination-item',
    paginationJumper: '.ant-pagination-options-quick-jumper input',
    pageSizeSelector: '.ant-pagination-options-size-changer',
    
    // 排序
    sortButton: '.ant-table-column-sorter',
    sortAsc: '.ant-table-column-sorter-up',
    sortDesc: '.ant-table-column-sorter-down',
    
    // 操作按钮
    addButton: '[data-testid="add-button"], .add-button, .ant-btn-primary',
    editButton: '[data-testid="edit-button"], .edit-button',
    deleteButton: '[data-testid="delete-button"], .delete-button',
    viewButton: '[data-testid="view-button"], .view-button',
    exportButton: '[data-testid="export-button"], .export-button',
    importButton: '[data-testid="import-button"], .import-button',
    refreshButton: '[data-testid="refresh-button"], .refresh-button',
    
    // 状态和提示
    loading: '.ant-spin, .loading',
    empty: '.ant-empty',
    errorMessage: '.ant-message-error, .error-message',
    successMessage: '.ant-message-success, .success-message',
    
    // 模态框和抽屉
    modal: '.ant-modal',
    drawer: '.ant-drawer',
    confirmModal: '.ant-modal-confirm',
    
    // 上传
    uploadArea: '.ant-upload-drag, .upload-area',
    uploadButton: '.ant-upload button',
    uploadList: '.ant-upload-list',
    
    // 表单操作
    submitButton: '[data-testid="submit-button"], button[type="submit"]',
    saveButton: '[data-testid="save-button"], .save-button',
    cancelButton: '[data-testid="cancel-button"], .cancel-button',
    resetFormButton: '[data-testid="reset-button"], .reset-button'
  };

  // 页面元素getter
  get pageContainer(): Locator { return this.page.locator(this.selectors.pageContainer); }
  get pageHeader(): Locator { return this.page.locator(this.selectors.pageHeader); }
  get pageContent(): Locator { return this.page.locator(this.selectors.pageContent); }
  
  // 搜索和筛选
  get searchForm(): Locator { return this.page.locator(this.selectors.searchForm); }
  get searchInput(): Locator { return this.page.locator(this.selectors.searchInput); }
  get searchButton(): Locator { return this.page.locator(this.selectors.searchButton); }
  get resetButton(): Locator { return this.page.locator(this.selectors.resetButton); }
  get advancedSearch(): Locator { return this.page.locator(this.selectors.advancedSearch); }
  
  // 表格
  get table(): Locator { return this.page.locator(this.selectors.table); }
  get tableHeader(): Locator { return this.page.locator(this.selectors.tableHeader); }
  get tableBody(): Locator { return this.page.locator(this.selectors.tableBody); }
  get tableRows(): Locator { return this.page.locator(this.selectors.tableRow); }
  
  // 可编辑表格
  get editableTable(): Locator { return this.page.locator(this.selectors.editableTable); }
  get addRowButton(): Locator { return this.page.locator(this.selectors.addRowButton); }
  get batchImportButton(): Locator { return this.page.locator(this.selectors.batchImportButton); }
  
  // 分页
  get pagination(): Locator { return this.page.locator(this.selectors.pagination); }
  get paginationNext(): Locator { return this.page.locator(this.selectors.paginationNext); }
  get paginationPrev(): Locator { return this.page.locator(this.selectors.paginationPrev); }
  
  // 操作按钮
  get addButton(): Locator { return this.page.locator(this.selectors.addButton); }
  get exportButton(): Locator { return this.page.locator(this.selectors.exportButton); }
  get importButton(): Locator { return this.page.locator(this.selectors.importButton); }
  get refreshButton(): Locator { return this.page.locator(this.selectors.refreshButton); }
  
  // 状态
  get loading(): Locator { return this.page.locator(this.selectors.loading); }
  get empty(): Locator { return this.page.locator(this.selectors.empty); }
  
  // 表单操作
  get submitButton(): Locator { return this.page.locator(this.selectors.submitButton); }
  get saveButton(): Locator { return this.page.locator(this.selectors.saveButton); }
  get cancelButton(): Locator { return this.page.locator(this.selectors.cancelButton); }

  /**
   * 搜索功能
   */
  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.waitForTableLoad();
  }

  /**
   * 清空搜索
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.searchButton.click();
    await this.waitForTableLoad();
  }

  /**
   * 重置搜索表单
   */
  async resetSearch(): Promise<void> {
    await this.resetButton.click();
    await this.waitForTableLoad();
  }

  /**
   * 等待表格加载完成
   */
  async waitForTableLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector(this.selectors.table, { state: 'visible' });
  }

  /**
   * 获取表格行数
   */
  async getTableRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  /**
   * 获取指定行的数据
   */
  async getRowData(rowIndex: number): Promise<string[]> {
    const row = this.tableRows.nth(rowIndex);
    const cells = row.locator('td');
    const cellCount = await cells.count();
    const data: string[] = [];
    
    for (let i = 0; i < cellCount; i++) {
      const cellText = await cells.nth(i).textContent();
      data.push(cellText?.trim() || '');
    }
    
    return data;
  }

  /**
   * 点击指定行的操作按钮
   */
  async clickRowAction(rowIndex: number, action: 'edit' | 'delete' | 'view'): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    const actionButton = row.locator(`[data-testid="${action}-button"], .${action}-button`);
    await actionButton.click();
  }

  /**
   * 选择表格行
   */
  async selectRow(rowIndex: number): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    const checkbox = row.locator(this.selectors.rowCheckbox);
    await checkbox.click();
  }

  /**
   * 选择所有行
   */
  async selectAllRows(): Promise<void> {
    await this.page.locator(this.selectors.selectAllCheckbox).click();
  }

  /**
   * 批量删除选中行
   */
  async batchDelete(): Promise<void> {
    await this.page.locator(this.selectors.batchDeleteButton).click();
    await this.confirmAction();
  }

  /**
   * 分页操作
   */
  async goToPage(pageNumber: number): Promise<void> {
    const pageItem = this.page.locator(this.selectors.paginationItem).filter({ hasText: pageNumber.toString() });
    await pageItem.click();
    await this.waitForTableLoad();
  }

  /**
   * 下一页
   */
  async goToNextPage(): Promise<void> {
    await this.paginationNext.click();
    await this.waitForTableLoad();
  }

  /**
   * 上一页
   */
  async goToPrevPage(): Promise<void> {
    await this.paginationPrev.click();
    await this.waitForTableLoad();
  }

  /**
   * 设置每页显示数量
   */
  async setPageSize(size: number): Promise<void> {
    await this.page.locator(this.selectors.pageSizeSelector).click();
    await this.page.locator(`.ant-select-item[title="${size}"]`).click();
    await this.waitForTableLoad();
  }

  /**
   * 跳转到指定页
   */
  async jumpToPage(pageNumber: number): Promise<void> {
    await this.page.locator(this.selectors.paginationJumper).fill(pageNumber.toString());
    await this.page.keyboard.press('Enter');
    await this.waitForTableLoad();
  }

  /**
   * 排序操作
   */
  async sortColumn(columnIndex: number, direction: 'asc' | 'desc'): Promise<void> {
    const header = this.tableHeader.locator('th').nth(columnIndex);
    const sortButton = header.locator(this.selectors.sortButton);
    
    if (direction === 'asc') {
      await sortButton.locator(this.selectors.sortAsc).click();
    } else {
      await sortButton.locator(this.selectors.sortDesc).click();
    }
    
    await this.waitForTableLoad();
  }

  /**
   * 可编辑表格 - 添加行
   */
  async addTableRow(): Promise<void> {
    await this.addRowButton.click();
    await this.page.waitForTimeout(500); // 等待新行渲染
  }

  /**
   * 可编辑表格 - 编辑单元格
   */
  async editTableCell(rowIndex: number, columnIndex: number, value: string): Promise<void> {
    const row = this.page.locator(this.selectors.editableRow).nth(rowIndex);
    const cell = row.locator(this.selectors.editableCell).nth(columnIndex);
    
    // 双击进入编辑模式
    await cell.dblclick();
    
    // 根据输入类型填写值
    const input = cell.locator('input');
    const select = cell.locator('.ant-select');
    
    if (await input.count() > 0) {
      await input.fill(value);
      await this.page.keyboard.press('Enter');
    } else if (await select.count() > 0) {
      await select.click();
      await this.page.locator(`.ant-select-item[title="${value}"]`).click();
    }
  }

  /**
   * 可编辑表格 - 删除行
   */
  async deleteTableRow(rowIndex: number): Promise<void> {
    const row = this.page.locator(this.selectors.editableRow).nth(rowIndex);
    const deleteButton = row.locator(this.selectors.deleteRowButton);
    await deleteButton.click();
    await this.confirmAction();
  }

  /**
   * 可编辑表格 - 拖拽排序
   */
  async dragRowToPosition(fromIndex: number, toIndex: number): Promise<void> {
    const fromRow = this.page.locator(this.selectors.editableRow).nth(fromIndex);
    const toRow = this.page.locator(this.selectors.editableRow).nth(toIndex);
    
    const fromHandle = fromRow.locator(this.selectors.dragHandle);
    const toHandle = toRow.locator(this.selectors.dragHandle);
    
    await fromHandle.dragTo(toHandle);
    await this.page.waitForTimeout(500); // 等待拖拽完成
  }

  /**
   * 批量导入
   */
  async batchImport(filePath: string): Promise<void> {
    await this.batchImportButton.click();
    
    // 等待上传组件出现
    await this.page.waitForSelector(this.selectors.uploadArea);
    
    // 上传文件
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    
    // 确认导入
    await this.page.locator('.ant-modal .ant-btn-primary').click();
    await this.waitForTableLoad();
  }

  /**
   * 导出数据
   */
  async exportData(): Promise<void> {
    await this.exportButton.click();
    
    // 等待下载开始
    const downloadPromise = this.page.waitForEvent('download');
    await downloadPromise;
  }

  /**
   * 刷新列表
   */
  async refreshList(): Promise<void> {
    await this.refreshButton.click();
    await this.waitForTableLoad();
  }

  /**
   * 确认操作（用于删除等需要确认的操作）
   */
  async confirmAction(): Promise<void> {
    await this.page.locator(this.selectors.confirmModal + ' .ant-btn-primary').click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 取消操作
   */
  async cancelAction(): Promise<void> {
    await this.page.locator(this.selectors.confirmModal + ' .ant-btn-default').click();
  }

  /**
   * 检查表格是否为空
   */
  async isTableEmpty(): Promise<boolean> {
    return await this.empty.isVisible();
  }

  /**
   * 检查加载状态
   */
  async isLoading(): Promise<boolean> {
    return await this.loading.isVisible();
  }

  /**
   * 等待加载完成
   */
  async waitForLoadingComplete(): Promise<void> {
    await this.page.waitForSelector(this.selectors.loading, { state: 'hidden' });
  }

  /**
   * 检查错误消息
   */
  async getErrorMessage(): Promise<string | null> {
    const errorElement = this.page.locator(this.selectors.errorMessage);
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }

  /**
   * 检查成功消息
   */
  async getSuccessMessage(): Promise<string | null> {
    const successElement = this.page.locator(this.selectors.successMessage);
    if (await successElement.isVisible()) {
      return await successElement.textContent();
    }
    return null;
  }

  /**
   * 提交表单（用于可编辑表格页面）
   */
  async submitForm(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 保存表单（用于可编辑表格页面）
   */
  async saveForm(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 取消表单操作
   */
  async cancelForm(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * 高级搜索
   */
  async openAdvancedSearch(): Promise<void> {
    await this.advancedSearch.click();
  }

  /**
   * 设置筛选条件
   */
  async setFilter(fieldName: string, value: string): Promise<void> {
    const filterField = this.page.locator(`[data-testid="filter-${fieldName}"], .filter-${fieldName}`);
    await filterField.fill(value);
  }

  /**
   * 应用筛选
   */
  async applyFilter(): Promise<void> {
    await this.searchButton.click();
    await this.waitForTableLoad();
  }

  /**
   * 清除筛选
   */
  async clearFilter(): Promise<void> {
    await this.resetButton.click();
    await this.waitForTableLoad();
  }
}