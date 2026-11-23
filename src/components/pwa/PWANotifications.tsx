import { usePWANotifications } from '@/hooks/usePWA';
import { PWA_INSTALL_DISMISSED_KEY, writePreference } from '@/services/preferences';

/** PWA 状态通知组件（更新就绪、离线、安装引导） */
export function PWANotifications() {
  const {
    showUpdateToast,
    dismissUpdateToast,
    applyUpdate,
    showOfflineToast,
    showInstallBanner,
    setShowInstallBanner,
    install,
  } = usePWANotifications();

  // 同一时间只显示一个提示，优先级：更新就绪 > 离线 > 安装引导。
  // 堆叠会遮挡页面底部操作区，且移动端屏幕更小。
  const activeToast = showUpdateToast
    ? 'update'
    : showOfflineToast
      ? 'offline'
      : showInstallBanner
        ? 'install'
        : null;

  if (!activeToast) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-[380px] lg:px-0 lg:pb-0"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex flex-col gap-3 pointer-events-auto">

        {/* 更新就绪 */}
        {activeToast === 'update' && (
          <div className="mx-auto max-w-md animate-slide-up rounded-2xl border border-gold-300 bg-cream-50/95 p-4 shadow-[0_20px_50px_-25px_rgba(43,38,33,0.4)] backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 text-gold-600">🔄</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900">有新版本可用</p>
                <p className="mt-1 text-xs text-ink-600">刷新页面即可体验最新内容，您的进度已自动保存。</p>
              </div>
              <div className="flex flex-col gap-2 ml-2">
                <button
                  onClick={applyUpdate}
                  className="whitespace-nowrap rounded-lg bg-sun-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-sun-800 transition-colors"
                >
                  立即刷新
                </button>
                <button
                  onClick={dismissUpdateToast}
                  className="whitespace-nowrap rounded-lg bg-ink-50 px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-100 transition-colors"
                >
                  稍后
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 离线提示 */}
        {activeToast === 'offline' && (
          <div className="mx-auto max-w-md animate-slide-up rounded-2xl border border-rose-200 bg-rose-50/95 p-4 shadow-[0_20px_50px_-25px_rgba(43,38,33,0.4)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 text-rose-600">📡</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-rose-900">您当前处于离线状态</p>
                <p className="mt-1 text-xs text-rose-700">游戏可继续游玩，数据仅保存在本设备，联网后自动保持可用。</p>
              </div>
            </div>
          </div>
        )}

        {/* 安装引导 */}
        {activeToast === 'install' && (
          <div className="mx-auto max-w-md animate-slide-up rounded-2xl border border-forest-300 bg-forest-50/95 p-4 shadow-[0_20px_50px_-25px_rgba(43,38,33,0.4)] backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 text-forest-600">📱</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-forest-900">安装「拾己 · LIFE」</p>
                <p className="mt-1 text-xs text-forest-700">添加到主屏幕，像原生应用一样全屏体验，离线也能玩。</p>
              </div>
              <div className="flex flex-col gap-2 ml-2">
                <button
                  onClick={async () => {
                    await install();
                    writePreference(PWA_INSTALL_DISMISSED_KEY, 'true');
                    setShowInstallBanner(false);
                  }}
                  className="whitespace-nowrap rounded-lg bg-forest-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-forest-800 transition-colors"
                >
                  安装
                </button>
                <button
                  onClick={() => {
                    writePreference(PWA_INSTALL_DISMISSED_KEY, 'true');
                    setShowInstallBanner(false);
                  }}
                  className="whitespace-nowrap rounded-lg bg-ink-50 px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-100 transition-colors"
                >
                  不了
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/** 手动安装按钮（可放在设置页等位置） */
export function InstallButton() {
  const { installable, installed, install } = usePWANotifications();

  if (installed || !installable) return null;

  return (
    <button
      onClick={install}
      className="inline-flex items-center gap-2 rounded-lg bg-forest-700 px-4 py-2 text-sm font-medium text-white hover:bg-forest-800 transition-colors"
      aria-label="安装应用"
    >
      <span>📱</span>
      安装到主屏幕
    </button>
  );
}