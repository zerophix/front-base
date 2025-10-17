import type { Metadata } from "next";
import { AntdProvider } from './providers';
import AntdRegistry from './AntdRegistry';
import PerformanceMonitor from './PerformanceMonitor';
import { PreloadStrategy } from '@/components/common/PreloadStrategy';
import "./globals.css";

export const metadata: Metadata = {
  title: "LIMS",
  description: "实验室信息管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <AntdProvider>
            {children}
            <PreloadStrategy />
          </AntdProvider>
        </AntdRegistry>
        <PerformanceMonitor />
      </body>
    </html>
  );
}
