/**
 * 样品检定记录与核查表页面
 */

import React from 'react';
import { Form, Input, Radio, Select } from 'antd';
import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';
import { EditableTable } from '@/components/common';
import { useTableData } from '@/hooks';
import type { IEditableRow, IEditableTableConfig } from '@/types/form';
import { FieldType } from '@/types/form';

type VerificationRow = IEditableRow & {
  item: string;
  quantity: number;
  position: string;
  standard: string;
  criteria: string;
  result: string;
  measure: string;
  remark: string;
};

export default function SampleVerificationPage() {
  const fields: FieldConfig[] = [
    { name: 'objectName', label: '检测对象', type: 'text', required: true, span: 8 },
    { name: 'sampleCode', label: '样品编号', type: 'text', required: true, span: 8 },
    { name: 'verifyDate', label: '时间', type: 'date', required: true, span: 8 },
    { name: 'method', label: '检定方法', type: 'text', required: true, span: 8 },
    { name: 'basis', label: '检定依据', type: 'text', required: true, span: 8 },
    { name: 'reference', label: '参考试验', type: 'select', span: 8, options: [
      { label: '国家标准', value: 'gb' },
      { label: '行业标准', value: 'jg' },
      { label: '企业标准', value: 'qyb' },
    ] },
    { name: 'location', label: '检定地点', type: 'text', span: 8 },
    { name: 'leader', label: '领队人', type: 'text', span: 8 },
    { name: 'leaderPhone', label: '领队电话', type: 'text', span: 8 },
  ];

  // 表格数据管理
  const {
    dataSource,
    setDataSource,
    createDefaultRow,
  } = useTableData<VerificationRow>({
    createDefaultRow: () => ({
      key: `${Date.now()}`,
      item: '',
      quantity: 0,
      position: '',
      standard: '',
      criteria: '',
      result: '',
      measure: '',
      remark: '',
    }),
    initialData: [
      {
        key: '1',
        item: '',
        quantity: 0,
        position: '',
        standard: '',
        criteria: '',
        result: '',
        measure: '',
        remark: '',
      },
    ],
  });

  const tableConfig: IEditableTableConfig<VerificationRow> = {
    columns: [
      { title: '项目', dataIndex: 'item', key: 'item', width: 160, editable: true },
      { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 100, editable: true, inputType: FieldType.Number },
      { title: '检测部位/位置', dataIndex: 'position', key: 'position', width: 160, editable: true },
      { title: '检测依据', dataIndex: 'standard', key: 'standard', width: 160, editable: true },
      { title: '准则', dataIndex: 'criteria', key: 'criteria', width: 160, editable: true },
      { title: '检测结果', dataIndex: 'result', key: 'result', width: 160, editable: true },
      { title: '整改措施', dataIndex: 'measure', key: 'measure', width: 180, editable: true },
      { title: '备注', dataIndex: 'remark', key: 'remark', width: 160, editable: true },
    ],
    showDragHandle: true,
    showActions: true,
    enableAdd: true,
    enableBatchImport: true,
  };

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={async (values) => {
        // 提交：携带表格数据
        console.log('提交:', { ...values, records: dataSource });
        return true;
      }}
      onSave={async (values) => {
        // 暂存：携带表格数据
        console.log('暂存:', { ...values, records: dataSource });
        return true;
      }}
    >
      {(_form) => (
        <>
          <Form.Item label="本次参与检定人员" name="inspectors">
            <Select mode="multiple" placeholder="请选择" options={[
              { label: '检定人员A', value: 'A' },
              { label: '检定人员B', value: 'B' },
              { label: '检定人员C', value: 'C' },
            ]} />
          </Form.Item>

          <Form.Item label="合格判定方式" name="judgeType">
            <Radio.Group>
              <Radio value="single">单项合格</Radio>
              <Radio value="overall">整体合格</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="检定记录明细">
            <EditableTable
              dataSource={dataSource}
              onChange={setDataSource}
              config={tableConfig}
              createDefaultRow={createDefaultRow}
              showImportButton
              onImport={() => console.log('批量导入')}
              tableProps={{ scroll: { x: 'max-content' } }}
            />
          </Form.Item>

          <Form.Item label="核检内容简述" name="summary">
            <Input.TextArea placeholder="请输入" autoSize={{ minRows: 3, maxRows: 6 }} />
          </Form.Item>
        </>
      )}
    </StandardFormPage>
  );
}