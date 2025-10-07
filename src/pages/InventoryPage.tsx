import { useState } from 'react';
import { Plus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInventory, useTrucks } from '@/lib/api/hooks';

export default function InventoryPage() {
  const { data: inventory, isLoading: inventoryLoading } = useInventory();
  const { data: trucks, isLoading: trucksLoading } = useTrucks();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Inventory & Fleet</h2>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Manage your inventory items and folders
            </p>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <Card className="p-6">
            {inventoryLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading inventory...</div>
            ) : !inventory || inventory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No inventory items</div>
            ) : (
              <div className="space-y-2">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-border rounded-md hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.sku && (
                          <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        )}
                      </div>
                      {item.is_favorited && (
                        <span className="text-warning">⭐</span>
                      )}
                    </div>
                    {item.children && item.children.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {item.children.length} sub-items
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Manage your fleet of trucks
            </p>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Truck
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trucksLoading ? (
              <Card className="p-6 text-center text-muted-foreground">Loading fleet...</Card>
            ) : !trucks || trucks.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">No trucks</Card>
            ) : (
              trucks.map((truck) => (
                <Card key={truck.id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{truck.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{truck.type} truck</p>
                    </div>
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium">{truck.capacity} cu ft</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dimensions</span>
                      <span className="font-medium">
                        {truck.dimensions.length}' × {truck.dimensions.width}' × {truck.dimensions.height}'
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        truck.status === 'on_route' 
                          ? 'bg-primary/20 text-primary'
                          : truck.status === 'idle'
                          ? 'bg-warning/20 text-warning'
                          : truck.status === 'at_yard'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {truck.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {truck.curfew_flags && truck.curfew_flags.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Curfew zones: {truck.curfew_flags.join(', ')}
                      </p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
