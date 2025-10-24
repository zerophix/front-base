import React from 'react';
import { Form, message } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { FieldGroup } from '@/components/common/FieldGroup';
import { EditableTable } from '@/components/common/EditableTable';
import { FieldConfig } from '@/components/common/FieldGroup';
import { FormActions } from '@/components/common';
import { IEditableRow, IEditableTableConfig, FieldType } from '@/types/form';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useRouteMeta } from '@/hooks';
import { SIZES, SPACING } from '@/utils/constants/dimensions';

interface SampleDetail {
  key: string;
  serialNumber: number;
  sampleType: string;
  sampleNumber: string;
  batchNumber: string;
  layer: string;
}

export default function SubcontractSampleListPage() {
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState<SampleDetail[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  useRouteMeta();

  // 初始化表格数据和表单值
  React.useEffect(() => {
    if (tableData.length === 0) {
      setTableData([createDefaultRow()]);
    }
  }, [form]);

  // 主表单字段配置
  const fields: FieldConfig[] = [
    { name: 'projectNumber', label: '项目编号', type: 'text', required: true, span: 12 },
    { name: 'projectName', label: '项目名称', type: 'text', required: true, span: 12 },
    { name: 'sampleSubmitUnit', label: '送样单位', type: 'text', required: true, span: 12 },
    { name: 'sampleReceiveUnit', label: '接样单位', type: 'text', required: true, span: 12 },
    { name: 'sampleSubmitter', label: '送样人', type: 'text', required: true, span: 12 },
    { name: 'sampleReceiver', label: '接样人', type: 'text', required: true, span: 12 },
    { name: 'submitterPhone', label: '送样人电话', type: 'text', required: true, span: 12 },
    { name: 'receiverPhone', label: '接样人电话', type: 'text', required: true, span: 12 },
    { name: 'submitDate', label: '送样日期', type: 'date', required: true, span: 12 },
    { name: 'subcontractDate', label: '分包日期', type: 'date', required: true, span: 12 },
    { 
      name: 'sampleType', 
      label: '送样类型', 
      type: 'select', 
      required: true, 
      span: 12,
      options: [
        { label: '水质样品', value: 'water' },
        { label: '土壤样品', value: 'soil' },
        { label: '空气样品', value: 'air' },
        { label: '其他', value: 'other' }
      ]
    },
    { name: 'sampleQuantity', label: '样品数量', type: 'number', required: true, span: 12 },
    { 
      name: 'testParameters', 
      label: '检测参数', 
      type: 'select', 
      required: true, 
      span: 12,
      options: [
        { label: '浊度', value: 'turbidity' },
        { label: 'pH值', value: 'ph' },
        { label: '溶解氧', value: 'dissolved_oxygen' },
        { label: '化学需氧量', value: 'cod' },
        { label: '氨氮', value: 'ammonia_nitrogen' }
      ]
    },
    { name: 'sampleCondition', label: '样品性状及保存', type: 'textarea', required: true, span: 12 },
    { name: 'testMethod', label: '检测方法', type: 'textarea', span: 24 },
  ];

  // 样品信息表格配置
  const tableConfig: IEditableTableConfig<SampleDetail> = {
    columns: [
      {
        title: '序号',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        width: 80,
        editable: false,
        render: (_: any, __: any, index: number) => (
          <span style={{ 
            display: 'inline-block', 
            width: `${SIZES.iconWidth}px`, 
            height: `${SIZES.iconHeight}px`, 
            lineHeight: `${SIZES.iconHeight}px`, 
            textAlign: 'center', 
            background: 'var(--color-bg-muted)', 
            borderRadius: '50%', 
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--color-text-secondary)'
          }}>
            {index + 1}
          </span>
        ),
      },
      {
        title: '样品类型',
        dataIndex: 'sampleType',
        key: 'sampleType',
        width: 140,
        editable: true,
        inputType: FieldType.Select,
        options: [
          { label: '水质样品', value: 'water' },
          { label: '土壤样品', value: 'soil' },
          { label: '空气样品', value: 'air' },
          { label: '其他', value: 'other' }
        ],
      },
      {
        title: '样品编号',
        dataIndex: 'sampleNumber',
        key: 'sampleNumber',
        width: 180,
        editable: true,
      },
      {
        title: '批号',
        dataIndex: 'batchNumber',
        key: 'batchNumber',
        width: 120,
        editable: true,
      },
      {
        title: '层次',
        dataIndex: 'layer',
        key: 'layer',
        width: 120,
        editable: true,
        inputType: FieldType.Select,
        options: [
          { label: '表层', value: 'surface' },
          { label: '中层', value: 'middle' },
          { label: '底层', value: 'bottom' },
          { label: '混合', value: 'mixed' }
        ],
      },
    ],
    showActions: true,
    enableAdd: true,
    enableDelete: true,
  };

  const createDefaultRow = (): SampleDetail => ({
    key: Date.now().toString(),
    serialNumber: tableData.length + 1,
    sampleType: '',
    sampleNumber: '',
    batchNumber: '',
    layer: '',
  });

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      const formData = {
        ...values,
        sampleDetails: tableData,
        submitDate: values.submitDate?.format('YYYY-MM-DD'),
        subcontractDate: values.subcontractDate?.format('YYYY-MM-DD'),
      };
      
      console.log('提交分包送样清单:', formData);
      message.success('分包送样清单提交成功！');
      return true;
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败，请重试');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      const formData = {
        ...values,
        sampleDetails: tableData,
        submitDate: values.submitDate?.format('YYYY-MM-DD'),
        subcontractDate: values.subcontractDate?.format('YYYY-MM-DD'),
      };
      
      console.log('暂存分包送样清单:', formData);
      message.success('分包送样清单暂存成功！');
      return true;
    } catch (error) {
      console.error('暂存失败:', error);
      message.error('暂存失败，请重试');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseFormPage 
      form={form}
      onFinish={handleSubmit}
      initialValues={{
        recordNumber: `SZDI-SY-JL-14-05-${dayjs().format('YYYY')}`,
        submitDate: dayjs(),
        subcontractDate: dayjs(),
        testMethod: 'GB/T 5750.4-2007 饮用水常规指标第4部分 浊度分析'
      }}
    >
      <FieldGroup fields={fields} />
      
      <Form.Item 
        label="样品信息"
        style={{ marginBottom: `${SPACING.xl}px` }}
      >
        <div style={{ 
          background: 'var(--color-bg)', 
          borderRadius: '8px', 
          padding: '4px',
          border: '1px solid var(--color-border)'
        }}>
          <EditableTable
            dataSource={tableData}
            config={tableConfig}
            onChange={(data) => setTableData(data as SampleDetail[])}
            createDefaultRow={createDefaultRow}
            showImportButton={true}
            onImport={() => {
              // 批量导入功能的占位符
              message.info('批量导入功能开发中...');
            }}
          />
        </div>
      </Form.Item>

      <FormActions
        showSubmit
        submitLoading={submitting}
        showSave
        saveLoading={saving}
        onSave={handleSave}
      />
    </BaseFormPage>
  );
}