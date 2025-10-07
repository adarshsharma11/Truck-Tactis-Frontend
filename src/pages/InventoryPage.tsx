import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInventory, useTrucks, useCreateInventoryItem, useCreateTruck } from '@/lib/api/hooks';
import { toast } from 'sonner';

export default function InventoryPage() {
  const { data: inventory, isLoading: inventoryLoading } = useInventory();
  const { data: trucks, isLoading: trucksLoading } = useTrucks();
  const createItem = useCreateInventoryItem();
  const createTruck = useCreateTruck();

  // Item form state
  const [itemName, setItemName] = useState('');
  const [itemSku, setItemSku] = useState('');
  const [itemWeight, setItemWeight] = useState('');
  const [itemLength, setItemLength] = useState('');
  const [itemWidth, setItemWidth] = useState('');
  const [itemHeight, setItemHeight] = useState('');
  const [itemNotes, setItemNotes] = useState('');
  const [itemLargeTruck, setItemLargeTruck] = useState(false);

  // Truck form state
  const [truckName, setTruckName] = useState('');
  const [truckCapacity, setTruckCapacity] = useState('');
  const [truckMaxWeight, setTruckMaxWeight] = useState('');
  const [truckLength, setTruckLength] = useState('');
  const [truckWidth, setTruckWidth] = useState('');
  const [truckHeight, setTruckHeight] = useState('');
  const [truckIsLarge, setTruckIsLarge] = useState(false);

  const handleCreateItem = () => {
    if (!itemName) {
      toast.error('Please enter an item name');
      return;
    }

    createItem.mutate({
      name: itemName,
      sku: itemSku || undefined,
      weight: itemWeight ? parseFloat(itemWeight) : undefined,
      dimensions: itemLength && itemWidth && itemHeight ? {
        length: parseFloat(itemLength),
        width: parseFloat(itemWidth),
        height: parseFloat(itemHeight),
      } : undefined,
      notes: itemNotes || undefined,
      is_folder: false,
    });

    // Reset form
    setItemName('');
    setItemSku('');
    setItemWeight('');
    setItemLength('');
    setItemWidth('');
    setItemHeight('');
    setItemNotes('');
    setItemLargeTruck(false);
  };

  const handleCreateTruck = () => {
    if (!truckName || !truckCapacity) {
      toast.error('Please enter truck name and capacity');
      return;
    }

    createTruck.mutate({
      name: truckName,
      type: truckIsLarge ? 'large' : 'small',
      capacity: parseFloat(truckCapacity),
      dimensions: {
        length: parseFloat(truckLength) || 0,
        width: parseFloat(truckWidth) || 0,
        height: parseFloat(truckHeight) || 0,
      },
      status: 'idle',
    });

    // Reset form
    setTruckName('');
    setTruckCapacity('');
    setTruckMaxWeight('');
    setTruckLength('');
    setTruckWidth('');
    setTruckHeight('');
    setTruckIsLarge(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Inventory & Fleet</h2>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Item Form */}
            <Card className="lg:col-span-1 p-6 h-fit">
              <h3 className="text-lg font-semibold mb-4">Add Item</h3>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Item name" className="mt-2" />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input value={itemSku} onChange={(e) => setItemSku(e.target.value)} placeholder="Optional" className="mt-2" />
                </div>
                <div>
                  <Label>Weight (lbs)</Label>
                  <Input type="number" step="0.01" value={itemWeight} onChange={(e) => setItemWeight(e.target.value)} placeholder="0" className="mt-2" />
                </div>
                <div>
                  <Label>Dimensions (in)</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Input type="number" step="0.1" value={itemLength} onChange={(e) => setItemLength(e.target.value)} placeholder="L" />
                    <Input type="number" step="0.1" value={itemWidth} onChange={(e) => setItemWidth(e.target.value)} placeholder="W" />
                    <Input type="number" step="0.1" value={itemHeight} onChange={(e) => setItemHeight(e.target.value)} placeholder="H" />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={itemNotes} onChange={(e) => setItemNotes(e.target.value)} placeholder="Optional notes..." className="mt-2" rows={2} />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Label>Requires Large Truck</Label>
                  <Switch checked={itemLargeTruck} onCheckedChange={setItemLargeTruck} />
                </div>
                <Button className="w-full" onClick={handleCreateItem} disabled={createItem.isPending}>
                  <Plus className="w-4 h-4 mr-2" />
                  {createItem.isPending ? 'Adding...' : 'Add Item'}
                </Button>
              </div>
            </Card>

            {/* Inventory List */}
            <Card className="lg:col-span-2 p-6">
              <h3 className="text-lg font-semibold mb-4">Inventory Items</h3>
              {inventoryLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : !inventory || inventory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No items yet</div>
              ) : (
                <div className="space-y-2">
                  {inventory.map((item) => (
                    <div key={item.id} className="p-4 border border-border rounded-md hover:bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.sku && <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>}
                          {item.weight && <p className="text-xs text-muted-foreground">Weight: {item.weight} lbs</p>}
                        </div>
                        {item.is_favorited && <span className="text-warning">⭐</span>}
                      </div>
                      {item.children && item.children.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">{item.children.length} sub-items</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Truck Form */}
            <Card className="lg:col-span-1 p-6 h-fit">
              <h3 className="text-lg font-semibold mb-4">Add Truck</h3>
              <div className="space-y-4">
                <div>
                  <Label>Truck Name</Label>
                  <Input value={truckName} onChange={(e) => setTruckName(e.target.value)} placeholder="e.g., Alpha-01" className="mt-2" />
                </div>
                <div>
                  <Label>Capacity (cu ft)</Label>
                  <Input type="number" step="1" value={truckCapacity} onChange={(e) => setTruckCapacity(e.target.value)} placeholder="e.g., 1000" className="mt-2" />
                </div>
                <div>
                  <Label>Max Weight (lbs)</Label>
                  <Input type="number" step="1" value={truckMaxWeight} onChange={(e) => setTruckMaxWeight(e.target.value)} placeholder="e.g., 10000" className="mt-2" />
                </div>
                <div>
                  <Label>Dimensions (ft)</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Input type="number" step="0.1" value={truckLength} onChange={(e) => setTruckLength(e.target.value)} placeholder="L" />
                    <Input type="number" step="0.1" value={truckWidth} onChange={(e) => setTruckWidth(e.target.value)} placeholder="W" />
                    <Input type="number" step="0.1" value={truckHeight} onChange={(e) => setTruckHeight(e.target.value)} placeholder="H" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Label>Large Truck</Label>
                  <Switch checked={truckIsLarge} onCheckedChange={setTruckIsLarge} />
                </div>
                <Button className="w-full" onClick={handleCreateTruck} disabled={createTruck.isPending}>
                  <Plus className="w-4 h-4 mr-2" />
                  {createTruck.isPending ? 'Adding...' : 'Add Truck'}
                </Button>
              </div>
            </Card>

            {/* Fleet List */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Fleet Overview</h3>
                {trucksLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : !trucks || trucks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No trucks yet</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trucks.map((truck) => (
                      <div key={truck.id} className="p-4 border border-border rounded-md hover:bg-muted/20">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{truck.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              truck.type === 'large' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                            }`}>
                              {truck.type}
                            </span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Capacity:</span>
                              <span className="font-medium">{truck.capacity} cu ft</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Dimensions:</span>
                              <span className="font-medium text-xs">
                                {truck.dimensions.length}×{truck.dimensions.width}×{truck.dimensions.height} ft
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status:</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                truck.status === 'on_route' 
                                  ? 'bg-success/20 text-success'
                                  : truck.status === 'idle'
                                  ? 'bg-warning/20 text-warning'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {truck.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
