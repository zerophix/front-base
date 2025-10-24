import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 调用真实的后端API获取微信二维码
    const backendUrl = 'http://localhost:8080/api/v1/login/wechat_qrcode_url';
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (result.code === '0000') {
      // 成功获取二维码
      return NextResponse.json({
        code: '0000',
        message: '获取二维码成功',
        data: result.data
      });
    } else {
      // 获取失败
      return NextResponse.json({
        code: result.code || '0001',
        message: result.info || '获取二维码失败'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('获取微信二维码失败:', error);
    
    // 检查是否是网络连接错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({
        code: '0001',
        message: '无法连接到后端服务，请检查后端服务是否启动'
      }, { status: 503 });
    }

    return NextResponse.json({
      code: '0001',
      message: '获取二维码失败，服务器内部错误'
    }, { status: 500 });
  }
}