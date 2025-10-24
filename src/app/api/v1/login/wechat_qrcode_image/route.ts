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
    
    // 构建微信二维码图片URL
    const wechatQrUrl = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(ticket)}`;
    
    try {
      // 获取微信二维码图片
      const response = await fetch(wechatQrUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`获取二维码失败: ${response.status}`);
      }

      const imageBuffer = await response.arrayBuffer();
      
      // 返回图片数据
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

    } catch (fetchError) {
      console.error('获取微信二维码图片失败:', fetchError);
      return NextResponse.json({
        code: '0001',
        message: '获取二维码图片失败'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('微信二维码图片代理失败:', error);
    return NextResponse.json({
      code: '0001',
      message: '服务器内部错误'
    }, { status: 500 });
  }
}