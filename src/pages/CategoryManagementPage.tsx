import React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { type Category } from '@/types/api'
import { categoryService } from '@/services/productAndCategoryService'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CategoryFormDialog } from '@/components/pos/CategoryFormDialog'

export default function CategoryManagementPage() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null)

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Category>) => categoryService.createCategory(data as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Category> }) => categoryService.updateCategory(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  })

  const handleFormSubmit = async (data: Partial<Category>) => {
    if (selectedCategory) {
      await updateMutation.mutateAsync({ id: selectedCategory.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleDelete = (category: Category) => {
    if (window.confirm(`Are you sure you want to delete ${category.name}?`)) {
      deleteMutation.mutate(category.id)
    }
  }

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }) => <div className="font-medium text-foreground">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("slug")}</div>,
    },
    {
      accessorKey: "sort_order",
      header: "Sort Order",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("sort_order")}</div>,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active")
        return (
          <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-primary/20 text-primary border-0" : "opacity-50"}>
            {isActive ? "Active" : "Hidden"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary rounded-full"
              onClick={() => {
                setSelectedCategory(category)
                setFormOpen(true)
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-destructive rounded-full"
              onClick={() => handleDelete(category)}
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
          <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">Categories</h1>
          <p className="text-muted-foreground font-light mt-1 text-lg">Group your offerings elegantly.</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedCategory(null)
            setFormOpen(true)
          }}
          className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground pl-4 pr-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
        <DataTable 
          columns={columns} 
          data={categoriesData?.data || []} 
          isLoading={isLoading}
          searchKey="name"
          searchPlaceholder="Search categories..."
          emptyMessage="No categories found."
        />
      </div>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={selectedCategory}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
