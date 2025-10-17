import React, { useMemo } from 'react';
import { MainLayout, PageContainer } from '@/components/layouts/MainLayout';
import { Card } from 'antd';

export default function ManagementOverviewPage() {
  const cards = useMemo(() => (
    [
      { title: '人员统计', content: '在岗人员、资质状态、培训进度' },
      { title: '设备状态', content: '台账数量、校准周期、维护提醒' },
      { title: '质量事件', content: '偏差/变更/CAPA 概况' },
      { title: '项目进度', content: '进行中任务与里程碑达成' },
      { title: '数据变更', content: '参数变更与最新发布' },
      { title: '风险预警', content: '高风险记录与待处理事项' },
    ]
  ), []);

  return (
    <MainLayout>
      <PageContainer title="管理概览">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {cards.map((item, index) => (
            <Card key={`${item.title}-${index}`} title={item.title}>
              {item.content}
            </Card>
          ))}
        </div>
      </PageContainer>
    </MainLayout>
  );
}