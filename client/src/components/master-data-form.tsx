import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { masterDataSchema, MasterData } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, User } from "lucide-react";
import { useEffect } from "react";
import { saveMasterData, loadMasterData } from "@/lib/storage-utils";

interface MasterDataFormProps {
  data?: MasterData;
  onSubmit: (data: MasterData) => void;
  onAutoSave?: (data: MasterData) => void;
}

export default function MasterDataForm({ data, onSubmit, onAutoSave }: MasterDataFormProps) {
  const form = useForm<MasterData>({
    resolver: zodResolver(masterDataSchema),
    defaultValues: data || loadMasterData() || {
      customerNumber: "",
      firstName: "",
      lastName: "",
      birthDate: "",
      street: "",
      postalCode: "",
      city: "",
    },
  });

  const isComplete = form.formState.isValid && !Object.keys(form.formState.errors).length;

  // Auto-save to localStorage
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value && onAutoSave) {
        onAutoSave(value as MasterData);
      }
      saveMasterData(value);
    });
    return () => subscription.unsubscribe();
  }, [form, onAutoSave]);

  const handleSubmit = (data: MasterData) => {
    saveMasterData(data);
    onSubmit(data);
  };

  return (
    <section id="stammdaten" className="form-section">
      <div className="form-section-header">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            <User className="inline mr-2 h-5 w-5 text-primary" />
            Stammdaten
          </h2>
          {isComplete && (
            <div className="flex items-center text-sm text-green-600">
              <Check className="mr-1 h-4 w-4" />
              Gespeichert
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Diese Daten werden automatisch für alle Formulare verwendet.
        </p>
      </div>
      
      <div className="form-section-content">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customerNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kundennummer</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. KD-2024-001234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geburtsdatum</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vorname</FormLabel>
                    <FormControl>
                      <Input placeholder="Vorname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nachname</FormLabel>
                    <FormControl>
                      <Input placeholder="Nachname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Straße, Hausnummer</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Musterstraße 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postleitzahl</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. 10115" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wohnort</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Berlin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
