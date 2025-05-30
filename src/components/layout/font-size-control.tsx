'use client';

import { Type } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFontScale } from '@/contexts/font-scale-context';

const fontSizeOptions = [
  { label: 'Pequena', value: 0.8, style: 'text-xs' },
  { label: 'Média', value: 0.9, style: 'text-sm' },
  { label: 'Normal', value: 1, style: 'text-base' },
  { label: 'Grande', value: 1.1, style: 'text-lg' },
  { label: 'Muito grande', value: 1.2, style: 'text-xl' },
];

export function FontSizeControl() {
  const { fontScale, setFontScale, resetFontScale } = useFontScale();

  // Utilizamos o setFontScale do contexto para garantir que o estado seja atualizado corretamente
  const handleSelectFontSize = (value: number) => {
    setFontScale(value);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="Ajustar tamanho da fonte"
              >
                <Type className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Tamanho da fonte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {fontSizeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSelectFontSize(option.value)}
                  className={`cursor-pointer ${option.style} ${
                    Math.abs(fontScale - option.value) < 0.05 ? 'bg-secondary/50' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {option.label}
                    {Math.abs(fontScale - option.value) < 0.05 && (
                      <span className="ml-auto text-xs text-muted-foreground">(atual)</span>
                    )}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={resetFontScale}
                className="cursor-pointer text-primary"
              >
                Restaurar padrão
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tamanho da fonte</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
