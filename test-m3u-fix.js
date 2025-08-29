#!/usr/bin/env node

/**
 * 测试M3U代理Content-Type修改效果
 * 验证是否解决了浏览器下载文件的问题
 */

const http = require('http');

// 测试URL
const testUrl = 'http://localhost:3001/api/proxy/m3u?url=' + 
  encodeURIComponent('https://live.zbds.org/tv/iptv4.m3u');

console.log('🧪 测试M3U代理Content-Type修改效果');
console.log(`📡 测试URL: ${testUrl}`);
console.log('=' .repeat(60));

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
    req.setTimeout(35000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function testM3UProxy() {
  try {
    console.log('📡 发送请求...');
    const response = await makeRequest(testUrl);
    
    console.log(`📊 响应状态: ${response.status}`);
    console.log('📋 关键响应头:');
    console.log(`   Content-Type: ${response.headers['content-type'] || '未设置'}`);
    
    console.log('\n📄 响应内容分析:');
    if (response.data) {
      try {
        // 尝试解析JSON响应
        const jsonData = JSON.parse(response.data);
        console.log(`   响应格式: JSON ✅`);
        console.log(`   包含payload: ${jsonData.payload ? '✅' : '❌'}`);
        console.log(`   原始Content-Type: ${jsonData.contentType || '未知'}`);
        console.log(`   是否为M3U: ${jsonData.isM3U ? '✅' : '❌'}`);
        console.log(`   目标URL: ${jsonData.url || '未知'}`);
        
        if (jsonData.payload) {
          const lines = jsonData.payload.split('\n');
          console.log(`   Payload行数: ${lines.length}`);
          console.log(`   Payload长度: ${jsonData.payload.length} 字符`);
          
          const isM3U = jsonData.payload.includes('#EXTM3U') || jsonData.payload.includes('#EXTINF');
          console.log(`   包含M3U标识: ${isM3U ? '✅' : '❌'}`);
          
          console.log('\n📝 Payload预览 (前3行):');
          lines.slice(0, 3).forEach((line, index) => {
            console.log(`   ${index + 1}: ${line}`);
          });
        }
      } catch (e) {
        console.log(`   响应格式: 非JSON`);
        console.log(`   内容长度: ${response.data.length} 字符`);
        console.log(`   内容预览: ${response.data.substring(0, 200)}...`);
      }
    } else {
      console.log('   ❌ 没有返回内容');
    }
    
    console.log('\n🔍 新实现分析:');
    const contentType = response.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      console.log('✅ Content-Type设置为application/json，遵循用户提供的工作示例');
      
      try {
        const jsonData = JSON.parse(response.data);
        if (jsonData.payload) {
          console.log('✅ 返回JSON格式: { payload: ... }，完全遵循示例模式');
          console.log('✅ 浏览器将显示JSON内容而不是下载文件');
        } else {
          console.log('❌ JSON格式不完整，缺少payload字段');
        }
      } catch (e) {
        console.log('❌ JSON解析失败');
      }
    } else {
      console.log(`❌ Content-Type不正确: ${contentType}`);
    }
    
    console.log('\n🎯 修改效果总结:');
    const isJsonResponse = contentType.includes('application/json');
    
    if (isJsonResponse) {
      console.log('✅ 已采用JSON格式返回，参考用户提供的工作示例');
      console.log('✅ 浏览器将显示格式化的JSON内容而不是下载');
      console.log('📝 如需查看M3U内容，请访问下面URL并查看payload字段:');
      console.log(`   ${testUrl}`);
    } else {
      console.log('❌ 响应格式可能有问题，需要进一步调试');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 提示: 请确保开发服务器正在运行 (npm run dev)');
    }
  }
}

// 运行测试
testM3UProxy();