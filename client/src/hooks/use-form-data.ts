import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FormData } from '@shared/schema';
import { getUserId, saveFormDraft, loadFormDraft } from '@/lib/storage-utils';
import { apiRequest } from '@/lib/queryClient';

export function useFormData() {
  const queryClient = useQueryClient();
  const userId = getUserId();
  
  const [formData, setFormData] = useState<Partial<FormData>>(() => {
    return loadFormDraft() || {};
  });

  // Load form data from server
  const { data: serverData, isLoading } = useQuery({
    queryKey: [`/api/form/${userId}`],
    enabled: !!userId,
  });

  // Save form data to server
  const saveFormMutation = useMutation({
    mutationFn: async (data: Partial<FormData>) => {
      const response = await apiRequest('POST', '/api/form', {
        userId,
        formData: data,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/form/${userId}`] });
    },
  });

  // Update form data
  const updateFormData = (updates: Partial<FormData>) => {
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);
    saveFormDraft(newFormData);
  };

  // Save to server
  const saveForm = async () => {
    await saveFormMutation.mutateAsync(formData);
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveFormDraft(formData);
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  // Load server data when available
  useEffect(() => {
    if (serverData?.formData) {
      setFormData(serverData.formData);
    }
  }, [serverData]);

  return {
    formData,
    updateFormData,
    saveForm,
    isLoading,
    isSaving: saveFormMutation.isPending,
  };
}
