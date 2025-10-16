import React from 'react';
import {
  UserOutlined,
  ToolOutlined,
  SafetyOutlined,
  ProjectOutlined,
  DatabaseOutlined,
  TeamOutlined,
  IdcardOutlined,
  SwapOutlined,
  ReadOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  HddOutlined,
  PlusSquareOutlined,
  ContainerOutlined,
  FormOutlined,
  ExperimentOutlined,
  AlertOutlined,
  DeleteOutlined,
  ProfileOutlined,
  ClusterOutlined,
  ScheduleOutlined,
  AppstoreOutlined,
  SlidersOutlined,
  FieldNumberOutlined,
  LockOutlined,
  AuditOutlined,
  FileTextOutlined,
  NotificationOutlined,
  SolutionOutlined,
  FileSearchOutlined,
  ApartmentOutlined,
  ContactsOutlined,
  CheckCircleOutlined,
  RollbackOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  FireOutlined,
  FileAddOutlined,
  EditOutlined,
} from '@ant-design/icons';

// 集中管理 Ant Design 图标映射，避免在各处散落维护
export const IconMap = {
  UserOutlined,
  ToolOutlined,
  SafetyOutlined,
  ProjectOutlined,
  DatabaseOutlined,
  TeamOutlined,
  IdcardOutlined,
  SwapOutlined,
  ReadOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  HddOutlined,
  PlusSquareOutlined,
  ContainerOutlined,
  FormOutlined,
  ExperimentOutlined,
  AlertOutlined,
  DeleteOutlined,
  ProfileOutlined,
  ClusterOutlined,
  ScheduleOutlined,
  AppstoreOutlined,
  SlidersOutlined,
  FieldNumberOutlined,
  LockOutlined,
  AuditOutlined,
  FileTextOutlined,
  NotificationOutlined,
  SolutionOutlined,
  FileSearchOutlined,
  ApartmentOutlined,
  ContactsOutlined,
  CheckCircleOutlined,
  RollbackOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  FireOutlined,
  FileAddOutlined,
  EditOutlined,
} as const;

export type IconName = keyof typeof IconMap;

export const getIcon = (name?: IconName): React.ReactNode | undefined => {
  if (!name) return undefined;
  const Comp = IconMap[name];
  return Comp ? React.createElement(Comp) : undefined;
};

export const getModuleIcon = (
  moduleKey: 'data' | 'project' | 'equipment' | 'personnel' | 'quality' | 'home' | 'records'
): React.ReactNode | undefined => {
  switch (moduleKey) {
    case 'personnel':
      return React.createElement(TeamOutlined);
    case 'equipment':
      return React.createElement(ToolOutlined);
    case 'quality':
      return React.createElement(SafetyOutlined);
    case 'project':
      return React.createElement(ProjectOutlined);
    case 'data':
      return React.createElement(DatabaseOutlined);
    case 'home':
      return React.createElement(AppstoreOutlined);
    case 'records':
      return React.createElement(FileTextOutlined);
    default:
      return undefined;
  }
};