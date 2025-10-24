#!/bin/bash

# 获取仓库信息
REPO_URL=$(git remote get-url origin)
REPO_INFO=$(echo $REPO_URL | sed 's/git@[^:]*:\([^/]*\)\/\([^.]*\).*/\1\/\2/')

echo "仓库: $REPO_INFO"
echo "================================"

# 获取最近的Actions运行详情
echo "最近的GitHub Actions运行详情："
curl -s "https://api.github.com/repos/$REPO_INFO/actions/runs?per_page=3" | \
python3 -c "
import json, sys
data = json.load(sys.stdin)
for run in data['workflow_runs']:
    print(f'工作流: {run[\"name\"]}')
    print(f'分支: {run[\"head_branch\"]}')
    print(f'状态: {run[\"status\"]}')
    print(f'结果: {run[\"conclusion\"]}')
    print(f'创建时间: {run[\"created_at\"]}')
    print(f'URL: {run[\"html_url\"]}')
    print('---')
"
