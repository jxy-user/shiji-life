import { Navigate, Route, Routes } from 'react-router-dom'

import CityPage from '@/pages/CityPage'
import CreatePage from '@/pages/CreatePage'
import PlaceholderPage from '@/pages/PlaceholderPage'
import ProloguePage from '@/pages/ProloguePage'
import ScenePage from '@/pages/ScenePage'
import StartPage from '@/pages/StartPage'

/**
 * 路由表
 *
 * 已实现：开始页、开场、角色创建、城市、区域场景。
 * 仍在建造：人生档案、日记、现实行动、设置（M3–M5）。
 * 地址形态为 #/path，原因见 main.tsx。
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />

      <Route path="/prologue" element={<ProloguePage />} />
      <Route path="/create" element={<CreatePage />} />
      <Route path="/city" element={<CityPage />} />
      <Route path="/scene/:sceneId" element={<ScenePage />} />

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
