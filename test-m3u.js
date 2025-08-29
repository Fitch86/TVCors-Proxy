#!/usr/bin/env node

/**
 * M3U代理测试脚本
 * 测试不同M3U源的代理行为和Content-Type设置
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// 测试用M3U源
const testSources = [
  {
    name: '正常工作的M3U源',
    url: 'https://sub.ottiptv.cc/iptv.m3u',
    expectedToWork: true
  },
  {
    name: '可能下载的M3U源',
    url: 'https://live.zbds.org/tv/iptv4.m3u',
    expectedToWork: true
  },
  {
    name: '另一个测试源',
    url: 'https://tv-1.iill.top/m3u/Gather',
    expectedToWork: false // 可能有网络问题
  }
];

/**
 * 发送HTTP请求
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, (res) => {
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
 * 测试单个M3U源
 */
async function testM3USource(source) {
  console.log(`\n🧪 测试: ${source.name}`);
  console.log(`📡 源URL: ${source.url}`);
  
  try {
    // 构建代理URL
    const proxyUrl = `${BASE_URL}/api/proxy/m3u?url=${encodeURIComponent(source.url)}`;
    console.log(`🔄 代理URL: ${proxyUrl}`);
    
    // 发送请求
    const response = await makeRequest(proxyUrl);
    
    // 检查状态码
    console.log(`📊 状态码: ${response.status}`);
    
    // 检查关键响应头
    const contentType = response.headers['content-type'];
    const contentDisposition = response.headers['content-disposition'];
    const originalContentType = response.headers['x-original-content-type'];
    
    console.log(`📋 Content-Type: ${contentType}`);
    console.log(`📎 Content-Disposition: ${contentDisposition}`);
    console.log(`📄 X-Original-Content-Type: ${originalContentType}`);
    
    // 检查内容
    const isM3U = response.data.includes('#EXTM3U') || response.data.includes('#EXTINF');
    console.log(`✅ 包含M3U内容: ${isM3U ? '是' : '否'}`);
    
    if (isM3U) {
      const lines = response.data.split('\n').length;
      console.log(`📏 内容行数: ${lines}`);
      
      // 显示内容预览
      const preview = response.data.substring(0, 200);
      console.log(`👀 内容预览: ${preview}...`);
    }
    
    // 分析下载行为
    const willDownload = contentType && 
      (contentType.includes('application/x-mpegURL') || 
       contentType.includes('audio/x-mpegurl') ||
       (contentDisposition && contentDisposition.includes('attachment')));
    
    const shouldDisplay = contentType && contentType.includes('text/plain') && 
                         contentDisposition && contentDisposition.includes('inline');
    
    console.log(`💾 可能触发下载: ${willDownload ? '是' : '否'}`);
    console.log(`👁️  应该在浏览器显示: ${shouldDisplay ? '是' : '否'}`);
    
    return {
      name: source.name,
      success: response.status === 200,
      isM3U,
      contentType,
      willDownload,
      shouldDisplay
    };
    
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    return {
      name: source.name,
      success: false,
      error: error.message
    };
  }
}

/**
 * 主测试函数
 */
async function runM3UTests() {
  console.log('🎯 M3U代理下载行为测试');
  console.log('=' .repeat(50));
  
  // 检查服务器是否运行
  try {
    await makeRequest(`${BASE_URL}/`);
    console.log('✅ 服务器运行正常');
  } catch (error) {
    console.log('❌ 服务器未运行，请先启动: npm run dev');
    process.exit(1);
  }
  
  // 测试所有源
  const results = [];
  for (const source of testSources) {
    const result = await testM3USource(source);
    results.push(result);
    
    // 间隔1秒
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 总结
  console.log('\n📋 测试总结');
  console.log('=' .repeat(50));
  
  results.forEach(result => {
    if (result.success) {
      const status = result.shouldDisplay ? '🟢 应该正确显示' : 
                    result.willDownload ? '🔴 可能触发下载' : '🟡 状态不明';
      console.log(`${status} ${result.name}`);
    } else {
      console.log(`❌ 失败 ${result.name}: ${result.error || '未知错误'}`);
    }
  });
  
  console.log('\n💡 解决方案建议:');
  console.log('- 如果仍然下载，尝试在URL后添加 &display=text 参数');
  console.log('- 使用开发者工具检查Network面板的响应头');
  console.log('- 某些浏览器可能仍会根据文件扩展名判断下载行为');
}

// 运行测试
runM3UTests().catch(console.error);