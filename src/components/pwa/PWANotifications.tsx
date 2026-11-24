import { Icon } from '@/components/ui/Icon';
import { usePWANotifications } from '@/hooks/usePWA';

/** PWA 状态通知（桌面端：更新就绪、离线） */
export function PWANotifications() {
  const { showUpdateToast, dismissUpdateToast, applyUpdate, showOfflineToast } =
    usePWANotifications();

  // 同一时间只显示一个提示，更新优先
  const activeToast = showUpdateToast
    ? 'update'
    : showOfflineToast
      ? 'offline'
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
        {activeToast === 'update' && (
          <div className="mx-auto max-w-md animate-slide-up rounded-2xl border border-gold-300 bg-cream-50/95 p-4 shadow-[0_8px_24px_-16px_rgba(43,38,33,0.25)] backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 text-gold-600">
                <Icon name="refresh" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900">有新版本可用</p>
                <p className="mt-1 text-xs text-ink-500">
                  刷新页面即可体验最新内容，您的进度已自动保存。
                </p>
              </div>
              <div className="flex flex-col gap-2 ml-2">
                <button
                  onClick={applyUpdate}
                  className="whitespace-nowrap rounded-lg bg-gold-500 px-3 py-1.5 text-xs font-semibold text-cream-50 hover:bg-gold-400 transition-colors"
                >
                  立即刷新
                </button>
                <button
                  onClick={dismissUpdateToast}
                  className="whitespace-nowrap rounded-lg border border-sand-300 px-3 py-1.5 text-xs font-medium text-ink-500 hover:text-ink-900 transition-colors"
                >
                  稍后
                </button>
              </div>
            </div>
          </div>
        )}

        {activeToast === 'offline' && (
          <div className="mx-auto max-w-md animate-slide-up rounded-2xl border border-rose-500/40 bg-[#2a1216]/95 p-4 shadow-[0_8px_24px_-16px_rgba(43,38,33,0.25)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 text-rose-300">
                <Icon name="offline" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-rose-200">您当前处于离线状态</p>
                <p className="mt-1 text-xs text-rose-300">
                  游戏可继续游玩，数据仅保存在本设备，联网后自动保持可用。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
