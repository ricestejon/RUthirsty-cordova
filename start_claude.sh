#!/usr/bin/env bash
set -e
#!/bin/bash

# Load environment variables from .env file if present
if [ -f .env ]; then
    set -a
    . .env
    set +a
fi

# Verify required environment variables
if [ -z "$ANTHROPIC_AUTH_TOKEN" ]; then
    echo "Error: ANTHROPIC_AUTH_TOKEN is not set. Create a .env file with your token."
    exit 1
fi
if [ -z "$ANTHROPIC_BASE_URL" ]; then
    echo "Error: ANTHROPIC_BASE_URL is not set. Create a .env file with your base URL."
    exit 1
fi

first_run=false
# 检查claude是否已安装
if ! command -v claude &> /dev/null; then
    echo "Claude未安装，正在安装..."
    npm install -g @anthropic-ai/claude-code
    if [ $? -ne 0 ]; then
        echo "Claude安装失败，请检查网络连接和npm配置"
        exit 1
    fi
    echo "Claude安装成功！"
    first_run=true
else
    echo "Claude已安装"
fi

# 启动claude
echo "启动Claude..."
if $first_run; then
    # 10秒倒计时
    for i in 10 9 8 7 6 5 4 3 2 1; do
        echo -ne "初次启动Claude需要简单配置，所有配置按【回车键】选默认设置即可。请阅读以上指导: $i秒\r"
        sleep 1
    done
    echo -ne "                                          \r"
fi

claude
