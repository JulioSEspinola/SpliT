import { PageHeader } from "../components/layout/PageHeader"
import { Avatar } from "../components/ui/Avatar"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { useAuth } from "../context/AuthContext"

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const name = (user?.user_metadata?.name as string) || user?.email || "You"

  return (
    <div>
      <PageHeader title="Profile" />
      <div className="space-y-4 px-4 py-4">
        <Card className="flex items-center gap-3">
          <Avatar name={name} size={48} />
          <div>
            <p className="font-semibold text-slate-900">{name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </Card>

        <Button variant="secondary" fullWidth onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
