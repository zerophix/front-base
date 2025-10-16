import type { RouteConfig } from '@/config/routes';
import { createModuleRoute, createChildRoutes } from '../utils';

const moduleRoute = createModuleRoute('quality', 'SafetyOutlined');

const childRoutes = createChildRoutes('quality', [
  {
    path: 'doc-controlled-list',
    title: '受控文件目录',
    recordNumber: 'SZD-QA-DOC-01-2021',
    icon: 'ContainerOutlined',
  },
  {
    path: 'doc-issue-approve',
    title: '文件签发批准',
    recordNumber: 'SZD-QA-DOC-03-2021',
    icon: 'FormOutlined',
  },
  {
    path: 'environment',
    title: '环境条件记录',
    recordNumber: 'SZD-QA-R-01-01-2021',
    icon: 'ExperimentOutlined',
  },
  {
    path: 'std-register',
    title: '标准物质登记',
    recordNumber: 'SZD-QA-STD-01-2021',
    icon: 'DatabaseOutlined',
  },
  {
    path: 'std-usage-record',
    title: '标准物质使用',
    recordNumber: 'SZD-QA-STD-06-2021',
    icon: 'FileDoneOutlined',
  },
  {
    path: 'nonconformity',
    title: '不符合项管理',
    recordNumber: 'SZD-QA-R-02-01-2021',
    icon: 'AlertOutlined',
  },
  {
    path: 'waste',
    title: '废弃物管理表',
    recordNumber: 'SZD-QA-WASTE-01-2021',
    icon: 'DeleteOutlined',
  },
  {
    path: 'waste-ledger',
    title: '废弃物台账表',
    recordNumber: 'SZD-QA-WASTE-LEDGER-01-2021',
    icon: 'ProfileOutlined',
  },
  {
    path: 'waste-media-sterilization',
    title: '培养基灭菌表',
    recordNumber: 'SZD-QA-WASTE-03-2021',
    icon: 'FireOutlined',
  },
  {
    path: 'doc-compose-apply',
    title: '文件编制申请',
    recordNumber: 'SZD-QA-DOC-02-2021',
    icon: 'FileAddOutlined',
  },
  {
    path: 'confidentiality',
    title: '保密管理表单',
    recordNumber: 'SZD-QA-CONF-01-2021',
    icon: 'LockOutlined',
  },
  {
    path: 'disciplinary',
    title: '纪律处分表单',
    recordNumber: 'SZD-QA-DISC-01-2021',
    icon: 'AlertOutlined',
  },
  {
    path: 'supervision-plan',
    title: '监督检查计划',
    recordNumber: 'SZD-QA-SUP-01-2021',
    icon: 'CalendarOutlined',
  },
  {
    path: 'supervision-notice',
    title: '监督检查通知',
    recordNumber: 'SZD-QA-SUPV-NOTICE-01-2021',
    icon: 'NotificationOutlined',
  },
  {
    path: 'supervision-register',
    title: '监督检查登记',
    recordNumber: 'SZD-QA-SUPV-REGISTER-01-2021',
    icon: 'SolutionOutlined',
  },
  {
    path: 'supervision-record',
    title: '监督检查记录',
    recordNumber: 'SZD-QA-SUP-02-2021',
    icon: 'FileSearchOutlined',
  },
  {
    path: 'supervision-business',
    title: '监督管理业务',
    recordNumber: 'SZD-QA-SUP-05-2021',
    icon: 'ApartmentOutlined',
  },
  {
    path: 'visitor-register',
    title: '来访者登记表',
    recordNumber: 'SZD-QA-VIS-REGISTER-01-2021',
    icon: 'ContactsOutlined',
  },
  {
    path: 'standard-substance-apply',
    title: '标准物质领用',
    recordNumber: 'SZD-QA-STD-07-2021',
    icon: 'FileAddOutlined',
  },
  {
    path: 'std-receive',
    title: '标准物质接收',
    recordNumber: 'SZD-QA-STD-02-2021',
    icon: 'InboxOutlined',
  },
  {
    path: 'std-dilution-record',
    title: '标准溶液配制',
    recordNumber: 'SZD-QA-STD-DIL-01-2021',
    icon: 'ExperimentOutlined',
  },
  {
    path: 'std-periodic-plan',
    title: '标准物质核查',
    recordNumber: 'SZD-QA-STD-04-2021',
    icon: 'CalendarOutlined',
  },
  {
    path: 'std-periodic-record',
    title: '标准核查记录',
    recordNumber: 'SZD-QA-STD-05-2021',
    icon: 'ProfileOutlined',
  },
  {
    path: 'cert-validity-confirm',
    title: '证书有效确认',
    recordNumber: 'SZD-QA-CERT-01-2021',
    icon: 'SafetyCertificateOutlined',
  },
  {
    path: 'data-correction-apply',
    title: '数据更正申请',
    recordNumber: 'SZD-QA-CORR-APPLY-01-2021',
    icon: 'FormOutlined',
  },
  {
    path: 'correction-value-stat',
    title: '校正值统计表',
    recordNumber: 'SZD-QA-CORR-01-2021',
    icon: 'BarChartOutlined',
  },
  {
    path: 'report-issue-register',
    title: '报告发布登记',
    recordNumber: 'SZD-ST-JL-35-01-2021',
    icon: 'FileDoneOutlined',
  },
  {
    path: 'sample-verification',
    title: '样检记录核查',
    recordNumber: 'SZD-ST-JL-34-01-2021',
    icon: 'AuditOutlined',
  },
  {
    path: 'doc-issue-register',
    title: '文件发放(领用)登记表',
    recordNumber: 'SZD-QA-DOC-ISSUE-01-2021',
    icon: 'FileTextOutlined',
  },
  {
    path: 'doc-issue-approval',
    title: '文件发放(领用)审批表',
    recordNumber: 'SZD-QA-DOC-ISSUE-02-2021',
    icon: 'CheckCircleOutlined',
  },
  {
    path: 'doc-modification-approval',
    title: '文件修改审批表',
    recordNumber: 'SZD-QA-DOC-MOD-01-2021',
    icon: 'EditOutlined',
  },
  {
    path: 'doc-retention-record',
    title: '文件销毁(留存)记录表',
    recordNumber: 'SZD-QA-DOC-RET-01-2021',
    icon: 'DeleteOutlined',
  },
  {
    path: 'doc-borrow-register',
    title: '文件借阅登记表',
    recordNumber: 'SZD-QA-DOC-BORROW-01-2021',
    icon: 'ReadOutlined',
  },
  {
    path: 'technical-standard-validity-report',
    title: '技术标准有效性确认报告',
    recordNumber: 'SZD-QA-STD-VALIDITY-01-2021',
    icon: 'SafetyCertificateOutlined',
  },
  {
    path: 'doc-effectiveness-check',
    title: '受控文件有效性检查登记表',
    recordNumber: 'SZD-QA-DOC-EFFECT-01-2021',
    icon: 'FileSearchOutlined',
  },
  {
    path: 'testing-commission-contract',
    title: '检测委托合同',
    recordNumber: 'SZD-QA-CONTRACT-01-2021',
    icon: 'FileTextOutlined',
  },
  {
    path: 'contract-review',
    title: '合同评审表',
    recordNumber: 'SZD-ST-JL-13-02-2021',
    icon: 'FileTextOutlined',
  },
  {
    path: 'supplier-evaluation',
    title: '供方评价表',
    recordNumber: 'SDIJS-JL-01-01-2019',
    icon: 'TeamOutlined',
  },
  {
    path: 'qualified-supplier-directory',
    title: '合格供应商和外部服务方名录',
    recordNumber: 'SZD-ST-JL-15-02-2019',
    icon: 'ContactsOutlined',
  },
]);

export const qualityRoutes: RouteConfig[] = [moduleRoute, ...childRoutes];