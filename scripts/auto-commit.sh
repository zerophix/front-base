#!/bin/bash

# 🚀 自动化Git提交脚本
# 功能：自动检查代码质量、运行测试、生成提交信息并提交

set -e  # 遇到错误立即退出

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

# 检查是否在Git仓库中
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "当前目录不是Git仓库"
        exit 1
    fi
}

# 检查是否有未提交的更改
check_changes() {
    if git diff --quiet && git diff --staged --quiet; then
        log_warning "没有检测到任何更改，无需提交"
        exit 0
    fi
}

# 代码质量检查
run_quality_checks() {
    log_info "开始代码质量检查..."
    
    # ESLint检查
    log_info "运行ESLint检查..."
    if npm run lint; then
        log_success "ESLint检查通过"
    else
        log_error "ESLint检查失败，请修复代码问题"
        exit 1
    fi
    
    # StyleLint检查
    log_info "运行StyleLint检查..."
    if npm run stylelint; then
        log_success "StyleLint检查通过"
    else
        log_warning "StyleLint检查失败，尝试自动修复..."
        npm run stylelint:fix
    fi
}

# 运行测试
run_tests() {
    log_info "运行测试套件..."
    if npm test; then
        log_success "所有测试通过"
    else
        log_error "测试失败，请修复测试问题"
        exit 1
    fi
}

# 智能生成提交信息
generate_commit_message() {
    local commit_type=""
    local scope=""
    local description=""
    
    # 分析文件变更类型
    local changed_files=$(git diff --name-only --staged)
    local new_files=$(git diff --name-only --diff-filter=A --staged)
    local deleted_files=$(git diff --name-only --diff-filter=D --staged)
    local modified_files=$(git diff --name-only --diff-filter=M --staged)
    
    # 根据文件变更智能判断提交类型
    if [[ -n "$new_files" ]]; then
        if echo "$new_files" | grep -q "test\|spec"; then
            commit_type="test"
            description="添加测试文件"
        elif echo "$new_files" | grep -q "component\|page"; then
            commit_type="feat"
            description="添加新功能组件"
        elif echo "$new_files" | grep -q "\.md$"; then
            commit_type="docs"
            description="添加文档"
        else
            commit_type="feat"
            description="添加新功能"
        fi
    elif [[ -n "$deleted_files" ]]; then
        commit_type="chore"
        description="删除文件"
    elif [[ -n "$modified_files" ]]; then
        if echo "$modified_files" | grep -q "package\.json\|package-lock\.json"; then
            commit_type="chore"
            description="更新依赖"
        elif echo "$modified_files" | grep -q "README\|\.md$"; then
            commit_type="docs"
            description="更新文档"
        elif echo "$modified_files" | grep -q "test\|spec"; then
            commit_type="test"
            description="更新测试"
        elif echo "$modified_files" | grep -q "\.css\|\.scss\|styles"; then
            commit_type="style"
            description="样式更新"
        else
            commit_type="fix"
            description="修复问题"
        fi
    fi
    
    # 检测作用域
    if echo "$changed_files" | grep -q "^app/"; then
        scope="app"
    elif echo "$changed_files" | grep -q "^src/components/"; then
        scope="components"
    elif echo "$changed_files" | grep -q "^src/hooks/"; then
        scope="hooks"
    elif echo "$changed_files" | grep -q "^src/services/"; then
        scope="services"
    elif echo "$changed_files" | grep -q "^src/utils/"; then
        scope="utils"
    fi
    
    # 生成提交信息
    if [[ -n "$scope" ]]; then
        echo "${commit_type}(${scope}): ${description}"
    else
        echo "${commit_type}: ${description}"
    fi
}

# 交互式提交信息确认
confirm_commit_message() {
    local auto_message="$1"
    
    echo ""
    log_info "自动生成的提交信息："
    echo -e "${GREEN}${auto_message}${NC}"
    echo ""
    
    read -p "是否使用此提交信息？(y/n/e) [y=使用, n=手动输入, e=编辑]: " choice
    
    case $choice in
        [Yy]* )
            echo "$auto_message"
            ;;
        [Nn]* )
            read -p "请输入提交信息: " manual_message
            echo "$manual_message"
            ;;
        [Ee]* )
            echo "$auto_message" > /tmp/commit_msg.txt
            ${EDITOR:-nano} /tmp/commit_msg.txt
            cat /tmp/commit_msg.txt
            rm -f /tmp/commit_msg.txt
            ;;
        * )
            echo "$auto_message"
            ;;
    esac
}

# 主函数
main() {
    log_info "🚀 开始自动化Git提交流程..."
    
    # 基础检查
    check_git_repo
    check_changes
    
    # 添加所有更改到暂存区
    log_info "添加文件到暂存区..."
    git add .
    
    # 代码质量检查（可选）
    if [[ "$1" != "--skip-checks" ]]; then
        run_quality_checks
        
        # 运行测试（可选）
        if [[ "$1" != "--skip-tests" ]]; then
            run_tests
        fi
    fi
    
    # 生成并确认提交信息
    local auto_message=$(generate_commit_message)
    local final_message=$(confirm_commit_message "$auto_message")
    
    # 执行提交
    log_info "执行Git提交..."
    git commit -m "$final_message"
    
    log_success "✅ 提交成功！"
    
    # 询问是否推送到远程仓库
    read -p "是否推送到远程仓库？(y/n): " push_choice
    case $push_choice in
        [Yy]* )
            log_info "推送到远程仓库..."
            git push
            log_success "✅ 推送成功！"
            ;;
        * )
            log_info "跳过推送，可稍后手动执行 git push"
            ;;
    esac
}

# 显示帮助信息
show_help() {
    echo "🚀 自动化Git提交脚本"
    echo ""
    echo "用法:"
    echo "  ./scripts/auto-commit.sh [选项]"
    echo ""
    echo "选项:"
    echo "  --skip-checks    跳过代码质量检查"
    echo "  --skip-tests     跳过测试运行"
    echo "  --help          显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./scripts/auto-commit.sh                # 完整流程"
    echo "  ./scripts/auto-commit.sh --skip-checks  # 跳过检查"
    echo "  ./scripts/auto-commit.sh --skip-tests   # 跳过测试"
}

# 参数处理
case "$1" in
    --help|-h)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac