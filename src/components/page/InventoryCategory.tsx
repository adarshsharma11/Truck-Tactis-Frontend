import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Static mock data for preview
const mockCategories = [
  {
    id: 7,
    name: 'Heavy Load Test',
    description: 'Heavy loading Items',
    parentId: null,
    children: [
      {
        id: 10,
        name: 'Heavy machine test',
        description: 'Heavy loading Items',
        parentId: 7,
        children: [
          {
            id: 11,
            name: 'samsung machine test',
            description: 'Heavy loading Items',
            parentId: 10,
            children: [
                {
                    id: 12,
                    name: 'samsung machine test 2',
                    description: 'Heavy loading Items',
                    parentId: 11,
                    children: [
                        {
                            id: 13,
                            name: 'samsung machine test 3',
                            description: 'Heavy loading Items',
                            parentId: 12,
                            children: [
                                {
                                    id: 14,
                                    name: 'samsung machine test 4',
                                    description: 'Heavy loading Items',
                                    parentId: 13,
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 4,
    name: 'Plastic containers',
    description: 'Plastic containers',
    parentId: null,
    children: [],
  },
  {
    id: 3,
    name: 'Heavy machinery parts',
    description: 'Heavy machinery parts',
    parentId: null,
    children: [],
  },
  {
    id: 2,
    name: 'Light Items',
    description: 'Light loading Items',
    parentId: null,
    children: [],
  },
  {
    id: 1,
    name: 'Heavy Load',
    description: 'Heavy loading Items',
    parentId: null,
    children: [
      {
        id: 5,
        name: 'Vending Machines',
        description: 'Vending machines category',
        parentId: 1,
        children: [
          {
            id: 6,
            name: 'Vegan Vending Machines',
            description: 'Vegan Vending Machines',
            parentId: 5,
            children: [],
          },
        ],
      },
    ],
  },
];

// Type
interface Category {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  children?: Category[];
}

export default function InventoryCategoriesPanel() {
  const [tree, setTree] = useState<Category[]>(mockCategories);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);

  const flat = useMemo(() => {
    const flatten = (nodes: Category[], depth = 0): { node: Category; depth: number }[] => {
      const out: { node: Category; depth: number }[] = [];
      for (const n of nodes) {
        out.push({ node: n, depth });
        if (n.children && n.children.length > 0) out.push(...flatten(n.children, depth + 1));
      }
      return out;
    };
    return flatten(tree);
  }, [tree]);

  const toggle = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter a name');
    const newCat: Category = {
      id: Date.now(),
      name,
      description,
      parentId,
      children: [],
    };
    if (!parentId) {
      setTree(prev => [...prev, newCat]);
    } else {
      const addChild = (list: Category[]): Category[] =>
        list.map(cat =>
          cat.id === parentId
            ? { ...cat, children: [...(cat.children || []), newCat] }
            : { ...cat, children: addChild(cat.children || []) }
        );
      setTree(prev => addChild(prev));
    }
    setName('');
    setDescription('');
    setParentId(null);
  };

  const handleDelete = (id: number) => {
    const removeNode = (nodes: Category[]): Category[] =>
      nodes
        .filter(n => n.id !== id)
        .map(n => ({ ...n, children: n.children ? removeNode(n.children) : [] }));
    setTree(prev => removeNode(prev));
  };

  const renderNode = (node: Category, depth = 0) => {
    const isExpanded = !!expanded[node.id];
    return (
      <div key={node.id} className="pl-1">
        <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-md hover:bg-muted/40 transition-colors">
          <div className="flex items-center gap-2">
            {node.children && node.children.length > 0 ? (
              <button
                onClick={() => toggle(node.id)}
                className="w-6 h-6 text-sm flex items-center justify-center"
              >
                {isExpanded ? '▾' : '▸'}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <div>
              <div className="text-sm font-medium">{node.name}</div>
              <div className="text-xs text-muted-foreground">{node.description}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setParentId(node.id)}
              className="text-xs px-2 py-1"
            >
              Add Child
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(node.id)}
              className="text-xs px-2 py-1"
            >
              Delete
            </Button>
          </div>
        </div>
        {node.children && node.children.length > 0 && isExpanded && (
          <div className="ml-6 border-l border-border pl-3">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 p-4">
          <h3 className="text-lg font-semibold mb-3">Create Category</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Category name" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            </div>
            <div>
              <Label>Parent</Label>
              <select
                value={parentId ?? ''}
                onChange={e => setParentId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
              >
                <option value="">— Root —</option>
                {flat.map(({ node, depth }) => (
                  <option key={node.id} value={node.id}>
                    {Array(depth).fill('  ').join('')}
                    {node.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full">Add Category</Button>
          </form>
        </Card>

        <Card className="lg:col-span-2 p-4">
          <h3 className="text-lg font-semibold mb-3">Categories</h3>
          <div className="space-y-2 max-h-[60vh] overflow-auto pr-2">
            {tree.map(node => renderNode(node))}
          </div>
        </Card>
      </div>
    </div>
  );
}
