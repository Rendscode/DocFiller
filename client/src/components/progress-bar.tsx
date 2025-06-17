import { FormData } from "@shared/schema";

interface ProgressBarProps {
  formData: Partial<FormData>;
}

export default function ProgressBar({ formData }: ProgressBarProps) {
  const calculateProgress = () => {
    let completed = 0;
    const total = 4;

    if (formData.masterData?.firstName && formData.masterData?.lastName) completed++;
    if (formData.generalInfo?.activityType) completed++;
    if (formData.workingTime?.type) completed++;
    if (formData.income?.type) completed++;

    return { completed, total, percentage: (completed / total) * 100 };
  };

  const progress = calculateProgress();

  return (
    <div className="form-section">
      <div className="form-section-content">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Fortschritt</h2>
          <span className="text-sm text-gray-500">
            {progress.completed} von {progress.total} Abschnitten ausgefüllt
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
