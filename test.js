#!/usr/bin/env node

/**
 * TVCors Proxy 功能测试脚本
 * 用于验证所有代理接口是否正常工作
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// 测试用例
const testCases = [
  {
    name: 'M3U8代理测试',
    path: '/api/proxy/m3u8',
    params: {
      url: encodeURIComponent('https://httpbin.org/get')
    },
    expectedStatus: 200
  },
  {
    name: 'M3U代理测试',
    path: '/api/proxy/m3u',
    params: {
      url: encodeURIComponent('https://httpbin.org/get')
    },
    expectedStatus: 200
  },
  {
    name: '视频片段代理测试',
    path: '/api/proxy/segment',
    params: {
      url: encodeURIComponent('https://httpbin.org/bytes/1024')
    },
    expectedStatus: 200
  },
  {
    name: '密钥代理测试',
    path: '/api/proxy/key',
    params: {
      url: encodeURIComponent('https://httpbin.org/bytes/16')
    },
    expectedStatus: 200
  },
  {
    name: '图片代理测试',
    path: '/api/proxy/logo',
    params: {
      url: encodeURIComponent('https://httpbin.org/image/png')
    },
    expectedStatus: 200
  },
  {
    name: 'Xtream代理测试',
    path: '/api/proxy/xtream',
    params: {
      url: encodeURIComponent('https://httpbin.org/get'),
      username: 'test',
      password: 'test'
    },
    expectedStatus: 200
  },
  {
    name: 'Stalker代理测试',
    path: '/api/proxy/stalker',
    params: {
      url: encodeURIComponent('https://httpbin.org/get'),
      macAddress: '00:1A:79:XX:XX:XX'
    },
    expectedStatus: 200
  }
];

// CORS头验证
const expectedCorsHeaders = [
  'Access-Control-Allow-Origin',
  'Access-Control-Allow-Methods',
  'Access-Control-Allow-Headers',
  'Access-Control-Expose-Headers'
];

/**
 * 发送HTTP请求
 */
function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * 验证CORS头
 */
function validateCorsHeaders(headers) {
  const corsIssues = [];
  
  expectedCorsHeaders.forEach(header => {
    const headerKey = header.toLowerCase();
    if (!headers[headerKey]) {
      corsIssues.push(`Missing header: ${header}`);
    }
  });
  
  // 检查特定的CORS值
  if (headers['access-control-allow-origin'] !== '*') {
    corsIssues.push('Access-Control-Allow-Origin should be "*"');
  }
  
  return corsIssues;
}

/**
 * 运行单个测试
 */
async function runTest(testCase) {
  console.log(`\n🧪 ${testCase.name}`);
  
  try {
    // 构建URL
    const queryParams = new URLSearchParams(testCase.params);
    const testUrl = `${BASE_URL}${testCase.path}?${queryParams}`;
    
    console.log(`   📡 GET ${testUrl}`);
    
    // 发送GET请求
    const response = await makeRequest(testUrl);
    
    // 验证状态码
    const statusOk = response.status === testCase.expectedStatus;
    console.log(`   📊 Status: ${response.status} ${statusOk ? '✅' : '❌'}`);
    
    // 验证CORS头
    const corsIssues = validateCorsHeaders(response.headers);
    if (corsIssues.length === 0) {
      console.log(`   🌐 CORS Headers: ✅`);
    } else {
      console.log(`   🌐 CORS Headers: ❌`);
      corsIssues.forEach(issue => console.log(`      - ${issue}`));
    }
    
    // 测试OPTIONS请求
    console.log(`   📡 OPTIONS ${testUrl}`);
    const optionsResponse = await makeRequest(testUrl, 'OPTIONS');
    const optionsOk = optionsResponse.status === 200;
    console.log(`   📊 OPTIONS Status: ${optionsResponse.status} ${optionsOk ? '✅' : '❌'}`);
    
    return {
      name: testCase.name,
      success: statusOk && corsIssues.length === 0 && optionsOk,
      issues: corsIssues
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      name: testCase.name,
      success: false,
      error: error.message
    };
  }
}

/**
 * 检查服务是否运行
 */
async function checkServerHealth() {
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * 主测试函数
 */
async function runAllTests() {
  console.log('🚀 TVCors Proxy 功能测试开始\n');
  console.log('📝 测试包括: M3U8、M3U、视频片段、密钥、图片、Xtream、Stalker代理\n');
  
  // 检查服务器是否运行
  console.log('🔍 检查服务器状态...');
  const serverRunning = await checkServerHealth();
  
  if (!serverRunning) {
    console.log('❌ 服务器未运行! 请先启动服务器: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ 服务器运行正常');
  
  // 运行所有测试
  const results = [];
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push(result);
  }
  
  // 总结结果
  console.log('\n📋 测试结果总结:');
  console.log('='.repeat(50));
  
  let successCount = 0;
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (result.success) successCount++;
    
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
    if (result.issues && result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`      Issue: ${issue}`));
    }
  });
  
  console.log('='.repeat(50));
  console.log(`📊 测试通过: ${successCount}/${results.length}`);
  
  if (successCount === results.length) {
    console.log('🎉 所有测试通过! TVCors Proxy 功能正常');
    process.exit(0);
  } else {
    console.log('⚠️  部分测试失败，请检查服务器配置');
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, makeRequest, validateCorsHeaders };