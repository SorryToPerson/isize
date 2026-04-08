#!/usr/bin/env bash

set -euo pipefail

BRANCH="${BRANCH:-main}"
PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
APP_PORT="${APP_PORT:-3000}"
REPO_URL="${REPO_URL:-}"

log() {
  printf '[deploy] %s\n' "$1"
}

fail() {
  printf '[deploy] ERROR: %s\n' "$1" >&2
  exit 1
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "缺少命令: $1"
  fi
}

ensure_git_repo() {
  if [ -d "$PROJECT_DIR/.git" ]; then
    return
  fi

  if [ -z "$REPO_URL" ]; then
    fail "当前目录不是 git 仓库。请先克隆项目，或者在执行时传入 REPO_URL。"
  fi

  if [ -d "$PROJECT_DIR" ] && [ -n "$(ls -A "$PROJECT_DIR" 2>/dev/null)" ]; then
    fail "PROJECT_DIR=$PROJECT_DIR 不是空目录，无法自动 clone。"
  fi

  mkdir -p "$PROJECT_DIR"
  log "开始克隆仓库到 $PROJECT_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$PROJECT_DIR"
}

update_code() {
  cd "$PROJECT_DIR"

  if [ -n "$(git status --porcelain)" ]; then
    fail "检测到未提交的本地改动，已停止部署。请先清理服务器工作区。"
  fi

  log "获取远端分支 $BRANCH 最新代码"
  git fetch origin "$BRANCH"

  current_branch="$(git rev-parse --abbrev-ref HEAD)"
  if [ "$current_branch" != "$BRANCH" ]; then
    log "切换到分支 $BRANCH"
    git checkout "$BRANCH"
  fi

  log "拉取 origin/$BRANCH"
  git pull --ff-only origin "$BRANCH"
}

deploy_app() {
  cd "$PROJECT_DIR"

  if [ ! -f "$COMPOSE_FILE" ]; then
    fail "未找到 compose 文件: $PROJECT_DIR/$COMPOSE_FILE"
  fi

  log "校验 Docker 服务"
  docker info >/dev/null 2>&1 || fail "Docker daemon 不可用，请先启动 Docker。"

  log "开始构建并启动容器"
  APP_PORT="$APP_PORT" docker compose -f "$COMPOSE_FILE" up -d --build

  log "当前容器状态"
  APP_PORT="$APP_PORT" docker compose -f "$COMPOSE_FILE" ps
}

main() {
  require_command git
  require_command docker

  ensure_git_repo
  update_code
  deploy_app

  log "部署完成"
}

main "$@"
