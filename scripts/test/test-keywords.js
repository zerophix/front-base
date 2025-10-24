#!/usr/bin/env node

/**
 * 钉钉机器人关键词测试脚本
 * 测试不同关键词组合，找出正确的安全设置
 */

const https = require('https');
const url = require('url');

const webhookUrl = process.env.DINGTALK_WEBHOOK;

if (!webhookUrl) {
  console.error('❌ 请设置环境变量 DINGTALK_WEBHOOK');
  process.exit(1);
}

// 常见的钉钉机器人关键词
const keywordTests = [
  {
    name: "GitHub关键词测试",
    content: "GitHub Actions 部署通知\n项目: front-base\n状态: 测试中"
  },
  {
    name: "CI关键词测试", 
    content: "CI 构建通知\n项目: front-base\n状态: 测试中"
  },
  {
    name: "部署关键词测试",
    content: "部署通知\n项目: front-base\n状态: 测试中"
  },
  {
    name: "监控关键词测试",
    content: "监控告警\n项目: front-base\n状态: 测试中"
  },
  {
    name: "通知关键词测试",
    content: "系统通知\n项目: front-base\n状态: 测试中"
  },
  {
    name: "综合关键词测试",
    content: "GitHub CI 部署 监控 通知\n项目: front-base\n状态: 测试中"
  }
];

async function sendTestMessage(test) {
  return new Promise((resolve, reject) => {
    const message = {
      msgtype: "text",
      text: {
        content: test.content
      }
    };

    const parsedUrl = url.parse(webhookUrl);
    const postData = JSON.stringify(message);

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
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve({
            test: test.name,
            status: res.statusCode,
            response: response,
            success: response.errcode === 0
          });
        } catch (e) {
          resolve({
            test: test.name,
            status: res.statusCode,
            response: responseData,
            success: res.statusCode === 200
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 开始钉钉机器人关键词测试...\n');
  
  for (const test of keywordTests) {
    try {
      console.log(`📤 测试: ${test.name}`);
      const result = await sendTestMessage(test);
      
      if (result.success) {
        console.log(`✅ ${test.name} - 成功!`);
        console.log(`   消息内容: ${test.content}`);
      } else {
        console.log(`❌ ${test.name} - 失败`);
        console.log(`   错误: ${result.response.errmsg || result.response}`);
      }
      
      console.log('---');
      
      // 等待1秒避免频率限制
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ ${test.name} - 网络错误: ${error.message}`);
    }
  }
  
  console.log('\n💡 如果所有测试都失败，可能的原因:');
  console.log('1. 钉钉机器人使用了加签验证');
  console.log('2. 钉钉机器人设置了IP白名单');
  console.log('3. 机器人被禁用或删除');
  console.log('4. Webhook地址不正确');
}

runTests();