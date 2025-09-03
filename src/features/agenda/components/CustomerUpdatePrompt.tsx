import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomerUpdatePromptProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerId: string;
}

export function CustomerUpdatePrompt({ isOpen, onClose, customerName, customerId }: CustomerUpdatePromptProps) {
  const navigate = useNavigate();

  const handleUpdateCustomer = () => {
    // Navegar para edição do cliente usando SPA routing
    navigate(`/clients?edit=${customerId}&from=agenda`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Atualizar Cliente
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            O atendimento de <strong>{customerName}</strong> foi finalizado.
          </p>
          <p className="text-sm">
            Gostaria de atualizar as informações da cliente ou adicionar observações?
          </p>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Não, obrigada
          </Button>
          <Button onClick={handleUpdateCustomer}>
            Atualizar Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}