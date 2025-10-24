#!/usr/bin/env node

/**
 * 钉钉机器人调试脚本
 * 用于诊断钉钉机器人推送问题
 */

const https = require('https');
const url = require('url');

// 从环境变量获取webhook地址
const webhookUrl = process.env.DINGTALK_WEBHOOK;

if (!webhookUrl) {
  console.error('❌ 错误: 请设置环境变量 DINGTALK_WEBHOOK');
  process.exit(1);
}

console.log('🔍 开始调试钉钉机器人...');
console.log('📡 Webhook地址:', webhookUrl.substring(0, 50) + '...');

// 简单的测试消息，包含关键词
const testMessage = {
  msgtype: "text",
  text: {
    content: `GitHub CI 部署通知测试\n\n` +
            `项目: front-base\n` +
            `时间: ${new Date().toLocaleString('zh-CN')}\n` +
            `状态: 测试中\n` +
            `来源: GitHub Actions`
  }
};

console.log('📤 发送测试消息...');

// 发送请求
const parsedUrl = url.parse(webhookUrl);
const postData = JSON.stringify(testMessage);

const options = {
  hostname: parsedUrl.hostname,
  port: parsedUrl.port || 443,
  path: parsedUrl.path,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'GitHub-Actions-Bot/1.0'
  }
};

const req = https.request(options, (res) => {
  console.log('📊 HTTP状态码:', res.statusCode);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('📥 响应内容:', responseData);
    
    try {
      const response = JSON.parse(responseData);
      console.log('📋 解析后的响应:', response);
      
      if (response.errcode === 0) {
        console.log('✅ 消息发送成功!');
      } else {
        console.log('❌ 钉钉API错误:', response.errmsg);
        console.log('💡 错误代码:', response.errcode);
        
        // 常见错误代码解释
        if (response.errcode === 310000) {
          console.log('🔍 可能原因: 机器人安全设置问题，需要添加关键词或IP白名单');
        }
      }
    } catch (e) {
      console.log('⚠️ 响应解析失败:', e.message);
      console.log('原始响应:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ 请求错误:', e.message);
});

req.write(postData);
req.end();