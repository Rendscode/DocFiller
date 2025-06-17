import { FormData } from "@shared/schema";

const STORAGE_KEYS = {
  MASTER_DATA: 'docfiller_master_data',
  FORM_DRAFT: 'docfiller_form_draft',
  USER_ID: 'docfiller_user_id',
};

export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getUserId(): string {
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
}

export function saveMasterData(masterData: any): void {
  localStorage.setItem(STORAGE_KEYS.MASTER_DATA, JSON.stringify(masterData));
}

export function loadMasterData(): any | null {
  const data = localStorage.getItem(STORAGE_KEYS.MASTER_DATA);
  return data ? JSON.parse(data) : null;
}

export function saveFormDraft(formData: Partial<FormData>): void {
  localStorage.setItem(STORAGE_KEYS.FORM_DRAFT, JSON.stringify(formData));
}

export function loadFormDraft(): Partial<FormData> | null {
  const data = localStorage.getItem(STORAGE_KEYS.FORM_DRAFT);
  return data ? JSON.parse(data) : null;
}

export function clearFormDraft(): void {
  localStorage.removeItem(STORAGE_KEYS.FORM_DRAFT);
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
