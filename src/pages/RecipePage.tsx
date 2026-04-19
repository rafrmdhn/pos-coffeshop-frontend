import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react'
import { type RecipeItem } from '@/types/api'
import { recipeService, inventoryService } from '@/services/inventoryAndRecipeService'
import { productService } from '@/services/productAndCategoryService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function RecipePage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  // In a real app we'd fetch the specific product
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  })
  
  const product = productsData?.data.find(p => p.id === id)

  const { data: recipesData } = useQuery({
    queryKey: ['recipes', id],
    queryFn: () => recipeService.getRecipe(id || ''),
    enabled: !!id
  })

  const { data: inventoryData } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryService.getInventory(),
  })

  const [localItems, setLocalItems] = React.useState<Partial<RecipeItem>[]>([])

  React.useEffect(() => {
    if (recipesData?.data) {
      setLocalItems(recipesData.data)
    }
  }, [recipesData])

  const updateMutation = useMutation({
    mutationFn: (items: { raw_material_id: string; quantity_needed: number }[]) =>
      recipeService.updateRecipe(id || '', items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', id] })
      alert("Recipe saved successfully!")
    }
  })

  const handleAddIngredient = () => {
    setLocalItems([...localItems, {
      id: `new-${Date.now()}`, // temp id for UI map
      raw_material_id: "",
      quantity_needed: 0
    }])
  }

  const handleRemoveIngredient = (idx: number) => {
    const next = [...localItems]
    next.splice(idx, 1)
    setLocalItems(next)
  }

  const handleIngredientChange = (idx: number, raw_material_id: string) => {
    const next = [...localItems]
    next[idx].raw_material_id = raw_material_id
    setLocalItems(next)
  }

  const handleQtyChange = (idx: number, qtyString: string) => {
    const next = [...localItems]
    next[idx].quantity_needed = parseFloat(qtyString) || 0
    setLocalItems(next)
  }

  const calculateTotalCost = () => {
    return localItems.reduce((acc, item) => {
      const rm = inventoryData?.data.find(m => m.id === item.raw_material_id)
      return acc + (rm ? rm.cost_per_unit * (item.quantity_needed || 0) : 0)
    }, 0)
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val)

  const totalCost = calculateTotalCost()
  const sellingPrice = product?.price || 0
  const margin = sellingPrice - totalCost
  const marginPercentage = sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0

  return (
    <div className="p-8 pb-12 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors flex items-center text-sm font-medium">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Link>
        <div>
          <h1 className="text-4xl font-serif font-light text-foreground tracking-tight">Recipe BOM Builder</h1>
          <p className="text-muted-foreground font-light mt-1 text-lg">
            Manage Bill of Materials for <strong className="font-semibold text-foreground">{product?.name || 'Loading...'}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6 bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif font-light">Ingredients List</h2>
            <Button onClick={handleAddIngredient} variant="outline" size="sm" className="rounded-full shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Add Ingredient
            </Button>
          </div>

          {localItems.length === 0 && (
            <div className="text-center py-10 opacity-50">
              No ingredients added yet.
            </div>
          )}

          <div className="space-y-4">
            {localItems.map((item, idx) => {
              const selectedRm = inventoryData?.data.find(m => m.id === item.raw_material_id)
              return (
                <div key={item.id} className="flex gap-4 items-center bg-muted/20 p-4 rounded-2xl border border-border/40">
                  <div className="flex-1">
                    <Select 
                      value={item.raw_material_id} 
                      onValueChange={(val) => handleIngredientChange(idx, val)}
                    >
                      <SelectTrigger className="rounded-xl border-border/60 bg-card">
                        <SelectValue placeholder="Select Material" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {inventoryData?.data.map(rm => (
                          <SelectItem key={rm.id} value={rm.id}>{rm.name} ({rm.unit})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-32 relative">
                    <Input 
                      type="number" 
                      placeholder="Qty" 
                      value={item.quantity_needed || ""} 
                      onChange={(e) => handleQtyChange(idx, e.target.value)}
                      className="rounded-xl border-border/60 pr-12 text-right bg-card"
                    />
                    <div className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                      {selectedRm?.unit || "-"}
                    </div>
                  </div>

                  <div className="w-32 text-right text-sm">
                    {formatCurrency(selectedRm ? selectedRm.cost_per_unit * (item.quantity_needed || 0) : 0)}
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => handleRemoveIngredient(idx)} className="text-muted-foreground hover:text-destructive rounded-full">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>

          <div className="pt-6 border-t border-border/40 flex justify-end">
            <Button 
              onClick={() => updateMutation.mutate(
                localItems
                  .filter(i => i.raw_material_id && (i.quantity_needed ?? 0) > 0)
                  .map(i => ({ raw_material_id: i.raw_material_id!, quantity_needed: i.quantity_needed! }))
              )}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 shadow-md"
              disabled={updateMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" /> 
              {updateMutation.isPending ? 'Saving...' : 'Save Recipe'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card/50 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-sm">
            <h2 className="text-xl font-serif font-light mb-6">Financial Impact</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-4 border-b border-border/40">
                <span className="text-muted-foreground">Estimated COGS</span>
                <span className="font-medium text-destructive">{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border/40">
                <span className="text-muted-foreground">Selling Price</span>
                <span className="font-medium text-foreground">{formatCurrency(sellingPrice)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Gross Margin</span>
                <span className="font-medium text-success text-xl">{formatCurrency(margin)}</span>
              </div>
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl mt-2">
                <span className="text-muted-foreground">Margin %</span>
                <span className="font-semibold">{marginPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
