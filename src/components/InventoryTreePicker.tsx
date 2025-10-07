import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, Package, Star } from 'lucide-react';
import { InventoryItem } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';

interface InventoryTreePickerProps {
  inventory: InventoryItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function InventoryTreePicker({
  inventory,
  selectedIds,
  onSelectionChange,
}: InventoryTreePickerProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelection = (id: string, isFolder: boolean) => {
    if (isFolder) return; // Can't select folders
    
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];
    
    onSelectionChange(newSelection);
  };

  const renderItem = (item: InventoryItem, depth: number = 0) => {
    const isExpanded = expandedIds.includes(item.id);
    const isSelected = selectedIds.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <div
          className="flex items-center gap-2 py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {/* Expand/Collapse */}
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

          {/* Checkbox (only for items, not folders) */}
          {!item.is_folder && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelection(item.id, item.is_folder)}
              className="mr-1"
            />
          )}

          {/* Icon */}
          {item.is_folder ? (
            <Folder className="w-4 h-4 text-primary" />
          ) : (
            <Package className="w-4 h-4 text-accent" />
          )}

          {/* Name */}
          <span
            className="flex-1 text-sm"
            onClick={() => hasChildren && toggleExpand(item.id)}
          >
            {item.name}
          </span>

          {/* Star for favorited items */}
          {item.is_favorited && (
            <Star className="w-3 h-3 text-warning fill-warning" />
          )}

          {/* SKU */}
          {item.sku && (
            <span className="text-xs text-muted-foreground">{item.sku}</span>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border border-border rounded-md max-h-96 overflow-y-auto">
      {inventory.map(item => renderItem(item, 0))}
    </div>
  );
}
