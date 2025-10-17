'use client';

import React from 'react';
import { Tooltip, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import styles from './EvaluationStandardTips.module.css';

/**
 * 评价标准提示组件
 */
export function EvaluationStandardTips() {
  // 防止滚动事件传播到页面
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const standardContent = (
    <div className={styles.tipsContent} onWheel={handleWheel}>
      <div className={styles.section}>
        <h4>评价标准</h4>
        <p><strong>1.标准分：100分</strong></p>
        <p><strong>2.考核总分在70分且实物质量考核分在30分以上的为合格供应方；</strong></p>
        <p><strong>3.考核总分在70分以下或实物质量考核分在30分以下的为不合格供应方。</strong></p>
      </div>

      <div className={styles.section}>
        <h4>考核评分</h4>
        
        <div className={styles.subsection}>
          <h5>1.实物质量：在进货检验时，产品合格率达100%，不扣分；</h5>
          <ul>
            <li>产品合格率在100%以下，95%以上，扣5分；</li>
            <li>产品合格率在95%以下，90%以上，扣10分；</li>
            <li>产品合格率在90%以下，85%以上，扣20分；</li>
            <li>产品合格率在85%以下，80%以上，扣40分；</li>
            <li>产品合格率在80%以下，扣50分。</li>
          </ul>
        </div>

        <div className={styles.subsection}>
          <h5>2.完成交货期及网络能力：在商定的交货期内交货，不扣分；</h5>
          <ul>
            <li>延期1-2天，扣5分；</li>
            <li>延期3天，扣10分；</li>
            <li>延期3天以上，全部扣除。</li>
          </ul>
        </div>

        <div className={styles.subsection}>
          <h5>3.服务能力：</h5>
          <ul>
            <li>(1) 标准分为15分时，提供的服务好，不扣分；一般，扣5分；差，全部扣除。</li>
            <li>(2) 标准分为30分时，提供的服务好，不扣分；一般，扣15分；差，全部扣除。</li>
          </ul>
        </div>

        <div className={styles.subsection}>
          <h5>4.生产和检验能力：</h5>
          <ul>
            <li>(1) 标准分为15分时，资源充足，不扣分；销售不足，扣5分；不足，扣10分；严重不足，全部扣除。</li>
            <li>(2) 标准分为30分时，此项不作考核。</li>
          </ul>
        </div>
      </div>

      <div className={styles.section}>
        <h4>说明：</h4>
        <p>若供应商为非生产的供货单位，则上述评价的营客户&ldquo;生产&rdquo;和检测能力&ldquo;一项不作考核，标准分由原15分变更为0分，而&ldquo;服务能力&rdquo;一项由原来15分变更为30分。</p>
      </div>
    </div>
  );

  return (
    <Tooltip
        title={standardContent}
        placement="left"
        classNames={{ root: "evaluation-standard-tooltip" }}
        trigger="hover"
        autoAdjustOverflow={true}
        getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
      >
      <Button
        type="text"
        icon={<QuestionCircleOutlined />}
        className={styles.tipsButton}
        size="small"
      >
        评价标准
      </Button>
    </Tooltip>
  );
}