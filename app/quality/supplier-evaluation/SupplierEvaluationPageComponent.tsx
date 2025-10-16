import React from 'react';
import { Form, Space } from 'antd';
import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';
import { EditableTable } from '@/components/common';
import { EvaluationStandardTips } from './components/EvaluationStandardTips';
import { useTableData } from '@/hooks';
import type { IEditableRow, IEditableTableConfig } from '@/types/form';
import { FieldType } from '@/types/form';

// 评价记录数据类型
type EvaluationRecord = IEditableRow & {
  evaluationContent: string;
  evaluation: string;
  standardScore: number;
  inspectionScore: number;
};

export default function SupplierEvaluationPage() {
  // 供应商基本信息字段配置（两列布局）
  const fields: FieldConfig[] = [
    {
      name: 'supplierName',
      label: '供应商名称',
      type: 'text',
      required: true,
      span: 12,
      placeholder: '请输入',
    },
    {
      name: 'phone',
      label: '电话',
      type: 'text',
      required: true,
      span: 12,
      placeholder: '请输入',
    },
    {
      name: 'supplierAddress',
      label: '供应商地址',
      type: 'select',
      required: true,
      span: 12,
      placeholder: '请选择',
      options: [
        { label: '北京市朝阳区', value: 'beijing_chaoyang' },
        { label: '上海市浦东新区', value: 'shanghai_pudong' },
        { label: '广州市天河区', value: 'guangzhou_tianhe' },
        { label: '深圳市南山区', value: 'shenzhen_nanshan' },
        { label: '杭州市西湖区', value: 'hangzhou_xihu' },
      ],
    },
    {
      name: 'fax',
      label: '传真',
      type: 'text',
      span: 12,
      placeholder: '请输入',
    },
    {
      name: 'supplierProductService',
      label: '供应产品服务',
      type: 'text',
      required: true,
      span: 12,
      placeholder: '请输入',
    },
    {
      name: 'evaluationStage',
      label: '评价阶段',
      type: 'text',
      required: true,
      span: 12,
      placeholder: '请输入',
    },
  ];

  // 创建默认行数据的工厂函数
  const createDefaultRow = (): EvaluationRecord => ({
    key: Date.now().toString(),
    evaluationContent: '—',
    evaluation: '',
    standardScore: 0,
    inspectionScore: 0,
  });

  // 使用 useTableData Hook 管理表格数据
  const { dataSource, setDataSource } = useTableData<EvaluationRecord>({
    initialData: [
      {
        key: '1',
        evaluationContent: '—',
        evaluation: '',
        standardScore: 0,
        inspectionScore: 0,
      },
    ],
    createDefaultRow,
  });

  // 评价明细表格配置
  const tableConfig: IEditableTableConfig<EvaluationRecord> = {
    columns: [
      {
        title: '评价内容',
        dataIndex: 'evaluationContent',
        key: 'evaluationContent',
        width: 150,
        editable: true, // 可编辑，显示"—"
      },
      {
        title: '评价',
        dataIndex: 'evaluation',
        key: 'evaluation',
        width: 150,
        editable: true,
        inputType: FieldType.Text,
      },
      {
        title: '标准分',
        dataIndex: 'standardScore',
        key: 'standardScore',
        width: 150,
        editable: true, // 可编辑，显示"—"
      },
      {
        title: '考察分',
        dataIndex: 'inspectionScore',
        key: 'inspectionScore',
        width: 150,
        editable: true,
        inputType: FieldType.Number,
      },
    ],
    showDragHandle: true,
    showActions: true,
    enableAdd: true,
    enableBatchImport: false,
    minRows: 1,
  };

  // 计算总分
  const totalInspectionScore = dataSource.reduce((sum, item) => sum + (item.inspectionScore || 0), 0);
  const totalStandardScore = dataSource.reduce((sum, item) => sum + (item.standardScore || 0), 0);

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (data) => {
        console.log('提交数据:', { 
          ...data, 
          evaluationRecords: dataSource, 
          totalStandardScore, 
          totalInspectionScore 
        });
        // 这里可以添加提交逻辑
        return true;
      }}
      onSave={async (data) => {
        console.log('暂存数据:', { 
          ...data, 
          evaluationRecords: dataSource, 
          totalStandardScore, 
          totalInspectionScore 
        });
        // 这里可以添加暂存逻辑
        return true;
      }}
    >
      {(form) => (
        <>
          <Form.Item 
            label={
              <Space>
                数据记录
                <EvaluationStandardTips />
              </Space>
            }
          >
            <EditableTable
              dataSource={dataSource}
              onChange={setDataSource}
              config={tableConfig}
              createDefaultRow={createDefaultRow}
              showAddButton
              showImportButton={false}
            />
          </Form.Item>
        </>
      )}
    </StandardFormPage>
  );
}