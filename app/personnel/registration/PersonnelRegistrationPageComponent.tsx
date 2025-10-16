/**
 * 人员基本情况登记表页面
 */

import React from 'react';
import { Form, Input, Select, DatePicker, Row, Col } from 'antd';
import { BaseFormPage } from '@/components/templates/BaseFormPage';
import { EditableTable, FormActions } from '@/components/common';
import { useTableData, useFormSubmit, useRouteMeta } from '@/hooks';
import type { IPersonnelRegistration, IEducationHistory, ITitleHistory, ISkillCertificate } from '@/types/personnel';
import type { IEditableTableConfig } from '@/types/form';

type EducationRow = IEducationHistory & { key: string };
type TitleRow = ITitleHistory & { key: string };
type SkillRow = ISkillCertificate & { key: string };

export default function PersonnelRegistrationPage() {
  const [form] = Form.useForm();

  // 从路由派生页面元信息并写入全局（单一数据源）
  useRouteMeta();

  // 教育经历表格
  const educationTable = useTableData<EducationRow>({
    createDefaultRow: () => ({
      key: `edu_${Date.now()}`,
      date: '',
      school: '',
      major: '',
    }),
    initialData: [{ key: '1', date: '', school: '', major: '' }],
  });

  // 职称经历表格
  const titleTable = useTableData<TitleRow>({
    createDefaultRow: () => ({
      key: `title_${Date.now()}`,
      date: '',
      title: '',
    }),
    initialData: [{ key: '1', date: '', title: '' }],
  });

  // 技能证书表格
  const skillTable = useTableData<SkillRow>({
    createDefaultRow: () => ({
      key: `skill_${Date.now()}`,
      date: '',
      certificate: '',
    }),
    initialData: [{ key: '1', date: '', certificate: '' }],
  });

  // 表单提交
  const { submitting, saving, handleSubmit, handleSave } = useFormSubmit({
    form,
    onSubmit: async (values) => {
      const data: Partial<IPersonnelRegistration> = {
        ...values,
        educationHistory: educationTable.dataSource,
        titleHistory: titleTable.dataSource,
        skillCertificates: skillTable.dataSource,
      };
      console.log('提交:', data);
      return true;
    },
    onSave: async (values) => {
      console.log('暂存:', values);
      return true;
    },
  });

  // 教育经历表格配置
  const educationConfig: IEditableTableConfig<EducationRow> = {
    columns: [
      {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        render: (_: string, _record: EducationRow, index: number) => (
          <DatePicker
            style={{ width: '100%' }}
            onChange={(_, dateString) => {
              const newData = [...educationTable.dataSource];
              newData[index].date = dateString as string;
              educationTable.setDataSource(newData);
            }}
          />
        ),
      },
      {
        title: '学校',
        dataIndex: 'school',
        key: 'school',
        render: (_: string, record: EducationRow, index: number) => (
          <Input
            placeholder="请输入"
            value={record.school}
            onChange={(e) => {
              const newData = [...educationTable.dataSource];
              newData[index].school = e.target.value;
              educationTable.setDataSource(newData);
            }}
          />
        ),
      },
      {
        title: '专业',
        dataIndex: 'major',
        key: 'major',
        render: (_: string, record: EducationRow, index: number) => (
          <Input
            placeholder="请输入"
            value={record.major}
            onChange={(e) => {
              const newData = [...educationTable.dataSource];
              newData[index].major = e.target.value;
              educationTable.setDataSource(newData);
            }}
          />
        ),
      },
    ],
    showDragHandle: true,
    showActions: true,
  };

  // 职称表格配置
  const titleConfig: IEditableTableConfig<TitleRow> = {
    columns: [
      {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        render: (_: string, _record: TitleRow, index: number) => (
          <DatePicker
            style={{ width: '100%' }}
            onChange={(_, dateString) => {
              const newData = [...titleTable.dataSource];
              newData[index].date = dateString as string;
              titleTable.setDataSource(newData);
            }}
          />
        ),
      },
      {
        title: '职位名称',
        dataIndex: 'title',
        key: 'title',
        render: (_: string, record: TitleRow, index: number) => (
          <Input
            placeholder="请输入"
            value={record.title}
            onChange={(e) => {
              const newData = [...titleTable.dataSource];
              newData[index].title = e.target.value;
              titleTable.setDataSource(newData);
            }}
          />
        ),
      },
    ],
    showDragHandle: true,
    showActions: true,
  };

  // 技能证书表格配置
  const skillConfig: IEditableTableConfig<SkillRow> = {
    columns: [
      {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        render: (_: string, _record: SkillRow, index: number) => (
          <DatePicker
            style={{ width: '100%' }}
            onChange={(_, dateString) => {
              const newData = [...skillTable.dataSource];
              newData[index].date = dateString as string;
              skillTable.setDataSource(newData);
            }}
          />
        ),
      },
      {
        title: '获得方法类型证书',
        dataIndex: 'certificate',
        key: 'certificate',
        render: (_: string, record: SkillRow, index: number) => (
          <Input
            placeholder="请输入"
            value={record.certificate}
            onChange={(e) => {
              const newData = [...skillTable.dataSource];
              newData[index].certificate = e.target.value;
              skillTable.setDataSource(newData);
            }}
          />
        ),
      },
    ],
    showDragHandle: true,
    showActions: true,
  };

  return (
    <BaseFormPage form={form} onFinish={handleSubmit}>
      <Row gutter={24}>
        <Col span={8}>
          <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="性别" name="gender" rules={[{ required: true }]}>
            <Select
              placeholder="请选择"
              options={[
                { value: 'male', label: '男' },
                { value: 'female', label: '女' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="出生年月" name="birthDate" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={8}>
          <Form.Item label="籍贯" name="hometown">
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="民族" name="ethnicity">
            <Select placeholder="请选择" options={[{ value: 'han', label: '汉族' }]} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="受教育程度" name="education">
            <Select
              placeholder="请选择"
              options={[
                { value: 'bachelor', label: '本科' },
                { value: 'master', label: '硕士' },
                { value: 'doctor', label: '博士' },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="身份证号" name="idNumber" rules={[{ required: true }]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="参加工作时间" name="workStartDate" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="政治面貌" name="politicalStatus">
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="电子邮箱" name="email" rules={[{ type: 'email' }]}>
            <Input placeholder="请输入" type="email" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="文化程度">
        <EditableTable
          dataSource={educationTable.dataSource}
          onChange={educationTable.setDataSource}
          config={educationConfig}
          createDefaultRow={educationTable.createDefaultRow}
        />
      </Form.Item>

      <Form.Item label="职称">
        <EditableTable
          dataSource={titleTable.dataSource}
          onChange={titleTable.setDataSource}
          config={titleConfig}
          createDefaultRow={titleTable.createDefaultRow}
        />
      </Form.Item>

      <Form.Item label="技术职称">
        <EditableTable
          dataSource={skillTable.dataSource}
          onChange={skillTable.setDataSource}
          config={skillConfig}
          createDefaultRow={skillTable.createDefaultRow}
        />
      </Form.Item>

      <Form.Item label="工作经历" name="workHistory">
        <Input.TextArea placeholder="请输入" autoSize={{ minRows: 3, maxRows: 6 }} />
      </Form.Item>

      <Form.Item label="组织（聘雇）培训证据/原始记录" name="trainingRecord">
        <Input.TextArea placeholder="请输入" autoSize={{ minRows: 2, maxRows: 4 }} />
      </Form.Item>

      <Form.Item label="备注" name="remark">
        <Input.TextArea placeholder="请输入" autoSize={{ minRows: 2, maxRows: 4 }} />
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
