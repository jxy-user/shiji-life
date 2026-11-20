import { Navigate, Route, Routes } from 'react-router-dom'

import PlaceholderPage from '@/pages/PlaceholderPage'
import StartPage from '@/pages/StartPage'

/**
 * 路由表（M0）
 * 完整页面按 M1–M5 逐步替换占位页，路由路径先固定下来，
 * 避免后续页面跳转反复改名。
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />

      <Route
        path="/prologue"
        element={
          <PlaceholderPage
            kicker="开场"
            title="一封没有寄出的信"
            description="雨声、陌生的房间、没有写完的句子。你会在这里第一次听见这座城市的呼吸。"
          />
        }
      />
      <Route
        path="/create"
        element={
          <PlaceholderPage
            kicker="角色"
            title="你想怎样被称呼"
            description="昵称、形象，以及此刻的你。所有问题都可以跳过，全部作答也不是义务。"
          />
        }
      />
      <Route
        path="/city"
        element={
          <PlaceholderPage
            kicker="城市"
            title="未完成之城"
            description="中央广场、家、校园、街区、工作室、公园、远方。有些地方亮着灯，有些还在建造。"
          />
        }
      />
      <Route
        path="/archive"
        element={
          <PlaceholderPage
            kicker="档案"
            title="人生档案"
            description="你经历的事，以及你亲口确认的、关于自己的认识。未确认的猜测不会出现在这里。"
          />
        }
      />
      <Route
        path="/journal"
        element={
          <PlaceholderPage
            kicker="日记"
            title="只写给自己看"
            description="默认不进入任何分析。你写下的内容属于你，随时可以修改或删除。"
          />
        }
      />
      <Route
        path="/actions"
        element={
          <PlaceholderPage
            kicker="行动"
            title="带回到现实"
            description="从一条确认过的认知出发，做一件小事。没完成也没关系，可以暂停，也可以放弃。"
          />
        }
      />
      <Route
        path="/settings"
        element={
          <PlaceholderPage
            kicker="设置"
            title="由你决定"
            description="AI 分析授权、邀请频率、数据删除与导出。所有开关的最终解释权在你。"
          />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
