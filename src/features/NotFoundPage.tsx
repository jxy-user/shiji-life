import { useNavigate } from 'react-router-dom'
import { EmptyPaper, PaperButton } from '../components/g/GPrimitives'
import { PageHeading } from '../components/shell/Shell'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return <><PageHeading code="ARCHIVE / 404" title="这一页还没有被命名" description="地址可能已经改变，或这张纸被风吹走了。" /><EmptyPaper title="没有找到这张纸" description="回到开始页，重新选择一条已经命名的路。" action={<PaperButton onClick={() => navigate('/')}>回到开始页</PaperButton>} /></>
}
