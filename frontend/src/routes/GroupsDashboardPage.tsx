import { Link } from "react-router-dom"
import { GroupCard } from "../components/groups/GroupCard"
import { EmptyState } from "../components/ui/EmptyState"
import { Spinner } from "../components/ui/Spinner"
import { useGroupsList } from "../hooks/useGroups"

export function GroupsDashboardPage() {
  const { data: groups, isLoading, isError } = useGroupsList()

  return (
    <div className="px-4 pb-4 pt-6">
      <h1 className="mb-4 text-2xl font-extrabold text-slate-900">Your groups</h1>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {isError && <p className="text-sm text-owing">Couldn't load your groups. Pull to refresh.</p>}

      {groups && groups.length === 0 && (
        <EmptyState
          icon="🎉"
          title="No groups yet"
          subtitle="Start one to split your first expense."
          action={
            <Link to="/groups/new" className="font-semibold text-brand-600">
              Create a group →
            </Link>
          }
        />
      )}

      <div className="space-y-3">
        {groups?.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  )
}
