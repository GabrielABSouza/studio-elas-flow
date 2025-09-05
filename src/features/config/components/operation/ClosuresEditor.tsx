import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CalendarRangePopover, type DateRange } from '@/components/common/CalendarRangePopover';
import { Plus, Edit2, Trash2, Calendar, Globe, User, Loader2 } from 'lucide-react';
import { format, isAfter, isBefore, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useClosures, useCreateClosure, useUpdateClosure, useDeleteClosure } from '../../hooks/operation';
import { useProfessionals } from '@/features/settings/hooks';
import type { Closure, ClosureScope, CreateClosureRequest, UpdateClosureRequest } from '../../types/operation';

// Form validation schema
const closureFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  range: z.object({
    from: z.string().min(1, 'Data de início é obrigatória'),
    to: z.string().min(1, 'Data de fim é obrigatória'),
  }).refine(data => data.from <= data.to, {
    message: "Data de início deve ser anterior ou igual à data de fim",
    path: ["to"]
  }),
  professionalId: z.string().optional(),
  note: z.string().optional(),
});

type ClosureFormData = z.infer<typeof closureFormSchema>;

interface ClosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: ClosureScope;
  closure?: Closure;
}

function ClosureDialog({ open, onOpenChange, scope, closure }: ClosureDialogProps) {
  const { data: professionals = [] } = useProfessionals();
  const createClosure = useCreateClosure();
  const updateClosure = useUpdateClosure();
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });

  const form = useForm<ClosureFormData>({
    resolver: zodResolver(closureFormSchema),
    defaultValues: {
      title: closure?.title || '',
      range: {
        from: closure?.range.from || '',
        to: closure?.range.to || '',
      },
      professionalId: closure?.professionalId || '',
      note: closure?.note || '',
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  // Update date range when closure changes
  React.useEffect(() => {
    if (closure) {
      const fromDate = new Date(closure.range.from);
      const toDate = new Date(closure.range.to);
      setDateRange({ from: fromDate, to: toDate });
      setValue('range.from', closure.range.from);
      setValue('range.to', closure.range.to);
    } else if (open) {
      // Reset form for new closure
      form.reset({
        title: '',
        range: { from: '', to: '' },
        professionalId: '',
        note: '',
      });
      setDateRange({ from: null, to: null });
    }
  }, [closure, open, setValue, form]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    if (range.from) {
      setValue('range.from', format(range.from, 'yyyy-MM-dd'), { shouldValidate: true });
    }
    if (range.to) {
      setValue('range.to', format(range.to, 'yyyy-MM-dd'), { shouldValidate: true });
    }
  };

  const onSubmit = (data: ClosureFormData) => {
    const payload = {
      scope,
      title: data.title,
      range: data.range,
      professionalId: scope === 'professional' ? data.professionalId : undefined,
      note: data.note || undefined,
    };

    if (closure) {
      updateClosure.mutate({ id: closure.id, ...payload }, {
        onSuccess: () => onOpenChange(false)
      });
    } else {
      createClosure.mutate(payload as CreateClosureRequest, {
        onSuccess: () => onOpenChange(false)
      });
    }
  };

  const isLoading = createClosure.isPending || updateClosure.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {closure ? 'Editar Bloqueio' : 'Novo Bloqueio'}
              {scope === 'global' ? ' - Geral' : ' - Por Profissional'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Feriado Nacional, Férias João..."
                {...register('title')}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Período *</Label>
              <CalendarRangePopover
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder="Selecione o período"
                className="w-full"
              />
              {errors.range && (
                <p className="text-sm text-destructive">
                  {errors.range.to?.message || errors.range.from?.message}
                </p>
              )}
            </div>

            {scope === 'professional' && (
              <div className="space-y-2">
                <Label htmlFor="professionalId">Profissional *</Label>
                <Select value={watch('professionalId')} onValueChange={(value) => setValue('professionalId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map((professional) => (
                      <SelectItem key={professional.id} value={professional.id}>
                        {professional.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {scope === 'professional' && !watch('professionalId') && (
                  <p className="text-sm text-destructive">Profissional é obrigatório</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="note">Observação</Label>
              <Textarea
                id="note"
                placeholder="Observações adicionais..."
                {...register('note')}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  {closure ? 'Atualizar' : 'Criar'} Bloqueio
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getClosureStatusBadge(closure: Closure) {
  const today = new Date();
  const fromDate = new Date(closure.range.from);
  const toDate = new Date(closure.range.to);

  if (isToday(fromDate) || isToday(toDate) || (isBefore(fromDate, today) && isAfter(toDate, today))) {
    return <Badge variant="destructive">Hoje</Badge>;
  }
  if (isAfter(fromDate, today)) {
    return <Badge variant="default">Futuro</Badge>;
  }
  return <Badge variant="secondary">Passado</Badge>;
}

interface ClosuresTabProps {
  scope: ClosureScope;
}

function ClosuresTab({ scope }: ClosuresTabProps) {
  const { data: closures = [], isLoading } = useClosures(scope);
  const { data: professionals = [] } = useProfessionals();
  const deleteClosure = useDeleteClosure();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClosure, setEditingClosure] = useState<Closure | undefined>();
  const [deletingClosure, setDeletingClosure] = useState<Closure | undefined>();

  const handleEdit = (closure: Closure) => {
    setEditingClosure(closure);
    setDialogOpen(true);
  };

  const handleDelete = (closure: Closure) => {
    setDeletingClosure(closure);
  };

  const confirmDelete = () => {
    if (deletingClosure) {
      deleteClosure.mutate(deletingClosure.id);
      setDeletingClosure(undefined);
    }
  };

  const getProfessionalName = (professionalId: string) => {
    return professionals.find(p => p.id === professionalId)?.name || 'Profissional não encontrado';
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {scope === 'global' 
            ? 'Feriados e fechamentos que afetam toda a operação'
            : 'Bloqueios específicos por profissional (férias, licenças, etc.)'
          }
        </p>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Bloqueio
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Status</TableHead>
              {scope === 'professional' && <TableHead>Profissional</TableHead>}
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {closures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={scope === 'professional' ? 5 : 4} className="text-center text-muted-foreground py-8">
                  Nenhum bloqueio encontrado
                </TableCell>
              </TableRow>
            ) : (
              closures.map((closure) => (
                <TableRow key={closure.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{closure.title}</div>
                      {closure.note && (
                        <div className="text-sm text-muted-foreground">{closure.note}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(closure.range.from), 'dd/MM', { locale: ptBR })}
                        {closure.range.from !== closure.range.to && (
                          <> – {format(new Date(closure.range.to), 'dd/MM', { locale: ptBR })}</>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getClosureStatusBadge(closure)}
                  </TableCell>
                  {scope === 'professional' && (
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {closure.professionalId ? getProfessionalName(closure.professionalId) : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(closure)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(closure)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ClosureDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingClosure(undefined);
        }}
        scope={scope}
        closure={editingClosure}
      />

      <AlertDialog open={!!deletingClosure} onOpenChange={() => setDeletingClosure(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o bloqueio "{deletingClosure?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ClosuresEditor() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Bloqueios de Agenda</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gerencie feriados, fechamentos e exceções por profissional
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global">Geral (Feriados)</TabsTrigger>
            <TabsTrigger value="professional">Por Profissional</TabsTrigger>
          </TabsList>
          
          <TabsContent value="global" className="mt-6">
            <ClosuresTab scope="global" />
          </TabsContent>
          
          <TabsContent value="professional" className="mt-6">
            <ClosuresTab scope="professional" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}