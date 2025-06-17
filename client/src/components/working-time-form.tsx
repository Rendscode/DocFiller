import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workingTimeSchema, WorkingTime } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, Plus, Trash2 } from "lucide-react";
import { CalendarWeek } from "@/types/form-data";
import { getCalendarWeekFromDate, getWeekRange, formatWeekRange, calculateTotalHours } from "@/lib/calendar-utils";

interface WorkingTimeFormProps {
  data?: WorkingTime;
  onSubmit: (data: WorkingTime) => void;
}

export default function WorkingTimeForm({ data, onSubmit }: WorkingTimeFormProps) {
  const form = useForm<WorkingTime>({
    resolver: zodResolver(workingTimeSchema),
    defaultValues: data || {
      type: "constant",
      constantHours: 40,
      calendarWeeks: [],
    },
  });

  const [calendarWeeks, setCalendarWeeks] = useState<CalendarWeek[]>(
    data?.calendarWeeks?.map(week => ({
      ...week,
      calendarWeek: getCalendarWeekFromDate(week.startDate),
    })) || []
  );

  const workingTimeType = form.watch("type");

  const addCalendarWeek = () => {
    if (calendarWeeks.length >= 5) return;
    
    const newWeek: CalendarWeek = {
      id: `week_${Date.now()}`,
      startDate: "",
      endDate: "",
      calendarWeek: 0,
      hours: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
      },
    };
    
    setCalendarWeeks([...calendarWeeks, newWeek]);
  };

  const removeCalendarWeek = (id: string) => {
    setCalendarWeeks(calendarWeeks.filter(week => week.id !== id));
  };

  const updateCalendarWeek = (id: string, updates: Partial<CalendarWeek>) => {
    setCalendarWeeks(calendarWeeks.map(week => {
      if (week.id === id) {
        const updated = { ...week, ...updates };
        
        // Auto-calculate week range if start date is provided
        if (updates.startDate) {
          const range = getWeekRange(updates.startDate);
          updated.startDate = range.start;
          updated.endDate = range.end;
          updated.calendarWeek = getCalendarWeekFromDate(range.start);
        }
        
        return updated;
      }
      return week;
    }));
  };

  const handleSubmit = (data: WorkingTime) => {
    const submissionData = {
      ...data,
      calendarWeeks: workingTimeType === "variable" ? calendarWeeks : [],
    };
    onSubmit(submissionData);
  };

  return (
    <section id="arbeitszeit" className="form-section">
      <div className="form-section-header">
        <h2 className="text-lg font-semibold text-gray-900">
          <Clock className="inline mr-2 h-5 w-5 text-primary" />
          2. Angaben zur Arbeitszeit
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Maximal 5 Kalenderwochen können eingetragen werden.
        </p>
      </div>
      
      <div className="form-section-content">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arbeitszeit-Typ</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="constant" id="constant" />
                        <div className="ml-3">
                          <label htmlFor="constant" className="text-sm font-medium text-gray-900 cursor-pointer">
                            Gleichbleibend
                          </label>
                          <div className="text-sm text-gray-500">
                            Wöchentlich gleiche Stundenzahl
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="variable" id="variable" />
                        <div className="ml-3">
                          <label htmlFor="variable" className="text-sm font-medium text-gray-900 cursor-pointer">
                            Variabel
                          </label>
                          <div className="text-sm text-gray-500">
                            Unterschiedliche Arbeitszeiten
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {workingTimeType === "constant" && (
              <FormField
                control={form.control}
                name="constantHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stundenzahl wöchentlich</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          max="168"
                          className="w-32"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <span className="text-sm text-gray-500">Stunden pro Woche</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {workingTimeType === "variable" && (
              <div className="space-y-4">
                {calendarWeeks.map((week, index) => (
                  <div key={week.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        Kalenderwoche {index + 1}
                        {week.calendarWeek > 0 && (
                          <span className="ml-2 text-sm text-gray-500">
                            (KW {week.calendarWeek})
                          </span>
                        )}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCalendarWeek(week.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Entfernen
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Von (Datum)
                        </label>
                        <Input
                          type="date"
                          value={week.startDate}
                          onChange={(e) => updateCalendarWeek(week.id, { startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bis (Datum)
                        </label>
                        <Input
                          type="date"
                          value={week.endDate}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day, dayIndex) => (
                        <div key={day}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'][dayIndex]}
                          </label>
                          <Input
                            type="number"
                            step="0.5"
                            min="0"
                            max="24"
                            className="w-full text-sm"
                            placeholder="0"
                            value={week.hours[day] || ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              updateCalendarWeek(week.id, {
                                hours: { ...week.hours, [day]: value }
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 text-right">
                      <span className="text-sm text-gray-600">
                        Gesamt: <span className="font-medium text-gray-900">
                          {calculateTotalHours(week.hours)} Stunden
                        </span>
                      </span>
                    </div>
                  </div>
                ))}

                {calendarWeeks.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-2 border-dashed border-gray-300 p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400"
                    onClick={addCalendarWeek}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Weitere Kalenderwoche hinzufügen (max. 5)
                  </Button>
                )}
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button type="submit">
                Arbeitszeit speichern
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
