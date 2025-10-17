/**
 * 项目合同登记表页面
 */

import React, { useEffect } from 'react';
import { StandardFormPage } from '@/components/templates/StandardFormPage';
import type { FieldConfig } from '@/components/templates/StandardFormPage';
import { useUserStore } from '@/store';
import dayjs from 'dayjs';

export default function ProjectContractRegistrationPage() {
  // 清理内存泄漏
  useEffect(() => {
    return () => {
      // 清理定时器
      // 注意：需要将定时器ID保存到ref或state中
      // 示例：if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const user = useUserStore((s) => s.user);

  const fields: FieldConfig[] = [
    // 合同基本信息
    { 
      name: 'contractName', 
      label: '合同名称', 
      type: 'text', 
      required: true, 
      span: 12,
      placeholder: '请输入合同名称',
      rules: [
        { required: true, message: '请输入合同名称' },
        { min: 2, max: 100, message: '合同名称长度应在2-100字符之间' }
      ]
    },
    { 
      name: 'contractNumber', 
      label: '合同编号', 
      type: 'text', 
      required: true, 
      span: 12,
      placeholder: '请输入合同编号',
      rules: [
        { required: true, message: '请输入合同编号' },
        { pattern: /^[A-Z0-9-]+$/, message: '合同编号只能包含大写字母、数字和连字符' }
      ]
    },
    { 
      name: 'contractType', 
      label: '合同类型', 
      type: 'select', 
      required: true, 
      span: 12,
      placeholder: '请选择合同类型',
      options: [
        { label: '建设工程合同', value: 'construction' },
        { label: '技术服务合同', value: 'technical' },
        { label: '采购合同', value: 'procurement' },
        { label: '咨询合同', value: 'consulting' }
      ]
    },
    { 
      name: 'projectName', 
      label: '项目名称', 
      type: 'text', 
      required: true, 
      span: 12,
      placeholder: '请输入项目名称',
      rules: [
        { required: true, message: '请输入项目名称' },
        { min: 2, max: 100, message: '项目名称长度应在2-100字符之间' }
      ]
    },
    
    // 合同双方信息
    { 
      name: 'partyA', 
      label: '甲方', 
      type: 'text', 
      required: true, 
      span: 12,
      placeholder: '请输入甲方名称'
    },
    { 
      name: 'partyB', 
      label: '乙方', 
      type: 'text', 
      required: true, 
      span: 12,
      placeholder: '请输入乙方名称'
    },
    { 
      name: 'partyAContact', 
      label: '甲方联系人', 
      type: 'text', 
      required: true, 
      span: 12,
      placeholder: '请输入甲方联系人'
    },
    { 
      name: 'partyBContact', 
      label: '乙方联系人', 
      type: 'text', 
      required: true, 
      span: 12,
      placeholder: '请输入乙方联系人'
    },
    
    // 合同日期
    { 
      name: 'signingDate', 
      label: '签订日期', 
      type: 'date', 
      required: true, 
      span: 12,
      placeholder: '请选择签订日期'
    },
    { 
      name: 'effectiveDate', 
      label: '生效日期', 
      type: 'date', 
      required: true, 
      span: 12,
      placeholder: '请选择生效日期'
    },
    { 
      name: 'expiryDate', 
      label: '到期日期', 
      type: 'date', 
      required: true, 
      span: 12,
      placeholder: '请选择到期日期'
    },
    
    // 合同金额
    { 
      name: 'contractAmount', 
      label: '合同金额', 
      type: 'number', 
      required: true, 
      span: 12,
      placeholder: '请输入合同金额（元）',
      rules: [
        { required: true, message: '请输入合同金额' },
        { type: 'number', min: 0, message: '合同金额不能为负数' }
      ]
    },
    { 
      name: 'paymentMethod', 
      label: '付款方式', 
      type: 'select', 
      required: true, 
      span: 12,
      placeholder: '请选择付款方式',
      options: [
        { label: '一次性付款', value: 'lump_sum' },
        { label: '分期付款', value: 'installment' },
        { label: '按进度付款', value: 'progress' },
        { label: '验收后付款', value: 'after_acceptance' }
      ]
    },
    
    // 项目经理和附件
    { 
      name: 'projectManager', 
      label: '项目经理', 
      type: 'text', 
      required: true, 
      span: 12,
      placeholder: '请输入项目经理姓名'
    },
    { 
      name: 'registrationDate', 
      label: '登记日期', 
      type: 'text', 
      required: true, 
      span: 12,
      placeholder: '登记日期'
    },
    { 
      name: 'attachments', 
      label: '附件', 
      type: 'text', 
      required: false, 
      span: 24,
      placeholder: '请输入附件说明（可选）'
    },
    { 
      name: 'remarks', 
      label: '备注', 
      type: 'textarea', 
      required: false, 
      span: 24, 
      rows: 3,
      placeholder: '请输入备注信息（可选）'
    },
  ];

  const handleSubmit = async (values: any) => {
    try {
      console.log('提交项目合同登记:', values);
      
      // 数据验证
      if (!values.contractName || !values.contractNumber) {
        throw new Error('合同名称和编号不能为空');
      }
      
      if (values.contractAmount <= 0) {
        throw new Error('合同金额必须大于0');
      }
      
      // 日期验证
      if (values.effectiveDate && values.expiryDate) {
        const effectiveDate = new Date(values.effectiveDate);
        const expiryDate = new Date(values.expiryDate);
        if (effectiveDate >= expiryDate) {
          throw new Error('生效日期必须早于到期日期');
        }
      }
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 这里应该调用实际的API
      // const response = await api.submitContractRegistration(values);
      
      console.log('项目合同登记提交成功');
      return true;
    } catch (error) {
      console.error('提交失败:', error);
      throw error;
    }
  };

  const handleSave = async (values: any) => {
    try {
      console.log('暂存项目合同登记:', values);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 这里应该调用实际的API
      // const response = await api.saveContractRegistration(values);
      
      console.log('项目合同登记暂存成功');
      return true;
    } catch (error) {
      console.error('暂存失败:', error);
      throw error;
    }
  };

  return (
    <StandardFormPage
      fields={fields}
      initialValues={{
        projectManager: user?.name,
        registrationDate: dayjs(),
      }}
      onSubmit={handleSubmit}
      onSave={handleSave}
    />
  );
}