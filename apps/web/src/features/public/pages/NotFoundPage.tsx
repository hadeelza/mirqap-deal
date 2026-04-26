import { Link } from 'react-router-dom'
import { Button } from '@/core/components/ui/Button'
import { Card } from '@/core/components/ui/Card'

export function NotFoundPage() {
  return (
    <div className="center-page">
      <Card className="not-found-card">
        <h1>404</h1>
        <p>الصفحة غير موجودة</p>
        <Link to="/">
          <Button>العودة للرئيسية</Button>
        </Link>
      </Card>
    </div>
  )
}