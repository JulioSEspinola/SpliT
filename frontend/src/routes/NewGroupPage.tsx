import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "../components/layout/PageHeader"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { useCreateGroup } from "../hooks/useGroups"

export function NewGroupPage() {
  const navigate = useNavigate()
  const createGroup = useCreateGroup()

  const [name, setName] = useState("")
  const [emails, setEmails] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const memberEmails = emails
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter(Boolean)

    const group = await createGroup.mutateAsync({ name, member_emails: memberEmails })
    navigate(`/groups/${group.id}`, { replace: true })
  }

  return (
    <div>
      <PageHeader title="New group" back />
      <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
        <Card className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">
            Group name
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cabin trip, Roommates…"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-400"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Invite by email
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="One email per line — they need an account already"
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-400"
            />
            <span className="mt-1 block text-xs font-normal text-slate-400">
              Only existing Splitzy users can be added right now.
            </span>
          </label>
        </Card>

        {createGroup.isError && <p className="text-sm text-owing">Couldn't create the group. Try again.</p>}

        <Button type="submit" fullWidth disabled={!name || createGroup.isPending}>
          {createGroup.isPending ? "Creating…" : "Create group"}
        </Button>
      </form>
    </div>
  )
}
