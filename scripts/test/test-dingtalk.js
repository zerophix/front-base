#!/usr/bin/env node

/**
 * 钉钉机器人通知测试脚本
 * 用于验证钉钉webhook配置是否正确
 */

const https = require('https');
const url = require('url');

// 从环境变量获取webhook地址
const webhookUrl = process.env.DINGTALK_WEBHOOK;

if (!webhookUrl) {
  console.error('❌ 错误: 请设置环境变量 DINGTALK_WEBHOOK');
  console.log('使用方法: DINGTALK_WEBHOOK=你的webhook地址 node test-dingtalk.js');
  process.exit(1);
}

console.log('🔍 开始测试钉钉机器人通知...');
console.log('📡 Webhook地址:', webhookUrl.replace(/access_token=.*/, 'access_token=***'));

// 测试消息
const testMessage = {
  msgtype: "text",
  text: {
    content: `🧪 钉钉机器人测试消息\n\n` +
            `项目: front-base\n` +
            `测试时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})}\n` +
            `状态: ✅ 配置正常\n\n` +
            `如果您看到这条消息，说明钉钉机器人配置成功！`
  }
};

console.log('📤 发送测试消息...');
console.log('消息内容:', JSON.stringify(testMessage, null, 2));

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
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log('📊 HTTP状态码:', res.statusCode);
  console.log('📋 响应头:', res.headers);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('📥 响应内容:', responseData);
    
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(responseData);
        if (response.errcode === 0) {
          console.log('✅ 测试成功! 钉钉机器人通知正常工作');
        } else {
          console.log('❌ 钉钉API返回错误:', response.errmsg);
        }
      } catch (e) {
        console.log('⚠️ 响应解析失败，但HTTP状态正常');
      }
    } else {
      console.log('❌ 测试失败! HTTP状态码:', res.statusCode);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ 请求错误:', e.message);
  console.log('💡 可能的原因:');
  console.log('  1. 网络连接问题');
  console.log('  2. Webhook地址不正确');
  console.log('  3. 钉钉机器人被禁用');
});

req.write(postData);
req.end();