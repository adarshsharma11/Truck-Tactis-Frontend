import { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InventoryCategory from '@/components/page/InventoryCategory';
import { useInventory, useTrucks, useCreateInventoryItem, useCreateTruck, useCategories, useCategori, useDeleteTruck } from '@/lib/api/hooks';
import { toast } from 'sonner';
import { restMaterial } from '@/utils/contants';


export default function InventoryPage() {
  const { data: inventory, isLoading: inventoryLoading } = useInventory();
  const { data: trucks, isLoading: trucksLoading, refetch } = useTrucks();
  const { data: categories, isLoading: CategoriesLoading } = useCategories();
  const truckDelete = useDeleteTruck();
  const { data, isPending: deletePending } = truckDelete;
  const createItem = useCreateInventoryItem();
  const createCategori = useCategori();
  const createTruck = useCreateTruck();
  const [itemName, setItemName] = useState<string>('');
  const [itemSku, setItemSku] = useState<string>('');
  const [itemWeight, setItemWeight] = useState<string>('');
  const [itemLength, setItemLength] = useState<string>('');
  const [itemWidth, setItemWidth] = useState<string>('');
  const [itemHeight, setItemHeight] = useState<string>('');
  const [itemNotes, setItemNotes] = useState<string>('');
  const [itemLargeTruck, setItemLargeTruck] = useState(false);
  //categorie form state
  const [category, setCategory] = useState<null | number>(null);

  // Truck form state
  const [truckName, setTruckName] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [yearOfManufacture, setyearOfManufacture] = useState<number>(2022);
  const [active, setActive] = useState<boolean>(true);
  const [truckCapacity, setTruckCapacity] = useState<string>('');
  const [truckMaxWeight, setTruckMaxWeight] = useState<string>('');
  const [status, setStatus] = useState<string>('AVAILABLE');
  const [truckLength, setTruckLength] = useState<string>('');
  const [truckWidth, setTruckWidth] = useState<string>('');
  const [truckHeight, setTruckHeight] = useState<string>('');
  const [restrictedLoadTypes, setrestrictedLoadTypes] = useState<string[]>(['Hazardous']);
  const [truckIsLarge, setTruckIsLarge] = useState<boolean>(false);
  const [gpsEnabled, setGpsEnabled] = useState<boolean>(true);

  const handleCreateItem = () => {
    if (!itemName) {
      toast.error('Please enter an item name');
      return;
    }

    if (category === null) {
      createCategori.mutate({
        name: itemName,
        description: itemNotes,
      });
    }

    createItem.mutate({
      name: itemName,
      sku: itemSku || null,
      weightLbs: itemWeight ? parseFloat(itemWeight) : null,
      lengthIn: itemLength ? parseFloat(itemLength) : null,
      widthIn: itemWidth ? parseFloat(itemWidth) : null,
      heightIn: itemHeight ? parseFloat(itemHeight) : null,
      notes: itemNotes || null,
      requiresLargeTruck: itemLargeTruck,
      categoryId: category || null
    });

    // Reset form
    setCategory(null)
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
    if (!truckName && !truckCapacity) {
      toast.error('Please enter truck name and capacity');
      return;
    } else if (!truckName) {
      toast.error('Please enter truck name ');
      return;
    } else if (!truckCapacity) {
      toast.error('Please enter capacity');
      return;
    }
    createTruck.mutate({
      truckName: truckName,
      capacityCuFt: parseFloat(truckCapacity) || 0,
      maxWeightLbs: parseFloat(truckMaxWeight) || 0,
      lengthFt: parseFloat(truckLength) || 0,
      widthFt: parseFloat(truckWidth) || 0,
      heightFt: parseFloat(truckHeight) || 0,
      truckType: truckIsLarge ? 'LARGE' : 'SMALL',
      color: color ? color : "black",
      isActive: active,
      currentStatus: status,
      yearOfManufacture: yearOfManufacture,
      gpsEnabled: gpsEnabled,
    });

    // Reset form
    setTruckName('');
    setColor('');
    setStatus('AVAILABLE');
    setrestrictedLoadTypes(['Hazardous']);
    setActive(true);
    setGpsEnabled(true);
    setTruckCapacity('');
    setTruckMaxWeight('');
    setTruckLength('');
    setTruckWidth('');
    setTruckHeight('');
    setTruckIsLarge(false);
    setyearOfManufacture(2022)
  };
  const deleteTruck = async (id: number) => {
    await truckDelete.mutate(id)
    refetch()
  }
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Inventory & Fleet</h2>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="category">Category</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
        </TabsList>
          <TabsContent value="category" className="space-y-4">
            <InventoryCategory categories={categories?.data} />
          </TabsContent>
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
                {inventory?.data?.length > 0 ?
                  <div>
                    <Label className="text-sm font-medium">Categories</Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(Number(e.target.value))} id="yearOfManufacture" name="yearOfManufacture"
                      className="w-full mt-2 px-3 py-2 bg-input border border-border rounded-md text-sm"
                    >
                      <option value={null}>Select</option>
                      {
                        categories?.data?.map((val, i) => (
                          <option value={val.id}>{val.name}</option>
                        ))
                      }
                    </select>
                  </div> : null}
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
              ) : !inventory || inventory?.data?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No items yet</div>
              ) : (
                <div className="space-y-2">
                  {inventory?.data?.map((item) => (
                    <div key={item.id} className="p-4 border border-border rounded-md hover:bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.sku && <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>}
                          {item.weightLbs && <p className="text-xs text-muted-foreground">Weight: {item.weightLbs} lbs</p>}
                        </div>
                        {/* {item.is_favorited && <span className="text-warning">⭐</span>} */}
                      </div>
                      {item.category && (
                        <p className="text-xs text-muted-foreground mt-2">{item.name} sub-items</p>
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
                  <Label>Color</Label>
                  <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g., Alpha-01" className="mt-2" />
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
                <div>
                  <Label className="text-sm font-medium">Year of Manufacture</Label>
                  <select
                    value={yearOfManufacture}
                    onChange={(e) => setyearOfManufacture(Number(e.target.value))} id="yearOfManufacture" name="yearOfManufacture"
                    className="w-full mt-2 px-3 py-2 bg-input border border-border rounded-md text-sm"
                  >
                    <option value="2000">2000</option>
                    <option value="2001">2001</option>
                    <option value="2002">2002</option>
                    <option value="2003">2003</option>
                    <option value="2004">2004</option>
                    <option value="2005">2005</option>
                    <option value="2006">2006</option>
                    <option value="2007">2007</option>
                    <option value="2008">2008</option>
                    <option value="2009">2009</option>
                    <option value="2010">2010</option>
                    <option value="2011">2011</option>
                    <option value="2012">2012</option>
                    <option value="2013">2013</option>
                    <option value="2014">2014</option>
                    <option value="2015">2015</option>
                    <option value="2016">2016</option>
                    <option value="2017">2017</option>
                    <option value="2018">2018</option>
                    <option value="2019">2019</option>
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full mt-2 px-3 py-2 bg-input border border-border rounded-md text-sm"
                  >
                    <option value="AVAILABLE">Available</option>
                    {/* <option value="ON DELIVERY">On Delivery</option> */}
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Restricted Load Types</Label>
                  <select
                    value={restrictedLoadTypes}
                    onChange={(e) => setrestrictedLoadTypes([e.target.value])}
                    className="w-full mt-2 px-3 py-2 bg-input border border-border rounded-md text-sm"
                  >
                    {restMaterial.map((val, i) =>
                      <option key={i} value={val.value}>{val.title}</option>
                    )}

                  </select>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Label>Active</Label>
                  <Switch checked={active} onCheckedChange={setActive} />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Label>Large Truck</Label>
                  <Switch checked={truckIsLarge} onCheckedChange={setTruckIsLarge} />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Label>GPS Enabled</Label>
                  <Switch checked={gpsEnabled} onCheckedChange={setGpsEnabled} />
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
                ) : trucks?.data?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No trucks yet</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trucks?.data?.map((truck) => (
                      <div key={truck.id} className="p-4 border border-border rounded-md hover:bg-muted/20">
                        <div className="flex pb-4">
                          <Button
                            className="bg-red-500 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center ml-auto"
                            onClick={() => deleteTruck(truck.id)}
                            disabled={deletePending}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{truck?.truckName}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${(truck?.truckType === 'large') ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                              }`}>
                              {truck?.truckType}
                            </span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Capacity:</span>
                              <span className="font-medium">{truck?.capacityCuFt} cu ft</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Dimensions:</span>
                              <span className="font-medium text-xs">
                                {truck?.lengthFt}×{truck?.widthFt}×{truck?.heightFt} ft
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status:</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${truck?.currentStatus === 'AVAILABLE'
                                ? 'bg-success/20 text-success'
                                : truck?.currentStatus === 'idle'
                                  ? 'bg-warning/20 text-warning'
                                  : 'bg-muted text-muted-foreground'
                                }`}>
                                {truck?.currentStatus}
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
        </TabsContent >
      </Tabs >
    </div >
  );
}
