export type SplitType = "even" | "percentage" | "custom"

export interface UserOut {
  id: string
  name: string
  email: string
  created_at: string
}

export interface GroupOut {
  id: string
  name: string
  created_by: string
  created_at: string
}

export interface GroupMemberOut {
  user_id: string
  name: string
  email: string
  joined_at: string
}

export interface ExpenseSplitOut {
  user_id: string
  amount_owed: number
}

export interface ExpenseOut {
  id: string
  group_id: string
  paid_by: string
  amount: number
  description: string | null
  split_type: SplitType
  created_at: string
  splits: ExpenseSplitOut[]
}

export interface BalanceOut {
  /** Positive amount means user_b owes user_a. */
  user_a: string
  user_b: string
  amount: number
}

export interface SettlementOut {
  from_user: string
  to_user: string
  amount: number
}

export interface GroupCreateInput {
  name: string
  member_emails: string[]
}

export interface ExpenseSplitIn {
  user_id: string
  /** Dollar amount for "custom", percentage points for "percentage". */
  value: number
}

export interface ExpenseCreateInput {
  group_id: string
  paid_by: string
  amount: number
  description?: string
  split_type: SplitType
  splits?: ExpenseSplitIn[]
}
