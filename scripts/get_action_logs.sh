#!/bin/bash

# 获取仓库信息
REPO_URL=$(git remote get-url origin)
REPO_INFO=$(echo $REPO_URL | sed 's/git@[^:]*:\([^/]*\)\/\([^.]*\).*/\1\/\2/')

echo "获取最新失败的Actions运行日志..."

# 获取最新的失败运行ID
RUN_ID=$(curl -s "https://api.github.com/repos/$REPO_INFO/actions/runs?per_page=1&status=completed&conclusion=failure" | \
python3 -c "
import json, sys
data = json.load(sys.stdin)
if data['workflow_runs']:
    print(data['workflow_runs'][0]['id'])
")

if [ -n "$RUN_ID" ]; then
    echo "运行ID: $RUN_ID"
    echo "获取作业列表..."
    
    # 获取作业列表
    curl -s "https://api.github.com/repos/$REPO_INFO/actions/runs/$RUN_ID/jobs" | \
    python3 -c "
import json, sys
data = json.load(sys.stdin)
for job in data['jobs']:
    print(f'作业: {job[\"name\"]}')
    print(f'状态: {job[\"status\"]}')
    print(f'结果: {job[\"conclusion\"]}')
    if job['conclusion'] == 'failure':
        print(f'日志URL: {job[\"html_url\"]}')
    print('---')
"
else
    echo "未找到失败的运行"
fi
