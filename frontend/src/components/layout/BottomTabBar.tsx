import { matchPath, NavLink, useLocation, useNavigate } from "react-router-dom"

function TabLink({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `tap-target flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1 text-xs font-medium ${
          isActive ? "text-brand-600" : "text-slate-400"
        }`
      }
    >
      <span className="text-xl leading-none">{icon}</span>
      {label}
    </NavLink>
  )
}

export function BottomTabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const groupMatch = matchPath("/groups/:groupId/*", location.pathname)
  const groupId = groupMatch?.params.groupId

  const centerAction = groupId
    ? { label: "Add expense", onClick: () => navigate(`/groups/${groupId}/expenses/new`) }
    : { label: "New group", onClick: () => navigate("/groups/new") }

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-1.5">
        <TabLink to="/" label="Groups" icon="🏠" />

        <button
          onClick={centerAction.onClick}
          aria-label={centerAction.label}
          className="tap-target -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-2xl text-white shadow-lg active:scale-95"
        >
          +
        </button>

        <TabLink to="/profile" label="Profile" icon="🙂" />
      </div>
    </nav>
  )
}
