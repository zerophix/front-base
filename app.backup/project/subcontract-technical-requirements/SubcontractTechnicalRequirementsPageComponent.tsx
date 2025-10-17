import { StandardFormPage } from '@/components/templates/StandardFormPage';
import { FieldConfig } from '@/components/common/FieldGroup';
import { message } from 'antd';
import dayjs from 'dayjs';

export default function SubcontractTechnicalRequirementsPage() {
  const fields: FieldConfig[] = [
    // 基本信息
    { 
      name: 'projectName', 
      label: '分包项目', 
      type: 'text', 
      required: true, 
      span: 12,
      placeholder: '请输入分包项目名称'
    },
    { 
      name: 'applicationDate', 
      label: '申请日期', 
      type: 'date', 
      required: true, 
      span: 12 
    },
    { 
      name: 'clientUnit', 
      label: '委托单位', 
      type: 'text', 
      required: true, 
      span: 12,
      placeholder: '请输入委托单位名称'
    },
    { 
      name: 'clientDate', 
      label: '委托日期', 
      type: 'date', 
      required: true, 
      span: 12 
    },

    // 项目内容
    { 
      name: 'projectContent', 
      label: '分包项目内容及要求', 
      type: 'textarea', 
      required: true, 
      span: 24,
      rows: 5,
      placeholder: '请详细描述分包项目的具体内容和技术要求'
    },
    { 
      name: 'subcontractorUnit', 
      label: '分包单位', 
      type: 'text', 
      required: true, 
      span: 12,
      placeholder: '请输入分包单位名称'
    },

    // 技术文件要求
    { 
      name: 'technicalDocuments', 
      label: '应提供的技术文件', 
      type: 'textarea', 
      required: true, 
      span: 24,
      rows: 4,
      placeholder: '请列出分包方需要提供的技术文件清单'
    },

    // 签字确认
    { 
      name: 'clientRepresentative', 
      label: '委托方代表签字', 
      type: 'text', 
      required: true, 
      span: 12,
      placeholder: '请输入委托方代表姓名'
    },
    { 
      name: 'signDate', 
      label: '签字日期', 
      type: 'date', 
      required: true, 
      span: 12 
    },

    // 备注
    { 
      name: 'remark', 
      label: '备注', 
      type: 'textarea', 
      span: 24,
      rows: 3,
      placeholder: '其他需要说明的事项'
    },
  ];

  const handleSubmit = async (values: any) => {
    try {
      console.log('提交分包项目技术要求表:', values);
      // 这里应该调用实际的API
      // await projectApi.subcontractTechnicalRequirements.create(values);
      message.success('分包项目技术要求表提交成功！');
      return true;
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败，请重试');
      return false;
    }
  };

  const handleSave = async (values: any) => {
    try {
      console.log('暂存分包项目技术要求表:', values);
      // 这里应该调用实际的API
      // await projectApi.subcontractTechnicalRequirements.save(values);
      message.success('分包项目技术要求表暂存成功！');
      return true;
    } catch (error) {
      console.error('暂存失败:', error);
      message.error('暂存失败，请重试');
      return false;
    }
  };

  return (
    <StandardFormPage
      fields={fields}
      onSubmit={handleSubmit}
      onSave={handleSave}
      initialValues={{
        applicationDate: dayjs(),
        signDate: dayjs()
      }}
    />
  );
}