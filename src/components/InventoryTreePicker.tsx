import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, Package, Star, CloudCog } from 'lucide-react';
import { Category, InventoryItem, Item } from '@/types'; // Assuming correct types for categories and items
import { Checkbox } from '@/components/ui/checkbox';

interface InventoryTreePickerProps {
  inventory: Category[]; // Categories containing items
  selectedIds: number[]; // Array of selected item ids
  onSelectionChange: (ids: number[]) => void; // Callback to handle selection changes
}

export function InventoryTreePicker({
  inventory,
  selectedIds,
  onSelectionChange,
}: InventoryTreePickerProps) {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  // Function to handle expanding or collapsing categories
  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelection = (id: number, isCategory: boolean, e?: string | boolean, subItem?: Item[],) => {
    if (isCategory && e === true) {
      let subItemData = subItem.map((val) => val.id)
      onSelectionChange([...subItemData, id]);
    } else if (isCategory && e === false) {
      let subItemData = subItem.map((val) => {
        if (!selectedIds.includes(val.id)) {
          return val.id;
        }
      })
      onSelectionChange([...subItemData]);
    } else if (!isCategory && e === false) {
      let subItemData = selectedIds.filter(val => val !== id);
      onSelectionChange([...subItemData]);
    } else if (!isCategory && e === true) {
      onSelectionChange([...selectedIds, id,]);
    }
  };

  // Render function for individual items (both categories and items)
  const renderItemCategory = (item: Category, depth: number = 0,) => {
    const isExpanded = expandedIds.includes(item.id);
    // const isSelected = selectedIds.includes(item.id);
    const hasChildren = item?.items && item?.items?.length > 0;

    const isCategory = item?.items?.length > 0 ? true : false // Check if it's a category (i.e., has items)



    return (
      <div key={item.id}>
        <div
          className="flex items-center gap-2 py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {/* Expand/Collapse Button for categories */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(item.id)}
              className="w-4 h-4 flex items-center justify-center"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <span className="w-4 h-4" />
          )}

          {/* Checkbox for selecting items */}
          {/* {isCategory?null:
          <Checkbox
            checked={selectedIds.includes(item.id)}
            onCheckedChange={(e) => toggleSelection(item.id, isCategory, e, item.items,)}
            className="mr-1"
            key={item.id}
          />} */}

          {/* Icon */}
          {isCategory ? (
            <Folder className="w-4 h-4 text-primary" />
          ) : (
            <Package className="w-4 h-4 text-accent" />
          )}

          {/* Name of category or item */}
          <span
            className="flex-1 text-sm"
            onClick={() => hasChildren && toggleExpand(item.id)}
          >
            {item.name}
          </span>
        </div>

        {/* Render Children (Sub-items or sub-categories) */}
        {hasChildren && isExpanded && item.items && (
          <div>
            {item.items.map((child) => renderSubItem(child, depth + 1, item.id))}
          </div>
        )}
      </div>
    );
  };
  const renderSubItem = (subItem: Item, depth: number = 0, id: number) => {
    const isSelected = selectedIds.includes(subItem.id);

    return (
      <div key={subItem.id}>
        <div
          className="flex items-center gap-2 py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >

          {/* Checkbox for selecting items */}
          <Checkbox
            checked={selectedIds.includes(subItem.id)}
            key={subItem.id}
            onCheckedChange={(e) => toggleSelection(subItem.id, false, e)}
            className="mr-1"
          />

          {/* Icon */}

          <Package className="w-4 h-4 text-accent" />
          {/* Name of category or subItem */}
          <span
            className="flex-1 text-sm"
            onClick={() => toggleExpand(subItem.id)}
          >
            {subItem.name}
          </span>

        </div>
      </div>
    );
  };

  return (
    <div className="border border-border rounded-md max-h-96 overflow-y-auto">
      {inventory.map((item) => renderItemCategory(item, 0))}
    </div>
  );
}
