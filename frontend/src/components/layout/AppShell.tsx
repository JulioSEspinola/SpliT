import { Outlet } from "react-router-dom"
import { BottomTabBar } from "./BottomTabBar"

export function AppShell() {
  return (
    <div className="mx-auto min-h-full max-w-md pb-24">
      <Outlet />
      <BottomTabBar />
    </div>
  )
}
