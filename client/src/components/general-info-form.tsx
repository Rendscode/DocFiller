import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generalInfoSchema, GeneralInfo } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase } from "lucide-react";

interface GeneralInfoFormProps {
  data?: GeneralInfo;
  onSubmit: (data: GeneralInfo) => void;
}

export default function GeneralInfoForm({ data, onSubmit }: GeneralInfoFormProps) {
  const form = useForm<GeneralInfo>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: data || {
      activityStartDate: "",
      activityEndDate: "",
      isIndefinite: false,
      activityLocation: "",
      activityType: "",
    },
  });

  return (
    <section id="allgemein" className="form-section">
      <div className="form-section-header">
        <h2 className="text-lg font-semibold text-gray-900">
          <Briefcase className="inline mr-2 h-5 w-5 text-primary" />
          1. Allgemeine Angaben zur Tätigkeit
        </h2>
      </div>
      
      <div className="form-section-content">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="activityStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tätigkeit wird ausgeübt ab/seit</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="activityEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tätigkeit bis</FormLabel>
                    <div className="flex items-center space-x-3">
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          disabled={form.watch("isIndefinite")}
                        />
                      </FormControl>
                      <FormField
                        control={form.control}
                        name="isIndefinite"
                        render={({ field: checkboxField }) => (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={checkboxField.value}
                              onCheckedChange={checkboxField.onChange}
                            />
                            <label className="text-sm text-gray-700">
                              bis auf weiteres
                            </label>
                          </div>
                        )}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="activityLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ort der Tätigkeit</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Berlin, Hamburg, Remote" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="activityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Art der Tätigkeit</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Webdesign, Beratung, Programmierung" {...field} />
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
