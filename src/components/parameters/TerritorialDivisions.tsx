import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Territory, TerritoryFormData, API_URL } from './territorial-divisions/types';
import { TerritoryTreeItem } from './territorial-divisions/TerritoryTreeItem';
import { TerritoryDialogs } from './territorial-divisions/TerritoryDialogs';

const TerritorialDivisions = () => {
  const [divisions, setDivisions] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set([1, 2]));
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [territoryToDelete, setTerritoryToDelete] = useState<Territory | null>(null);
  const [formData, setFormData] = useState<TerritoryFormData>({
    name: '',
    camera_count: 0,
    parent_id: null,
    color: 'bg-blue-500',
  });

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch divisions');
      const data = await response.json();
      setDivisions(data);
    } catch (error) {
      console.error('Error fetching divisions:', error);
      toast.error('Ошибка загрузки территорий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  const filterDivisions = (items: Territory[], query: string): Territory[] => {
    if (!query.trim()) return items;
    
    const lowerQuery = query.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(lowerQuery));
  };

  const buildTree = (items: Territory[]): Territory[] => {
    const map = new Map<number, Territory>();
    const roots: Territory[] = [];

    items.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });

    items.forEach((item) => {
      const node = map.get(item.id)!;
      if (item.parent_id === null) {
        roots.push(node);
      } else {
        const parent = map.get(item.parent_id);
        if (parent) {
          parent.children!.push(node);
        }
      }
    });

    return roots;
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      camera_count: 0,
      parent_id: null,
      color: 'bg-blue-500',
    });
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Введите название территории');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          camera_count: formData.camera_count,
          parent_id: formData.parent_id,
          color: formData.color,
        }),
      });

      if (!response.ok) throw new Error('Failed to create division');

      await fetchDivisions();
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success(`Территория "${formData.name}" создана`);
    } catch (error) {
      console.error('Error creating division:', error);
      toast.error('Ошибка создания территории');
    }
  };

  const handleEdit = async () => {
    if (!selectedTerritory || !formData.name.trim()) {
      toast.error('Введите название территории');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTerritory.id,
          name: formData.name,
          camera_count: formData.camera_count,
          parent_id: formData.parent_id,
          color: formData.color,
        }),
      });

      if (!response.ok) throw new Error('Failed to update division');

      await fetchDivisions();
      setIsEditDialogOpen(false);
      setSelectedTerritory(null);
      resetForm();
      toast.success('Территория обновлена');
    } catch (error) {
      console.error('Error updating division:', error);
      toast.error('Ошибка обновления территории');
    }
  };

  const handleDelete = async () => {
    if (!territoryToDelete) return;

    const hasChildren = divisions.some((d) => d.parent_id === territoryToDelete.id);
    if (hasChildren) {
      toast.error('Удалите сначала все дочерние территории');
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: territoryToDelete.id }),
      });

      if (!response.ok) throw new Error('Failed to delete division');

      await fetchDivisions();
      setIsDeleteDialogOpen(false);
      toast.success(`Территория "${territoryToDelete.name}" удалена`);
      setTerritoryToDelete(null);
    } catch (error) {
      console.error('Error deleting division:', error);
      toast.error('Ошибка удаления территории');
    }
  };

  const openEditDialog = (territory: Territory) => {
    setSelectedTerritory(territory);
    setFormData({
      name: territory.name,
      camera_count: territory.camera_count,
      parent_id: territory.parent_id,
      color: territory.color,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (territory: Territory) => {
    setTerritoryToDelete(territory);
    setIsDeleteDialogOpen(true);
  };

  const filteredDivisions = filterDivisions(divisions, searchQuery);
  const tree = buildTree(filteredDivisions);
  const rootDivisions = divisions.filter((d) => d.parent_id === null);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="MapPin" size={20} />
            Территориальные деления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="MapPin" size={20} />
            Территориальные деления
          </CardTitle>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить территорию
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Поиск территории..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <Icon name="X" size={16} />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-2">
            {filteredDivisions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'Территории не найдены' : 'Нет территорий'}
              </div>
            ) : (
              tree.map((node) => (
                <TerritoryTreeItem
                  key={node.id}
                  node={node}
                  expandedIds={expandedIds}
                  onToggleExpand={toggleExpand}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <TerritoryDialogs
        isCreateDialogOpen={isCreateDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        formData={formData}
        selectedTerritory={selectedTerritory}
        territoryToDelete={territoryToDelete}
        rootDivisions={rootDivisions}
        onCreateDialogChange={setIsCreateDialogOpen}
        onEditDialogChange={setIsEditDialogOpen}
        onDeleteDialogChange={setIsDeleteDialogOpen}
        onFormDataChange={setFormData}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Card>
  );
};

export default TerritorialDivisions;
