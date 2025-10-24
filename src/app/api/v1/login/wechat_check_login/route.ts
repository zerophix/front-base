import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticket = searchParams.get('ticket');
    
    if (!ticket) {
      return NextResponse.json({
        code: '0002',
        message: '缺少ticket参数'
      }, { status: 400 });
    }
    
    // 调用真实的后端API检查微信登录状态
    const backendUrl = `http://localhost:8080/api/v1/login/wechat_check_login?ticket=${encodeURIComponent(ticket)}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (result.code === '0000') {
      // 登录成功
      return NextResponse.json({
        code: '0000',
        message: '登录成功',
        data: result.data // 这里是后端返回的openIdTicket或用户信息
      });
    } else if (result.code === '0003') {
      // 用户尚未扫码登录
      return NextResponse.json({
        code: '0003',
        message: '用户尚未扫码登录'
      });
    } else {
      // 其他错误
      return NextResponse.json({
        code: result.code || '0001',
        message: result.info || '检查登录状态失败'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('检查微信登录状态失败:', error);
    
    // 检查是否是网络连接错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({
        code: '0001',
        message: '无法连接到后端服务，请检查后端服务是否启动'
      }, { status: 503 });
    }

    return NextResponse.json({
      code: '0001',
      message: '检查登录状态失败，服务器内部错误'
    }, { status: 500 });
  }
}