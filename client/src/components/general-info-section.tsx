import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { generalInfoSchema } from '@/lib/form-validation';
import type { FormData } from '@shared/schema';

interface GeneralInfoSectionProps {
  data?: FormData;
  onSubmit: (data: any) => void;
}

export default function GeneralInfoSection({ data, onSubmit }: GeneralInfoSectionProps) {
  const form = useForm({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      activityStartDate: data?.activityStartDate || '',
      activityEndDate: data?.activityEndDate || '',
      activityLocationValue: data?.activityLocationValue || '',
      activityType: data?.activityType || '',
      activityUntilFurtherNotice: data?.activityUntilFurtherNotice || false,
    },
  });

  const handleSubmit = (formData: any) => {
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-blue-500 mr-2">💼</span>
          1. Allgemeine Angaben zur Tätigkeit
        </h2>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                          className="flex-1"
                          disabled={form.watch('activityUntilFurtherNotice')}
                        />
                      </FormControl>
                      <FormField
                        control={form.control}
                        name="activityUntilFurtherNotice"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm">bis auf weiteres</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="activityLocationValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ort der Tätigkeit</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="z.B. Berlin, Hamburg, Remote" />
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
                      <Input {...field} placeholder="z.B. Webdesign, Beratung, Programmierung" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
