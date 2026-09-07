import { Navigate, Route, Routes } from "react-router-dom"
import { AppShell } from "./components/layout/AppShell"
import { AddExpensePage } from "./routes/AddExpensePage"
import { AuthPage } from "./routes/AuthPage"
import { GroupBalancesTab } from "./routes/GroupBalancesTab"
import { GroupDetailPage } from "./routes/GroupDetailPage"
import { GroupExpensesTab } from "./routes/GroupExpensesTab"
import { GroupSettleUpTab } from "./routes/GroupSettleUpTab"
import { GroupsDashboardPage } from "./routes/GroupsDashboardPage"
import { NewGroupPage } from "./routes/NewGroupPage"
import { ProfilePage } from "./routes/ProfilePage"
import { RequireAuth } from "./routes/RequireAuth"

export function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/groups/new" element={<NewGroupPage />} />
        <Route path="/groups/:groupId/expenses/new" element={<AddExpensePage />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<GroupsDashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/groups/:groupId" element={<GroupDetailPage />}>
            <Route index element={<GroupExpensesTab />} />
            <Route path="balances" element={<GroupBalancesTab />} />
            <Route path="settle" element={<GroupSettleUpTab />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
