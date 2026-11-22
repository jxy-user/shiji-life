import { useEffect, useState, useCallback } from 'react';

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
  interface WindowEventMap {
    'sw-update-ready': CustomEvent<never>;
  }
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }
}

/**
 * PWA 核心 Hook
 * 提供：安装状态、更新检测、在线/离线、手动安装触发
 */
export function usePWA() {
  const [state, setState] = useState<PWAState>({
    installable: false,
    installed: false,
    updateReady: false,
    online: navigator.onLine,
    deferredPrompt: null,
  });

  // 检测是否已安装（standalone 模式）
  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setState(prev => ({ ...prev, installed: isInstalled }));
  }, []);

  // 监听 beforeinstallprompt（Chrome/Edge）
  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault(); // 防止浏览器自动弹窗，由我们控制时机
      setState(prev => ({ ...prev, installable: true, deferredPrompt: e }));
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  // 监听网络状态
  useEffect(() => {
    const online = () => setState(prev => ({ ...prev, online: true }));
    const offline = () => setState(prev => ({ ...prev, online: false }));
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  // 监听 SW 更新就绪
  useEffect(() => {
    const handler = () => setState(prev => ({ ...prev, updateReady: true }));
    window.addEventListener('sw-update-ready', handler);
    return () => window.removeEventListener('sw-update-ready', handler);
  }, []);

  // 手动触发安装
  const install = useCallback(async () => {
    if (!state.deferredPrompt) return false;
    await state.deferredPrompt.prompt();
    const { outcome } = await state.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setState(prev => ({ ...prev, installable: false, deferredPrompt: null }));
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
 */
export function usePWANotifications() {
  const { updateReady, online, refresh, showInstallPrompt, install, installable, installed } = usePWA();
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    if (updateReady) setShowUpdateToast(true);
  }, [updateReady]);

  useEffect(() => {
    if (!online) setShowOfflineToast(true);
    else setShowOfflineToast(false);
  }, [online]);

  return {
    showUpdateToast,
    dismissUpdateToast: () => setShowUpdateToast(false),
    applyUpdate: refresh,
    showOfflineToast,
    showInstallPrompt,
    install,
    installable,
    installed,
  };
}