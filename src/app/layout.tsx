import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TVCors Proxy',
  description: '独立的CORS代理服务，专门用于视频流媒体的跨域代理',
  keywords: ['cors', 'proxy', 'video', 'streaming', 'm3u8', 'hls'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}