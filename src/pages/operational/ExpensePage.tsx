import React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { type Expense } from '@/services/operationalService'
import { operationalService } from '@/services/operationalService'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExpenseFormDialog } from '@/components/operational/ExpenseFormDialog'

export default function ExpensePage() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedExpense, setSelectedExpense] = React.useState<Expense | null>(null)

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => operationalService.getExpenses(),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Expense>) => operationalService.createExpense(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] })
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Expense> }) => operationalService.updateExpense(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] })
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => operationalService.deleteExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] })
  })

  const handleFormSubmit = async (data: Partial<Expense>) => {
    if (selectedExpense) {
      await updateMutation.mutateAsync({ id: selectedExpense.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleDelete = (expense: Expense) => {
    if (window.confirm(`Are you sure you want to delete this expense: ${expense.description}?`)) {
      deleteMutation.mutate(expense.id)
    }
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val)
  const formatDate = (dateStr?: string | null) => dateStr ? new Date(dateStr).toLocaleDateString("id-ID") : "-"

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "expense_date",
      header: "Date",
      cell: ({ row }) => <div className="text-muted-foreground">{formatDate(row.getValue("expense_date"))}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const cat = row.getValue("category") as string
        return <Badge variant="outline" className="capitalize bg-muted/20 border-border">{cat}</Badge>
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div className="font-medium text-foreground">{row.getValue("description")}</div>,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => <div className="text-destructive font-semibold text-right">{formatCurrency(row.getValue("amount"))}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const expense = row.original
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" size="icon" 
              className="text-muted-foreground hover:text-primary rounded-full"
              onClick={() => { setSelectedExpense(expense); setFormOpen(true) }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" size="icon" 
              className="text-muted-foreground hover:text-destructive rounded-full"
              onClick={() => handleDelete(expense)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="p-8 pb-12 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">Expenses</h1>
          <p className="text-muted-foreground font-light mt-1 text-lg">Track your operational costs.</p>
        </div>
        <Button 
          onClick={() => { setSelectedExpense(null); setFormOpen(true) }}
          className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground pl-4 pr-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Record Expense
        </Button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
        <DataTable 
          columns={columns} 
          data={expensesData?.data || []} 
          isLoading={isLoading}
          searchKey="description"
          searchPlaceholder="Search descriptions..."
          emptyMessage="No expenses found."
        />
      </div>

      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={selectedExpense as any}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
