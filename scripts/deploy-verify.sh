#!/bin/bash

# 部署验证脚本
# 用于验证Vercel部署是否成功

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查环境变量
check_env_vars() {
    log_info "检查环境变量..."
    
    local required_vars=(
        "VERCEL_TOKEN"
        "VERCEL_ORG_ID" 
        "VERCEL_PROJECT_ID"
        "NATAPP_BASE_URL"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "缺少必要的环境变量:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        return 1
    fi
    
    log_success "所有必要的环境变量已设置"
    return 0
}

# 检查内网穿透连通性
check_natapp_connectivity() {
    log_info "检查内网穿透连通性..."
    
    local natapp_url="${NATAPP_BASE_URL:-http://dolphinmind.natapp1.cc}"
    
    if curl -s --head "$natapp_url" > /dev/null; then
        log_success "内网穿透地址可访问: $natapp_url"
        return 0
    else
        log_warning "内网穿透地址不可访问: $natapp_url"
        return 1
    fi
}

# 验证构建
verify_build() {
    log_info "验证项目构建..."
    
    if [[ ! -d ".next" ]]; then
        log_error "构建目录 .next 不存在"
        return 1
    fi
    
    if [[ ! -f ".next/BUILD_ID" ]]; then
        log_error "构建ID文件不存在"
        return 1
    fi
    
    local build_id=$(cat .next/BUILD_ID)
    log_success "构建验证成功，BUILD_ID: $build_id"
    return 0
}

# 验证部署URL
verify_deployment() {
    local deployment_url="$1"
    
    if [[ -z "$deployment_url" ]]; then
        log_warning "未提供部署URL，跳过部署验证"
        return 0
    fi
    
    log_info "验证部署URL: $deployment_url"
    
    # 等待部署完成
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -s --head "$deployment_url" > /dev/null; then
            log_success "部署验证成功: $deployment_url"
            return 0
        fi
        
        log_info "等待部署完成... ($attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    log_error "部署验证超时"
    return 1
}

# 主函数
main() {
    log_info "开始部署验证..."
    
    # 检查环境变量
    if ! check_env_vars; then
        log_error "环境变量检查失败"
        exit 1
    fi
    
    # 检查内网穿透连通性
    check_natapp_connectivity
    
    # 验证构建
    if ! verify_build; then
        log_error "构建验证失败"
        exit 1
    fi
    
    # 如果提供了部署URL，验证部署
    if [[ -n "$1" ]]; then
        if ! verify_deployment "$1"; then
            log_error "部署验证失败"
            exit 1
        fi
    fi
    
    log_success "所有验证通过！"
}

# 执行主函数
main "$@"