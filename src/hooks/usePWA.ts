import { useEffect, useState, useCallback } from 'react';
import { Workbox } from 'workbox-window';

/** 是否为生产环境 */
const IS_PROD = import.meta.env.PROD;

/** PWA 状态（桌面端：更新与离线提示） */
export interface PWAState {
  /** 是否运行在独立窗口 */
  installed: boolean;
  /** 是否有新版本待刷新 */
  updateReady: boolean;
  /** 网络状态 */
  online: boolean;
}

/**
 * 是否运行在独立窗口。
 * 在首次渲染时读一次，避免在 effect 中同步 setState 触发额外渲染。
 */
function detectInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(display-mode: standalone)').matches;
  } catch {
    return false;
  }
}

/**
 * PWA 核心 Hook
 * 提供：更新检测、在线/离线状态；使用 workbox-window 管理 SW 生命周期。
 */
export function usePWA() {
  const [state, setState] = useState<PWAState>(() => ({
    installed: detectInstalled(),
    updateReady: false,
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
  }));

  // 监听网络状态
  useEffect(() => {
    const online = () => setState((prev) => ({ ...prev, online: true }));
    const offline = () => setState((prev) => ({ ...prev, online: false }));
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  // workbox-window 管理 SW 注册与更新（仅生产环境）
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !IS_PROD) return;

    const wb = new Workbox('/sw.js');

    // SW 已安装并激活
    wb.addEventListener('installed', () => {
      console.log('[SW] 安装完成，可离线使用');
    });

    // SW 等待激活（页面有旧版本在运行）
    wb.addEventListener('waiting', () => {
      console.log('[SW] 新版本等待激活');
      setState((prev) => ({ ...prev, updateReady: true }));
    });

    // SW 控制器变更（已刷新）
    wb.addEventListener('controlling', () => {
      console.log('[SW] 控制器已更新');
      setState((prev) => ({ ...prev, updateReady: false }));
    });

    wb.register().catch((err) => console.warn('[SW] 注册失败:', err));
  }, []);

  // 刷新应用（应用 SW 更新）
  const refresh = useCallback(() => {
    window.location.reload();
  }, []);

  // 检查 SW 更新
  const checkUpdate = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.update();
    }
  }, []);

  return {
    ...state,
    refresh,
    checkUpdate,
    /** 是否显示更新提示 */
    showUpdatePrompt: state.updateReady,
  };
}

/**
 * 简化版：仅用于在组件中显示更新/离线提示
 *
 * 显示状态由上游状态派生，不在 effect 中同步 setState。
 */
export function usePWANotifications() {
  const { updateReady, online, refresh, installed } = usePWA();

  // 更新提示：由 updateReady 派生，玩家可手动关闭一次（刷新后自然重置）
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const showUpdateToast = updateReady && !updateDismissed;

  // 离线提示：直接派生，不需要额外状态
  const showOfflineToast = !online;

  return {
    showUpdateToast,
    dismissUpdateToast: () => setUpdateDismissed(true),
    applyUpdate: refresh,
    showOfflineToast,
    installed,
  };
}
