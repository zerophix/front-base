#!/usr/bin/env node
/**
 * 简易构建体积检查：统计 .next/static/chunks 下的 JS 总体积
 * 超过阈值则退出非零，作为 CI 门禁。
 */

import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CHUNKS_DIR = join('.next', 'static', 'chunks');
const DEFAULT_LIMIT_MB = Number(process.env.BUNDLE_LIMIT_MB || 5); // 默认 5MB

function formatMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

function main() {
  let total = 0;
  try {
    const files = readdirSync(CHUNKS_DIR);
    for (const f of files) {
      if (f.endsWith('.js')) {
        const s = statSync(join(CHUNKS_DIR, f));
        total += s.size;
      }
    }

    const totalMB = Number(formatMB(total));
    console.log(`[Bundle Check] JS chunks total: ${totalMB} MB (limit: ${DEFAULT_LIMIT_MB} MB)`);

    if (totalMB > DEFAULT_LIMIT_MB) {
      console.error(`[Bundle Check] Exceeded limit by ${(totalMB - DEFAULT_LIMIT_MB).toFixed(2)} MB`);
      process.exit(1);
    } else {
      console.log('[Bundle Check] OK');
    }
  } catch (e) {
    console.error('[Bundle Check] Failed:', e?.message || e);
    // 保守策略：如果检查失败，返回非零以提示修复
    process.exit(2);
  }
}

main();