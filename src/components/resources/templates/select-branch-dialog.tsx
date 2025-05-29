'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SelectBranchDialogProps {
  isOpen: boolean;
  templateName: string;
  onClose: () => void;
  onConfirm: (branch: string) => void;
}

export function SelectBranchDialog({
  isOpen,
  templateName,
  onClose,
  onConfirm,
}: SelectBranchDialogProps) {
  const { t } = useTranslation('templates');
  const [isCustomBranch, setIsCustomBranch] = useState(false);

  // Common branches that will be available as quick options
  const commonBranches = ['main', 'master', 'develop', 'release'];

  // Form schema for validation
  const formSchema = z.object({
    branch: z.string().min(1, {
      message: t('branchSelection.validation.required'),
    }),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branch: 'main',
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onConfirm(values.branch);
  };

  // Toggle between using common branches or custom input
  const handleBranchTypeChange = (useCustom: boolean) => {
    setIsCustomBranch(useCustom);

    if (!useCustom) {
      form.setValue('branch', 'main');
    } else {
      form.setValue('branch', '');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]" data-testid="select-branch-dialog">
        <DialogHeader>
          <DialogTitle>{t('branchSelection.title')}</DialogTitle>
          <DialogDescription>
            {t('branchSelection.description', { name: templateName })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant={isCustomBranch ? 'outline' : 'secondary'}
                onClick={() => handleBranchTypeChange(false)}
                className="flex-1"
                data-testid="common-branch-button"
              >
                {t('branchSelection.commonBranch')}
              </Button>
              <Button
                type="button"
                variant={isCustomBranch ? 'secondary' : 'outline'}
                onClick={() => handleBranchTypeChange(true)}
                className="flex-1"
                data-testid="custom-branch-button"
              >
                {t('branchSelection.customBranch')}
              </Button>
            </div>

            {isCustomBranch ? (
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('branchSelection.branchName')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('branchSelection.customPlaceholder')}
                        {...field}
                        data-testid="custom-branch-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('branchSelection.branchName')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="common-branch-select">
                          <SelectValue placeholder={t('branchSelection.selectPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commonBranches.map((branch) => (
                          <SelectItem
                            key={branch}
                            value={branch}
                            data-testid={`branch-option-${branch}`}
                          >
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="cancel-branch-button"
              >
                {t('branchSelection.buttons.cancel')}
              </Button>
              <Button type="submit" data-testid="confirm-branch-button">
                {t('branchSelection.buttons.validate')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
