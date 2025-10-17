import { StandardFormPage } from '@/components/templates/StandardFormPage';
import { FieldConfig } from '@/components/common/FieldGroup';
import { message } from 'antd';
import dayjs from 'dayjs';

export default function SubcontractApplicationPage() {
  const fields: FieldConfig[] = [
    {
      name: 'applicationNumber',
      label: '申请编号',
      type: 'text',
      span: 8,
      required: true,
      placeholder: '请输入申请编号',
      rules: [
        { required: true, message: '请输入申请编号' },
        { min: 3, message: '申请编号至少3个字符' }
      ]
    },
    {
      name: 'applicationDate',
      label: '申请日期',
      type: 'date',
      span: 8,
      required: true,
      placeholder: '请选择申请日期'
    },
    {
      name: 'applicant',
      label: '申请人',
      type: 'text',
      span: 8,
      required: true,
      placeholder: '请输入申请人姓名',
      rules: [
        { required: true, message: '请输入申请人姓名' }
      ]
    },
    {
      name: 'projectName',
      label: '项目名称',
      type: 'text',
      span: 12,
      required: true,
      placeholder: '请输入项目名称',
      rules: [
        { required: true, message: '请输入项目名称' }
      ]
    },
    {
      name: 'client',
      label: '委托方',
      type: 'text',
      span: 12,
      required: true,
      placeholder: '请输入委托方名称',
      rules: [
        { required: true, message: '请输入委托方名称' }
      ]
    },
    {
      name: 'subcontractProject',
      label: '分包项目',
      type: 'text',
      span: 24,
      required: true,
      placeholder: '请输入分包项目详细描述',
      rules: [
        { required: true, message: '请输入分包项目' }
      ]
    },
    {
      name: 'subcontractorName',
      label: '分包单位名称',
      type: 'text',
      span: 12,
      required: true,
      placeholder: '请输入分包单位名称',
      rules: [
        { required: true, message: '请输入分包单位名称' }
      ]
    },
    {
      name: 'subcontractorContact',
      label: '分包单位联系人',
      type: 'text',
      span: 6,
      required: true,
      placeholder: '请输入联系人姓名',
      rules: [
        { required: true, message: '请输入联系人姓名' }
      ]
    },
    {
      name: 'subcontractorPhone',
      label: '分包单位联系方式',
      type: 'text',
      span: 6,
      required: true,
      placeholder: '请输入联系电话',
      rules: [
        { required: true, message: '请输入联系方式' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
      ]
    },
    {
      name: 'subcontractReason',
      label: '分包原因',
      type: 'textarea',
      span: 24,
      required: true,
      placeholder: '请详细说明分包原因',
      rows: 4,
      rules: [
        { required: true, message: '请输入分包原因' },
        { min: 10, message: '分包原因至少10个字符' }
      ]
    },
    {
      name: 'remarks',
      label: '备注',
      type: 'textarea',
      span: 24,
      placeholder: '请输入备注信息（选填）',
      rows: 3
    }
  ];

  const handleSubmit = async (values: any) => {
    try {
      // 数据验证
      if (!values.applicationNumber || !values.projectName || !values.subcontractorName) {
        message.error('请填写所有必填字段');
        return;
      }

      // 模拟API调用
      console.log('提交分包申请表数据:', values);
      
      // 这里应该调用实际的API
      // await submitSubcontractApplication(values);
      
      message.success('分包申请表提交成功！');
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败，请重试');
    }
  };

  const handleSave = async (values: any) => {
    try {
      console.log('保存分包申请表数据:', values);
      
      // 这里应该调用保存草稿的API
      // await saveSubcontractApplicationDraft(values);
      
      message.success('分包申请表保存成功！');
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请重试');
    }
  };

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={handleSubmit}
      onSave={handleSave}
      initialValues={{
        applicant: '当前用户', // 这里应该从用户状态中获取
        applicationDate: dayjs()
      }}
    />
  );
}