#!/usr/bin/env node

/**
 * TVCors Proxy 部署服务测试脚本
 * 用于测试 http://localhost:3001 的所有代理功能
 */

const https = require('https');

const DEPLOYMENT_URL = 'http://localhost:3001';

// 测试用例
const testCases = [
  {
    name: 'M3U代理测试 - 正常M3U文件',
    path: '/api/proxy/m3u',
    params: {
      url: encodeURIComponent('https://sub.ottiptv.cc/iptv.m3u')
    },
    expectedStatus: 200,
    checkContent: true
  },
  {
    name: 'M3U代理测试 - 可能有问题的源',
    path: '/api/proxy/m3u',
    params: {
      url: encodeURIComponent('https://live.zbds.org/tv/iptv4.m3u')
    },
    expectedStatus: [200, 502, 504], // 允许网络错误
    checkContent: false
  },
  {
    name: 'M3U代理测试 - 另一个源',
    path: '/api/proxy/m3u',
    params: {
      url: encodeURIComponent('https://tv-1.iill.top/m3u/Gather')
    },
    expectedStatus: [200, 502, 504],
    checkContent: false
  },
  {
    name: 'M3U8代理测试',
    path: '/api/proxy/m3u8',
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

/**
 * 发送HTTPS请求
 */
function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method }, (res) => {
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
    req.setTimeout(30000, () => {
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
  
  const expectedHeaders = [
    'access-control-allow-origin',
    'access-control-allow-methods',
    'access-control-allow-headers'
  ];
  
  expectedHeaders.forEach(header => {
    if (!headers[header]) {
      corsIssues.push(`Missing header: ${header}`);
    }
  });
  
  return corsIssues;
}

/**
 * 检查M3U内容
 */
function checkM3UContent(data) {
  if (typeof data !== 'string') return false;
  return data.includes('#EXTM3U') || data.includes('#EXTINF') || data.includes('http');
}

/**
 * 运行单个测试
 */
async function runTest(testCase) {
  console.log(`\n🧪 ${testCase.name}`);
  
  try {
    // 构建URL
    const queryParams = new URLSearchParams(testCase.params);
    const testUrl = `${DEPLOYMENT_URL}${testCase.path}?${queryParams}`;
    
    console.log(`   📡 GET ${testUrl}`);
    console.log(`   🎯 Target: ${decodeURIComponent(testCase.params.url)}`);
    
    // 发送GET请求
    const response = await makeRequest(testUrl);
    
    // 验证状态码
    const expectedStatuses = Array.isArray(testCase.expectedStatus) 
      ? testCase.expectedStatus 
      : [testCase.expectedStatus];
    
    const statusOk = expectedStatuses.includes(response.status);
    console.log(`   📊 Status: ${response.status} ${statusOk ? '✅' : '❌'}`);
    
    if (!statusOk) {
      console.log(`   ❌ Expected status: ${expectedStatuses.join(' or ')}`);
      if (response.data) {
        try {
          const errorData = JSON.parse(response.data);
          console.log(`   ❌ Error: ${errorData.error || errorData.message || 'Unknown error'}`);
          if (errorData.details) {
            console.log(`   📝 Details: ${errorData.details}`);
          }
        } catch (e) {
          console.log(`   📝 Response: ${response.data.substring(0, 200)}...`);
        }
      }
    }
    
    // 验证CORS头（仅当请求成功时）
    if (response.status === 200) {
      const corsIssues = validateCorsHeaders(response.headers);
      if (corsIssues.length === 0) {
        console.log(`   🌐 CORS Headers: ✅`);
      } else {
        console.log(`   🌐 CORS Headers: ❌`);
        corsIssues.forEach(issue => console.log(`      - ${issue}`));
      }
      
      // 检查M3U内容（如果需要）
      if (testCase.checkContent && testCase.path.includes('m3u')) {
        const isValidM3U = checkM3UContent(response.data);
        console.log(`   📄 M3U Content: ${isValidM3U ? '✅' : '❌'}`);
        if (isValidM3U) {
          const lines = response.data.split('\n').length;
          console.log(`   📊 Content Lines: ${lines}`);
        }
      }
      
      // 显示Content-Type
      const contentType = response.headers['content-type'] || 'unknown';
      console.log(`   📋 Content-Type: ${contentType}`);
    }
    
    // 测试OPTIONS请求（仅当GET成功时）
    if (response.status === 200) {
      console.log(`   📡 OPTIONS ${testUrl}`);
      try {
        const optionsResponse = await makeRequest(testUrl, 'OPTIONS');
        const optionsOk = optionsResponse.status === 200;
        console.log(`   📊 OPTIONS Status: ${optionsResponse.status} ${optionsOk ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`   📊 OPTIONS: ❌ ${error.message}`);
      }
    }
    
    return {
      name: testCase.name,
      success: statusOk,
      status: response.status,
      contentType: response.headers['content-type']
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
 * 检查服务是否在线
 */
async function checkServerHealth() {
  try {
    console.log('🔍 检查服务器状态...');
    const response = await makeRequest(`${DEPLOYMENT_URL}/`);
    console.log(`✅ 服务器响应: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    console.log(`❌ 服务器连接失败: ${error.message}`);
    return false;
  }
}

/**
 * 主测试函数
 */
async function runAllTests() {
  console.log('🚀 TVCors Proxy 部署服务测试开始');
  console.log(`🌍 测试目标: ${DEPLOYMENT_URL}\n`);
  
  // 检查服务器是否在线
  const serverRunning = await checkServerHealth();
  
  if (!serverRunning) {
    console.log('❌ 服务器不可访问，请检查部署状态');
    process.exit(1);
  }
  
  // 运行所有测试
  const results = [];
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push(result);
    
    // 在测试之间添加小延迟，避免过于频繁的请求
    await new Promise(resolve => setTimeout(resolve, 1000));
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
      console.log(`     Error: ${result.error}`);
    } else if (result.status) {
      console.log(`     Status: ${result.status}, Type: ${result.contentType || 'unknown'}`);
    }
  });
  
  console.log('='.repeat(50));
  console.log(`✅ 成功: ${successCount}/${results.length}`);
  console.log(`❌ 失败: ${results.length - successCount}/${results.length}`);
  
  if (successCount === results.length) {
    console.log('\n🎉 所有测试通过！部署服务运行正常。');
  } else {
    console.log('\n⚠️  部分测试失败，请检查错误信息。');
  }
}

// 运行测试
runAllTests().catch(console.error);