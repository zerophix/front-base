import { middleware } from '@/middleware';

// 在 Jest 环境下 mock NextResponse，避免对 Web Request 的依赖
jest.mock('next/server', () => {
  const createHeaders = (entries: Array<[string, string]> = []) => {
    const store = new Map<string, string>(entries);
    return {
      get: (key: string): string | null => (store.has(key) ? store.get(key)! : null),
      set: (key: string, value: string): void => { store.set(key, value); },
    } as { get: (k: string) => string | null; set: (k: string, v: string) => void };
  };
  return {
    NextResponse: {
      redirect: (url: URL | any | string, status: number) => {
        const location =
          typeof url === 'string'
            ? url
            : url?.pathname ?? (typeof url?.toString === 'function' ? url.toString() : '');
        return { status, headers: createHeaders([['Location', location]]) } as any;
      },
      next: () => ({ status: 200, headers: createHeaders() }) as any,
    },
  };
});

function createRequest(pathname: string) {
  const url = { pathname, clone() { return { pathname: this.pathname } as any; } } as any;
  return { nextUrl: url } as any;
}

describe('middleware redirects old equipment quality paths', () => {
  it('redirects /quality/equipment-xxx -> /equipment/xxx', () => {
    const req = createRequest('/quality/equipment-periodic-plan');
    const res = middleware(req);
    expect(res.status).toBe(308);
    // NextResponse.redirect sets Location header to the new URL
    const location = res.headers.get('Location') || res.headers.get('location');
    expect(location).toContain('/equipment/periodic-plan');
  });

  it('does not redirect unrelated quality paths', () => {
    const req = createRequest('/quality/std-periodic-plan');
    const res = middleware(req);
    // next response has no Location header
    const location = res.headers.get('Location') || res.headers.get('location');
    expect(location).toBeNull();
    expect(res.status).toBe(200);
  });
});