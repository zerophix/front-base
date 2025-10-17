/**
 * 应用根页面 - 重定向到首页
 */

import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/home');
}
