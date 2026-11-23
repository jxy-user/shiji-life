import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { StatusBar } from '@/components/layout/StatusBar'
import { useGameStore } from '@/stores/useGameStore'

/**
 * 设置（M2 版本）
 *
 * 只放两类东西：分析授权的默认值、以及删除数据。
 * 所有开关都只影响「之后」的行为，不会暗中改写已有经历。
 */
export default function SettingsPage() {
  const navigate = useNavigate()
  const save = useGameStore((state) => state.save)
  const setAnalysisConsentDefault = useGameStore((state) => state.setAnalysisConsentDefault)
  const setInvitationsEnabled = useGameStore((state) => state.setInvitationsEnabled)
  const resetProgress = useGameStore((state) => state.resetProgress)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteFailed, setDeleteFailed] = useState(false)

  if (!save) return <Navigate to="/" replace />

  const defaultConsent = save.settings.analysisConsentDefault

  function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    if (resetProgress()) {
      navigate('/', { replace: true })
    } else {
      setDeleteFailed(true)
      setConfirmingDelete(false)
    }
  }

  return (
    <main className="min-h-dvh bg-cream-50 pb-20">
      <StatusBar save={save} title="设置" />

      <div className="mx-auto w-full max-w-2xl px-5 pt-8 lg:max-w-3xl">
        <p className="text-[11px] tracking-[0.4em] text-gold-600">设置</p>
        <h1 className="mt-3 font-display text-3xl tracking-[0.04em] text-ink-900">
          由你决定
        </h1>

        <section className="mt-10">
          <h2 className="font-display text-lg text-ink-900">回顾与授权</h2>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sand-300 bg-cream-50 p-4">
            <div className="max-w-sm">
              <p className="text-[14px] text-ink-900">新经历默认允许用于回顾</p>
              <p className="mt-1 text-[12px] leading-5 text-ink-500">
                默认关闭。打开后，只有之后新产生的经历会默认授权；
                已有经历不会因此改变，你在档案里仍可逐条撤回。
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={defaultConsent}
              aria-label="新经历默认允许用于回顾"
              onClick={() => setAnalysisConsentDefault(!defaultConsent)}
              className={[
                'relative h-7 w-12 shrink-0 rounded-full border transition-colors',
                defaultConsent
                  ? 'border-sage-500/60 bg-sage-500/70'
                  : 'border-sand-300 bg-cream-200',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-[3px] h-[22px] w-[22px] rounded-full bg-cream-50 shadow-sm transition-transform',
                  defaultConsent ? 'translate-x-6' : 'translate-x-0.5',
                ].join(' ')}
              />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sand-300 bg-cream-50 p-4">
            <div className="max-w-sm">
              <p className="text-[14px] text-ink-900">允许微光主动邀请回顾</p>
              <p className="mt-1 text-[12px] leading-5 text-ink-500">
                关闭后只记录经历，不会主动打扰。你仍然可以自己打开回顾。
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={save.settings.invitationsEnabled}
              aria-label="允许微光主动邀请回顾"
              onClick={() => setInvitationsEnabled(!save.settings.invitationsEnabled)}
              className={[
                'relative h-7 w-12 shrink-0 rounded-full border transition-colors',
                save.settings.invitationsEnabled
                  ? 'border-sage-500/60 bg-sage-500/70'
                  : 'border-sand-300 bg-cream-200',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-[3px] h-[22px] w-[22px] rounded-full bg-cream-50 shadow-sm transition-transform',
                  save.settings.invitationsEnabled ? 'translate-x-6' : 'translate-x-0.5',
                ].join(' ')}
              />
            </button>
          </div>

          <p className="mt-3 text-[11px] leading-5 text-ink-500">
            无论是否授权，游戏都不会在你做出普通选择后立刻分析你；
            回顾只会在经历积累到一定程度后由微光邀请。当前阈值：{save.settings.reflectionThreshold} 条经历、
            {save.settings.minExperienceTypes} 类经历（可配置的演示值，不是心理学标准）。
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-lg text-ink-900">数据</h2>

          <div className="mt-4 rounded-2xl border border-sand-300 bg-cream-50 p-4">
            <p className="text-[13px] leading-6 text-ink-700">
              你的进度、经历与认知全部保存在这台设备的浏览器里，没有上传到任何服务器。
              清除浏览器的网站数据会一并删除它们。
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDelete}
                className={[
                  'rounded-full px-4 py-2 text-[12px] transition-colors',
                  confirmingDelete
                    ? 'bg-ink-900 text-cream-50'
                    : 'border border-sand-300 text-ink-700 hover:border-gold-400',
                ].join(' ')}
              >
                {confirmingDelete ? '再次点击，确认删除全部数据' : '删除全部数据'}
              </button>
              {confirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="text-[12px] text-ink-500 transition-colors hover:text-ink-900"
                >
                  取消
                </button>
              ) : null}
            </div>

            {deleteFailed ? (
              <p role="alert" className="mt-3 text-[12px] text-ink-700">
                删除失败：浏览器拒绝了存储访问。数据没有被清除，你可以稍后再试。
              </p>
            ) : null}
          </div>
        </section>

        <div className="mt-10 flex flex-wrap gap-4 text-[12px] text-ink-500">
          <Link to="/city" className="transition-colors hover:text-ink-900">
            回到城市
          </Link>
          <Link to="/archive" className="transition-colors hover:text-ink-900">
            人生档案
          </Link>
        </div>
      </div>
    </main>
  )
}
