'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Loader2, PlusCircle, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TemplateCatalogProps {
  /** Templates to display */
  templates: Array<{
    id: string;
    name: string;
    description?: string;
    category?: string;
    isActive?: boolean;
  }>;
  /** Loading state */
  isLoading: boolean;
  /** Search query */
  searchQuery: string;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Selected category filter */
  selectedCategory: string;
  /** Set selected category filter */
  setSelectedCategory: (category: string) => void;
  /** Add template to selection */
  onAddTemplate: (template: any) => void;
  /** Available categories */
  categories: string[];
}

/**
 * Component to display available templates
 */
export function TemplateCatalog({
  templates,
  isLoading,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onAddTemplate,
  categories,
}: TemplateCatalogProps) {
  return (
    <div className="flex flex-col">
      <div className="mb-3 flex h-8 items-center justify-between">
        <h3 className="text-sm font-medium">Catálogo de Templates</h3>
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
            data-testid="template-search-input"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-3 flex flex-wrap gap-1">
        <Badge
          variant={selectedCategory === '' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('')}
        >
          Todos
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Template List */}
      <div
        className="flex-grow overflow-auto rounded-md border"
        style={{ height: '400px' }}
        data-testid="template-catalog-list"
      >
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando templates...</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <div className="mb-4 h-16 w-16 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">Nenhum template encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {templates.map((template, index) => (
              <Draggable key={template.id} draggableId={template.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`flex items-center justify-between p-3 ${
                      snapshot.isDragging ? 'bg-accent opacity-90' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium">{template.name}</h4>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {template.description || 'Sem descrição'}
                      </p>
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {template.category || 'Sem categoria'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onAddTemplate(template)}
                      className="gap-1"
                      data-testid={`add-template-${template.id}`}
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Adicionar</span>
                    </Button>
                  </div>
                )}
              </Draggable>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
