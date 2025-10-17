import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCategories } from "@/lib/api/hooks";

function CategorySelect({ category, setCategory }) {
  const { data: categories, isLoading } = useCategories();

  // Recursive render with indentation
  const renderOptions = (cats = [], depth = 0) =>
    cats.flatMap((cat) => [
      <SelectItem key={cat.id} value={String(cat.id)}>
        {`${"— ".repeat(depth)}${cat.name}`}
      </SelectItem>,
      ...(cat.children?.length ? renderOptions(cat.children, depth + 1) : []),
    ]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Categories</Label>
      <Select
        value={category ? String(category) : ""}
        onValueChange={(val) => setCategory(val ? Number(val) : null)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full mt-2">
          <SelectValue placeholder={isLoading ? "Loading..." : "Select a category"} />
        </SelectTrigger>

        {/* Force dropdown to open below, make scrollable, and match width */}
        <SelectContent
          side="bottom"
          align="start"
          className="max-h-64 w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-md border border-border bg-popover shadow-lg"
        >
          {categories?.data?.length ? (
            renderOptions(categories.data)
          ) : (
            <SelectItem disabled value="none">
              {isLoading ? "Loading..." : "No categories found"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export default CategorySelect;
