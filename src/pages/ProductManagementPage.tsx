import React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { type Product } from '@/types/api'
import { productService, categoryService } from '@/services/productAndCategoryService'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductFormDialog } from '@/components/pos/ProductFormDialog'

export default function ProductManagementPage() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Product>) => {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => { 
        if (v !== undefined && v !== null) {
          const value = typeof v === 'boolean' ? (v ? '1' : '0') : String(v)
          fd.append(k, value)
        }
      })
      return productService.createProduct(fd)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Product> }) => {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => { 
        if (v !== undefined && v !== null) {
          const value = typeof v === 'boolean' ? (v ? '1' : '0') : String(v)
          fd.append(k, value)
        }
      })
      return productService.updateProduct(id, fd)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })

  const handleFormSubmit = async (data: Partial<Product>) => {
    if (selectedProduct) {
      await updateMutation.mutateAsync({ id: selectedProduct.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleDelete = (product: Product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      deleteMutation.mutate(product.id)
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="font-medium text-foreground">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }) => {
        const cat = row.original.category
        return <Badge variant="outline" className="font-normal text-muted-foreground bg-muted/20 border-border">{cat?.name ?? 'Uncategorized'}</Badge>
      }
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"))
        const formatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0
        }).format(price)
        return <div className="text-foreground/90">{formatted}</div>
      },
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("sku") || '-'}</div>,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active")
        return (
          <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-primary/20 text-primary border-0" : "opacity-50"}>
            {isActive ? "Available" : "Hidden"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary rounded-full"
              onClick={() => {
                setSelectedProduct(product)
                setFormOpen(true)
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-destructive rounded-full"
              onClick={() => handleDelete(product)}
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
          <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">Menu Items</h1>
          <p className="text-muted-foreground font-light mt-1 text-lg">Manage your products and pricing.</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedProduct(null)
            setFormOpen(true)
          }}
          className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground pl-4 pr-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Menu Item
        </Button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
        <DataTable 
          columns={columns} 
          data={productsData?.data || []} 
          isLoading={isLoadingProducts}
          searchKey="name"
          searchPlaceholder="Search menu items..."
          emptyMessage="No menu items matched your search."
        />
      </div>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={selectedProduct}
        categories={categoriesData?.data || []}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
