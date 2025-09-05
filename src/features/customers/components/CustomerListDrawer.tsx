import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerCard, CustomerCardSkeleton } from "./CustomerCard";
import { useCustomersList, Cohort } from "../hooks";

export interface CustomerListDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  cohort: Cohort;
  defaultRange?: { from: Date; to: Date };
}

export function CustomerListDrawer({
  open,
  onOpenChange,
  title,
  cohort,
  defaultRange
}: CustomerListDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "recent">("recent");

  // Get customers list
  const { data: customersData, isLoading: isLoadingCustomers } = useCustomersList({
    cohort,
    q: searchQuery,
    filters: defaultRange ? { createdBetween: defaultRange } : undefined
  });

  const customers = customersData?.data || [];

  // Sort customers
  const sortedCustomers = [...customers].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleClose = () => {
    onOpenChange(false);
    setSearchQuery("");
    setSortBy("recent");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl">{title}</DrawerTitle>
              <DrawerDescription>
                {isLoadingCustomers ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `${customers.length} ${customers.length === 1 ? 'cliente encontrada' : 'clientes encontradas'}`
                )}
              </DrawerDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex flex-col h-full">
          {/* Search and filters */}
          <div className="p-4 border-b space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={sortBy === "name" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(sortBy === "name" ? "recent" : "name")}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {sortBy === "name" ? "Nome" : "Recentes"}
              </Button>
            </div>
          </div>

          {/* Customer list */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3 pb-8">
              {isLoadingCustomers ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <CustomerCardSkeleton key={i} />
                ))
              ) : sortedCustomers.length > 0 ? (
                // Customer cards
                sortedCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    id={customer.id}
                    name={customer.name}
                    phone={customer.phone}
                    email={customer.email}
                    since={customer.createdAt}
                    preferencesCount={customer.preferences?.length}
                    risk={cohort === 'risk' || (customer.notes?.includes('Sem contato há mais de 90 dias'))}
                    highPotential={cohort === 'high_potential' || (customer.preferences && customer.preferences.length >= 3)}
                    onClick={() => {
                      // Navigation is handled by CustomerCard internally
                      handleClose();
                    }}
                  />
                ))
              ) : (
                // Empty state
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {searchQuery ? 'Nenhuma cliente encontrada' : 'Nenhuma cliente nesta categoria'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery 
                      ? 'Tente ajustar sua busca ou verificar a categoria selecionada.'
                      : 'Não há clientes que correspondam aos critérios desta categoria no momento.'
                    }
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="mt-4"
                    >
                      Limpar busca
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}