#!/usr/bin/env node

/**
 * TVCors Proxy 启动脚本
 * 支持通过环境变量 PORT 设置端口
 */

import { spawn } from 'child_process';
import path from 'path';

// 获取端口，默认3001
const port = process.env.PORT || 3001;

// 获取命令行参数
const args = process.argv.slice(2);
const isDev = args.includes('--dev') || args.includes('-d');

// 构建命令
const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const commandArgs = [
  'next',
  isDev ? 'dev' : 'start',
  '-p',
  port.toString()
];

console.log(`🚀 Starting TVCors Proxy on port ${port}`);
console.log(`📝 Command: ${command} ${commandArgs.join(' ')}`);

// 启动Next.js
const child = spawn(command, commandArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32' // Windows需要shell
});

// 处理退出信号
child.on('exit', (code) => {
  process.exit(code || 0);
});

// 处理错误
child.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Shutting down server...');
  child.kill('SIGTERM');
});
