export interface CalendarWeek {
  id: string;
  startDate: string;
  endDate: string;
  calendarWeek: number;
  hours: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
}

export interface FormProgress {
  masterData: boolean;
  generalInfo: boolean;
  workingTime: boolean;
  income: boolean;
}

export interface IncomeCalculation {
  income: number;
  expenses: number;
  netIncome: number;
  expensePercentage: number;
}
