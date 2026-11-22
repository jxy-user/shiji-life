import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock workbox-window
class MockWorkbox {
  addEventListener = vi.fn();
  register = vi.fn().mockResolvedValue(undefined);
}

vi.mock('workbox-window', () => ({
  Workbox: MockWorkbox,
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    ready: Promise.resolve({ update: vi.fn().mockResolvedValue(undefined) }),
  },
  configurable: true,
});

describe('usePWA hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('初始状态：未安装、不可安装、无更新、在线', async () => {
    const { result } = await import('@/hooks/usePWA').then(m => renderHook(() => m.usePWA()));
    // 等待 effect 完成
    await waitFor(() => {
      expect(result.current.installed).toBe(false);
      expect(result.current.installable).toBe(false);
      expect(result.current.updateReady).toBe(false);
      expect(result.current.online).toBe(true);
    });
  });

  it('安装后显示 installed=true', async () => {
    // Mock standalone 模式
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }));

    const { usePWA } = await import('@/hooks/usePWA');
    const { result } = renderHook(() => usePWA());

    await waitFor(() => {
      expect(result.current.installed).toBe(true);
    });
  });

  it('离线/在线状态切换', async () => {
    const { usePWA } = await import('@/hooks/usePWA');
    const { result } = renderHook(() => usePWA());

    await waitFor(() => {
      expect(result.current.online).toBe(true);
    });

    // 模拟离线
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(result.current.online).toBe(false);
    });

    // 模拟在线
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.online).toBe(true);
    });
  });

  it('beforeinstallprompt 设置 installable 与 deferredPrompt', async () => {
    const { usePWA } = await import('@/hooks/usePWA');
    const { result } = renderHook(() => usePWA());

    await waitFor(() => {
      expect(result.current.installable).toBe(false);
    });

    const mockPrompt = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    };

    act(() => {
      window.dispatchEvent(new CustomEvent('beforeinstallprompt', { detail: mockPrompt }));
    });

    await waitFor(() => {
      expect(result.current.installable).toBe(true);
      expect(result.current.deferredPrompt).toBeTruthy();
    });
  });

  it('install() 调用 prompt 并返回 accepted', async () => {
    const { usePWA } = await import('@/hooks/usePWA');
    const { result } = renderHook(() => usePWA());

    const mockPrompt = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    };

    act(() => {
      // 直接触发 handler 逻辑：e.preventDefault(); setState({ deferredPrompt: e })
      // 这里 e 是 CustomEvent，但 handler 期望 e.prompt 存在
      // 所以我们需要让 CustomEvent 拥有 prompt 方法
      const event = new CustomEvent('beforeinstallprompt', { detail: mockPrompt });
      Object.assign(event, mockPrompt); // 把 prompt 等方法赋给 event 对象
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(result.current.installable).toBe(true);
    });

    // 确保 deferredPrompt 有正确的方法
    expect(result.current.deferredPrompt?.prompt).toBeDefined();

    let installResult: boolean | undefined;
    await act(async () => {
      installResult = await result.current.install();
    });

    expect(installResult).toBe(true);
    expect(result.current.installable).toBe(false);
  });

  it('refresh() 触发 reload', async () => {
    const { usePWA } = await import('@/hooks/usePWA');
    const { result } = renderHook(() => usePWA());

    // 使用 vi.stubGlobal 模拟 window.location.reload
    const reloadSpy = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload: reloadSpy });

    act(() => {
      result.current.refresh();
    });

    expect(reloadSpy).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('checkUpdate() 调用 SW update', async () => {
    const { usePWA } = await import('@/hooks/usePWA');
    const { result } = renderHook(() => usePWA());

    const mockReg = { update: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(navigator.serviceWorker, 'ready', 'get').mockResolvedValue(mockReg as any);

    await act(async () => {
      await result.current.checkUpdate();
    });

    expect(mockReg.update).toHaveBeenCalled();
  });
});