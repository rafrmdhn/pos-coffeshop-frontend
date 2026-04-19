import React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, PackagePlus } from 'lucide-react'
import { type RawMaterial } from '@/types/api'
import { inventoryService } from '@/services/inventoryAndRecipeService'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RawMaterialFormDialog } from '@/components/inventory/RawMaterialFormDialog'
import { RestockDialog } from '@/components/inventory/RestockDialog'

export default function InventoryPage() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = React.useState(false)
  const [restockOpen, setRestockOpen] = React.useState(false)
  const [selectedMaterial, setSelectedMaterial] = React.useState<RawMaterial | null>(null)

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryService.getInventory(),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<RawMaterial>) => inventoryService.createMaterial(data as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] })
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<RawMaterial> }) => inventoryService.updateMaterial(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] })
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => inventoryService.deleteMaterial(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] })
  })

  const handleFormSubmit = async (data: Partial<RawMaterial>) => {
    if (selectedMaterial) {
      await updateMutation.mutateAsync({ id: selectedMaterial.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleRestockSubmit = async (id: string, additionalStock: number) => {
    const material = inventoryData?.data.find(m => m.id === id)
    if (material) {
      const newStock = material.current_stock + additionalStock
      await updateMutation.mutateAsync({ 
        id, 
        data: { current_stock: newStock, last_restock_at: new Date().toISOString() } 
      })
    }
  }

  const handleDelete = (material: RawMaterial) => {
    if (window.confirm(`Are you sure you want to delete ${material.name}?`)) {
      deleteMutation.mutate(material.id)
    }
  }

  const columns: ColumnDef<RawMaterial>[] = [
    {
      accessorKey: "name",
      header: "Ingredient Name",
      cell: ({ row }) => <div className="font-medium text-foreground">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "current_stock",
      header: "Current Stock",
      cell: ({ row }) => {
        const material = row.original
        return <div className="text-foreground">{material.current_stock} {material.unit}</div>
      },
    },
    {
      accessorKey: "cost_per_unit",
      header: "Cost / Unit",
      cell: ({ row }) => {
        const cost = parseFloat(row.getValue("cost_per_unit") as string) || 0
        const formatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(cost)
        return <div className="text-muted-foreground">{formatted} / {row.original.unit}</div>
      },
    },
    {
      accessorKey: "is_low_stock",
      header: "Status",
      cell: ({ row }) => {
        const isLow = row.getValue("is_low_stock")
        return (
          <Badge variant={isLow ? "destructive" : "default"} className={isLow ? "bg-destructive/10 text-destructive border-0" : "bg-success/10 text-success border-0"}>
            {isLow ? "Low Stock" : "Healthy"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const material = row.original
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary rounded-full transition-colors bg-muted/20"
              onClick={() => {
                setSelectedMaterial(material)
                setRestockOpen(true)
              }}
              title="Restock"
            >
              <PackagePlus className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary rounded-full"
              onClick={() => {
                setSelectedMaterial(material)
                setFormOpen(true)
              }}
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-destructive rounded-full"
              onClick={() => handleDelete(material)}
              title="Delete"
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
          <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">Raw Materials</h1>
          <p className="text-muted-foreground font-light mt-1 text-lg">Manage inventory and monitor stock levels.</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedMaterial(null)
            setFormOpen(true)
          }}
          className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground pl-4 pr-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Ingredient
        </Button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
        <DataTable 
          columns={columns} 
          data={inventoryData?.data || []} 
          isLoading={isLoading}
          searchKey="name"
          searchPlaceholder="Search materials..."
          emptyMessage="No ingredients found."
        />
      </div>

      <RawMaterialFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        material={selectedMaterial}
        onSubmit={handleFormSubmit}
      />
      <RestockDialog
        open={restockOpen}
        onOpenChange={setRestockOpen}
        material={selectedMaterial}
        onSubmit={handleRestockSubmit}
      />
    </div>
  )
}
