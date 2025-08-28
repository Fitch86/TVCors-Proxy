import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            TVCors Proxy
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            独立的CORS代理服务，专门用于视频流媒体的跨域代理
          </p>
        </div>

        <div className="mt-10">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  🎯 M3U8代理
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>支持HLS流媒体文件的代理和URL重写</p>
                </div>
                <div className="mt-3">
                  <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                    GET /api/proxy/m3u8?url={"<encoded_m3u8_url>"}&allowCORS={"<true|false>"}
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  🎬 视频片段代理
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>支持TS视频片段的流式代理</p>
                </div>
                <div className="mt-3">
                  <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                    GET /api/proxy/segment?url={"<encoded_segment_url>"}
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  🔑 密钥代理
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>支持HLS加密密钥的代理</p>
                </div>
                <div className="mt-3">
                  <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                    GET /api/proxy/key?url={"<encoded_key_url>"}
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  🖼️ 图片代理
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>支持Logo图片的代理</p>
                </div>
                <div className="mt-3">
                  <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                    GET /api/proxy/logo?url={"<encoded_image_url>"}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              ⚡ 功能特性
            </h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-green-500">✓</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">完整的跨域资源共享支持</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-green-500">✓</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">基于Next.js的现代架构</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-green-500">✓</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">高性能流式传输</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-green-500">✓</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">支持Docker容器化部署</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link 
            href="https://github.com/Fitch86/TVCors-Proxy" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            查看GitHub仓库
          </Link>
        </div>
      </div>
    </div>
  );
}