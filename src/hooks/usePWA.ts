import { useEffect, useState, useCallback } from 'react';
import { Workbox } from 'workbox-window';

import { PWA_INSTALL_DISMISSED_KEY, readPreference } from '@/services/preferences';

export { PWA_INSTALL_DISMISSED_KEY };

/** 是否为生产环境 */
const IS_PROD = import.meta.env.PROD;

/** PWA 状态 */
export interface PWAState {
  /** 是否可安装 */
  installable: boolean;
  /** 是否已安装（运行在 standalone 模式） */
  installed: boolean;
  /** 是否有新版本待刷新 */
  updateReady: boolean;
  /** 网络状态 */
  online: boolean;
  /** 安装提示事件（用于手动触发安装） */
  deferredPrompt: BeforeInstallPromptEvent | null;
}

/** 扩展 Window 类型 */
declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }
}

/**
 * 是否运行在独立窗口（已安装）。
 * 在首次渲染时读一次，避免在 effect 中同步 setState 触发额外渲染。
 */
function detectInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

/**
 * PWA 核心 Hook
 * 提供：安装状态、更新检测、在线/离线、手动安装触发
 * 使用 workbox-window 管理 SW 生命周期（仅生产环境注册）
 */
export function usePWA() {
  const [state, setState] = useState<PWAState>(() => ({
    installable: false,
    installed: detectInstalled(),
    updateReady: false,
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
    deferredPrompt: null,
  }));

  // 监听 beforeinstallprompt（Chrome/Edge）
  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault(); // 防止浏览器自动弹窗，由我们控制时机
      setState((prev) => ({ ...prev, installable: true, deferredPrompt: e }));
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

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

    // SW 已安装并激活（有新版本就绪）
    wb.addEventListener('installed', (event) => {
      if (!event.isUpdate) {
        console.log('[SW] 首次安装完成，可离线使用');
      } else {
        console.log('[SW] 新版本就绪，请刷新');
        setState((prev) => ({ ...prev, updateReady: true }));
      }
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

    // 注册 SW
    wb.register().catch((err) => console.warn('[SW] 注册失败:', err));
  }, []);

  // 手动触发安装
  const install = useCallback(async () => {
    if (!state.deferredPrompt) return false;
    await state.deferredPrompt.prompt();
    const { outcome } = await state.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setState((prev) => ({ ...prev, installable: false, deferredPrompt: null }));
    }
    return outcome === 'accepted';
  }, [state.deferredPrompt]);

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
    install,
    refresh,
    checkUpdate,
    /** 是否显示安装引导（可安装且未安装且在线） */
    showInstallPrompt: state.installable && !state.installed && state.online,
    /** 是否显示更新提示 */
    showUpdatePrompt: state.updateReady,
  };
}

/**
 * 简化版：仅用于在组件中显示更新/离线提示
 *
 * 显示状态全部由上游状态派生，不在 effect 中同步 setState；
 * 「不再提示安装」的偏好通过安全读写，存储不可用时按未关闭处理。
 */
export function usePWANotifications() {
  const { updateReady, online, refresh, showInstallPrompt, install, installable, installed } =
    usePWA();

  // 更新提示：由 updateReady 派生，玩家可手动关闭一次（刷新后自然重置）
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const showUpdateToast = updateReady && !updateDismissed;

  // 离线提示：直接派生，不需要额外状态
  const showOfflineToast = !online;

  // 安装引导：延迟 3 秒显示，避免首屏干扰；读取失败按「未关闭」处理
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  useEffect(() => {
    if (!showInstallPrompt || installed) return;
    if (readPreference(PWA_INSTALL_DISMISSED_KEY) === 'true') return;
    const timer = setTimeout(() => setShowInstallBanner(true), 3000);
    return () => clearTimeout(timer);
  }, [showInstallPrompt, installed]);

  return {
    showUpdateToast,
    dismissUpdateToast: () => setUpdateDismissed(true),
    applyUpdate: refresh,
    showOfflineToast,
    showInstallPrompt,
    showInstallBanner,
    setShowInstallBanner,
    install,
    installable,
    installed,
  };
}
