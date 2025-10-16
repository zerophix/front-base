#!/bin/bash

# 获取仓库信息
REPO_URL=$(git remote get-url origin)
echo "Remote URL: $REPO_URL"

if [[ $REPO_URL == *"github"* ]]; then
    # 处理SSH格式: git@github-sjneking:SJNeking/front-base.git
    if [[ $REPO_URL == git@* ]]; then
        REPO_INFO=$(echo $REPO_URL | sed 's/git@[^:]*:\([^/]*\)\/\([^.]*\).*/\1\/\2/')
    # 处理HTTPS格式: https://github.com/user/repo.git
    else
        REPO_INFO=$(echo $REPO_URL | sed 's/.*github[^\/]*[:/]\([^/]*\)\/\([^.]*\).*/\1\/\2/')
    fi
    
    echo "仓库: $REPO_INFO"
    
    # 使用GitHub API查看最近的Actions运行
    echo "最近的GitHub Actions运行："
    curl -s "https://api.github.com/repos/$REPO_INFO/actions/runs?per_page=5" | \
    python3 -m json.tool 2>/dev/null | grep -E '"conclusion"|"status"|"name"|"created_at"|"head_branch"' | \
    head -20
else
    echo "这不是一个GitHub仓库"
fi
