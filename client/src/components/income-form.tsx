import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { incomeSchema, Income } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Euro, AlertTriangle } from "lucide-react";
import { IncomeCalculation } from "@/types/form-data";

interface IncomeFormProps {
  data?: Income;
  onSubmit: (data: Income) => void;
}

export default function IncomeForm({ data, onSubmit }: IncomeFormProps) {
  const [activeTab, setActiveTab] = useState<string>(data?.type || "existing");
  const [calculation, setCalculation] = useState<IncomeCalculation>({
    income: 0,
    expenses: 0,
    netIncome: 0,
    expensePercentage: 30,
  });

  const form = useForm<Income>({
    resolver: zodResolver(incomeSchema),
    defaultValues: data || {
      type: "existing",
      existingActivity: {
        scope: "same",
        monthlyIncome: 0,
        isUnchanged: false,
      },
      newActivity: {
        expectedIncome: "low",
      },
      detailedInfo: {
        monthlyIncome: 0,
        expenseTreatment: "flat",
        businessExpenses: 0,
        depreciation: 0,
        incomeTax: 0,
        churchTax: 0,
        solidarityTax: 0,
      },
    },
  });

  const calculateIncome = (income: number, expenseTreatment: "flat" | "detailed", detailedExpenses?: number) => {
    let expenses: number;
    
    if (expenseTreatment === "flat") {
      expenses = income * 0.3;
    } else {
      expenses = detailedExpenses || 0;
    }
    
    const netIncome = Math.max(0, income - expenses);
    
    setCalculation({
      income,
      expenses,
      netIncome,
      expensePercentage: expenseTreatment === "flat" ? 30 : (expenses / income) * 100,
    });
  };

  const handleSubmit = (data: Income) => {
    const submissionData = {
      ...data,
      type: activeTab as "existing" | "new" | "detailed",
    };
    onSubmit(submissionData);
  };

  return (
    <section id="einkommen" className="form-section">
      <div className="form-section-header">
        <h2 className="text-lg font-semibold text-gray-900">
          <Euro className="inline mr-2 h-5 w-5 text-primary" />
          3. Angaben zum Einkommen
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Einkommen ist der Überschuss der Einnahmen über die Ausgaben.
        </p>
      </div>

      <div className="form-section-content">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="existing" className="flex-1">
                  3.1 Bestehende Tätigkeit
                </TabsTrigger>
                <TabsTrigger value="new" className="flex-1">
                  3.2 Neue Tätigkeit
                </TabsTrigger>
                <TabsTrigger value="detailed" className="flex-1">
                  3.3 Weitere Angaben
                </TabsTrigger>
              </TabsList>

              <TabsContent value="existing" className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Voraussetzungen für bestehende Tätigkeit
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Tätigkeit wird mindestens 12 Monate in den letzten 18 Monaten ausgeübt</li>
                    <li>• Einnahmen erhöhen sich während des Arbeitslosengeldbezugs nicht</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <FormField
                      control={form.control}
                      name="existingActivity.scope"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="same" id="same-scope" />
                                <label htmlFor="same-scope" className="text-sm font-medium text-gray-900">
                                  Tätigkeit wird im gleichen Umfang fortgeführt
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="ml-6 mt-4 space-y-4">
                      <FormField
                        control={form.control}
                        name="existingActivity.isUnchanged"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm text-gray-700">
                              Einnahmen sind monatlich unverändert
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="existingActivity.monthlyIncome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Höhe der Einnahmen monatlich</FormLabel>
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="w-32"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <span className="text-sm text-gray-500">EUR</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <FormField
                      control={form.control}
                      name="existingActivity.scope"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="different" id="different-scope" />
                                <label htmlFor="different-scope" className="text-sm font-medium text-gray-900">
                                  Andere Einnahmen
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="ml-6 mt-4">
                      <p className="text-sm text-gray-600">
                        Bitte Angaben zur Höhe der Einnahmen unter 3.3 machen.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="new" className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Neue Tätigkeit</h4>
                  <p className="text-sm text-green-800">
                    Für neu aufgenommene Tätigkeiten gelten besondere Regelungen.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <FormField
                      control={form.control}
                      name="newActivity.expectedIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="low" id="low-income" />
                                <label htmlFor="low-income" className="text-sm font-medium text-gray-900">
                                  Erwartete Einnahmen ≤ 165 EUR monatlich
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="ml-6 mt-4">
                      <p className="text-sm text-gray-600">Keine weiteren Angaben erforderlich.</p>
                      <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-800">
                          <AlertTriangle className="inline mr-1 h-3 w-3" />
                          Steigerung über 165 EUR unverzüglich melden!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <FormField
                      control={form.control}
                      name="newActivity.expectedIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="high" id="high-income" />
                                <label htmlFor="high-income" className="text-sm font-medium text-gray-900">
                                  Erwartete Einnahmen > 165 EUR monatlich
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="ml-6 mt-4">
                      <p className="text-sm text-gray-600">
                        Bitte Angaben zur Höhe der Einnahmen unter 3.3 machen.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="detailed" className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Detaillierte Einnahmen- und Ausgabenangaben
                  </h4>
                  <p className="text-sm text-gray-600">
                    Bei monatlich schwankenden Einnahmen um mehr als 5% ist dieser Abschnitt monatlich neu auszufüllen.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="detailedInfo.monthlyIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Einnahmen monatlich</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                field.onChange(value);
                                calculateIncome(value, form.watch("detailedInfo.expenseTreatment") || "flat");
                              }}
                            />
                          </FormControl>
                          <span className="text-sm text-gray-500">EUR</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="detailedInfo.expenseTreatment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ausgaben-Behandlung</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value);
                              calculateIncome(
                                form.watch("detailedInfo.monthlyIncome") || 0,
                                value as "flat" | "detailed"
                              );
                            }}
                            defaultValue={field.value}
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="flat" id="flat-expenses" />
                              <label htmlFor="flat-expenses" className="text-sm text-gray-700">
                                30% Pauschale (empfohlen)
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="detailed" id="detailed-expenses" />
                              <label htmlFor="detailed-expenses" className="text-sm text-gray-700">
                                Detaillierte Ausgaben
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Calculation Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Automatische Berechnung</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Einnahmen:</span>
                      <span className="font-medium text-blue-900 ml-2">
                        {calculation.income.toFixed(2)} EUR
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">
                        Ausgaben ({calculation.expensePercentage.toFixed(0)}%):
                      </span>
                      <span className="font-medium text-blue-900 ml-2">
                        {calculation.expenses.toFixed(2)} EUR
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Einkommen:</span>
                      <span className="font-medium text-blue-900 ml-2">
                        {calculation.netIncome.toFixed(2)} EUR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Expenses */}
                {form.watch("detailedInfo.expenseTreatment") === "detailed" && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Detaillierte Ausgaben</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="detailedInfo.businessExpenses"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Betriebsausgaben (§ 4 Abs. 4 EStG)</FormLabel>
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <span className="text-sm text-gray-500">EUR</span>
                            </div>
                            <p className="text-xs text-gray-500">Belege vorlegen soweit vorhanden</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="detailedInfo.depreciation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Absetzung für Abnutzung (§ 7 EStG)</FormLabel>
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <span className="text-sm text-gray-500">EUR</span>
                            </div>
                            <p className="text-xs text-gray-500">Für Wirtschaftsgüter des Betriebsvermögens</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="detailedInfo.incomeTax"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Einkommensteuer</FormLabel>
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <span className="text-sm text-gray-500">EUR</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="detailedInfo.churchTax"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kirchensteuer</FormLabel>
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <span className="text-sm text-gray-500">EUR</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="detailedInfo.solidarityTax"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Solidaritätszuschlag</FormLabel>
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <span className="text-sm text-gray-500">EUR</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Tax Information */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">Steuerliche Angaben</h5>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <FormField
                            control={form.control}
                            name="detailedInfo.taxAssessmentAttached"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm text-gray-700">
                                  Einkommensteuerbescheid für das Kalenderjahr
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="detailedInfo.taxYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="w-20"
                                    placeholder="2024"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <span className="text-sm text-gray-700">ist beigefügt</span>
                        </div>

                        <FormField
                          control={form.control}
                          name="detailedInfo.taxReturnSubmitted"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm text-gray-700">
                                Einkommensteuererklärung für das letzte Kalenderjahr wurde abgegeben
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="detailedInfo.taxReturnAttached"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm text-gray-700">
                                Einkommensteuererklärung für das letzte Kalenderjahr ist beigefügt
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </section>
  );
}
