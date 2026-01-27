import {
  computed,
  inject,
  reactive,
  ref,
  type ComputedRef,
  type InjectionKey,
  type Ref
} from 'vue';
import {
  fetchOwnerWaitlist,
  fetchWaitlistBySlug,
  fetchWaitlistEntries,
  submitPublicEntry,
  updateWaitlist
} from '../api/waitlist';
import type {
  WaitlistEntryResponse,
  WaitlistRecordResponse,
  WaitlistSaveRequest
} from '../api/waitlist';

export type WaitlistFieldType = 'email' | 'text' | 'boolean';

export interface WaitlistField {
  id: string;
  label: string;
  type: WaitlistFieldType;
}

export interface WaitlistConfig {
  title: string;
  description: string;
  productName: string;
  confirmationTitle: string;
  confirmationDescription: string;
  isActive: boolean;
}

export interface WaitlistEntryDetail {
  label: string;
  value: string;
}

export interface WaitlistEntry {
  id: string;
  joinedAt: string;
  values: {
    primary: string;
  };
  details: WaitlistEntryDetail[];
}

export interface WaitlistStore {
  waitlistConfig: WaitlistConfig;
  waitlistFields: Ref<WaitlistField[]>;
  waitlistEntries: Ref<WaitlistEntry[]>;
  publicFormValues: Record<string, string | boolean>;
  waitlistSaved: Ref<boolean>;
  urlCopied: Ref<boolean>;
  publicJoinCompleted: Ref<boolean>;
  waitlistSlug: ComputedRef<string>;
  addField: (label: string, type: WaitlistFieldType) => boolean;
  removeField: (fieldId: string) => void;
  saveWaitlist: () => Promise<void>;
  loadOwnerWaitlist: () => Promise<void>;
  loadWaitlistBySlug: (slug: string) => Promise<void>;
  loadWaitlistEntries: () => Promise<void>;
  submitPublicJoin: () => Promise<void>;
  resetPublicJoin: () => void;
  setUrlCopied: (value: boolean) => void;
  getShareableUrl: (origin: string) => string;
}

const createSlug = (value: string): string => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return 'waitlist';
  }
  return trimmed
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const createWaitlistStore = (): WaitlistStore => {
  const waitlistId = ref('');
  const activeWaitlistSlug = ref('');

  const waitlistConfig = reactive<WaitlistConfig>({
    title: 'Join the launch waitlist',
    description: 'Get updates on our upcoming product release.',
    productName: 'Product Launch',
    confirmationTitle: 'Thanks for joining!',
    confirmationDescription: 'We will be in touch with updates soon.',
    isActive: true
  });

  const waitlistFields = ref<WaitlistField[]>([
    {
      id: 'email-field',
      label: 'Email address',
      type: 'email'
    }
  ]);

  const publicFormValues = reactive<Record<string, string | boolean>>({
    'email-field': ''
  });

  const waitlistEntries = ref<WaitlistEntry[]>([]);
  const waitlistSaved = ref(false);
  const urlCopied = ref(false);
  const publicJoinCompleted = ref(false);

  const waitlistSlug = computed<string>((): string => {
    if (activeWaitlistSlug.value) {
      return activeWaitlistSlug.value;
    }
    return createSlug(waitlistConfig.title || waitlistConfig.productName);
  });

  const ensurePublicFormValues = (fields: WaitlistField[]): void => {
    fields.forEach((field): void => {
      if (publicFormValues[field.id] === undefined) {
        publicFormValues[field.id] = field.type === 'boolean' ? false : '';
      }
    });
  };

  const applyWaitlistRecord = (record: WaitlistRecordResponse): void => {
    waitlistId.value = record.id;
    activeWaitlistSlug.value = record.slug;
    waitlistFields.value = record.fields;
    waitlistConfig.productName = record.productName;
    waitlistConfig.title = record.title;
    waitlistConfig.description = record.description;
    waitlistConfig.confirmationTitle = record.confirmationTitle;
    waitlistConfig.confirmationDescription = record.confirmationDescription;
    waitlistConfig.isActive = record.isActive;
    ensurePublicFormValues(record.fields);
  };

  const addField = (label: string, type: WaitlistFieldType): boolean => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      return false;
    }

    const identifier = `field-${Date.now()}`;
    waitlistFields.value = [
      ...waitlistFields.value,
      {
        id: identifier,
        label: trimmedLabel,
        type
      }
    ];
    publicFormValues[identifier] = type === 'boolean' ? false : '';
    return true;
  };

  const removeField = (fieldId: string): void => {
    waitlistFields.value = waitlistFields.value.filter(
      (field): boolean => field.id !== fieldId
    );
    delete publicFormValues[fieldId];
  };

  const toSaveRequest = (): WaitlistSaveRequest => {
    return {
      productName: waitlistConfig.productName,
      title: waitlistConfig.title,
      description: waitlistConfig.description,
      confirmationTitle: waitlistConfig.confirmationTitle,
      confirmationDescription: waitlistConfig.confirmationDescription,
      isActive: waitlistConfig.isActive,
      fields: waitlistFields.value.map((field) => ({
        label: field.label,
        type: field.type
      }))
    };
  };

  const saveWaitlist = async (): Promise<void> => {
    if (!waitlistId.value) {
      const ownerWaitlist = await fetchOwnerWaitlist();
      applyWaitlistRecord(ownerWaitlist);
    }

    const updated = await updateWaitlist(waitlistId.value, toSaveRequest());
    applyWaitlistRecord(updated);
    waitlistSaved.value = true;
  };

  const loadOwnerWaitlist = async (): Promise<void> => {
    const record = await fetchOwnerWaitlist();
    applyWaitlistRecord(record);
  };

  const loadWaitlistBySlug = async (slug: string): Promise<void> => {
    const record = await fetchWaitlistBySlug(slug);
    applyWaitlistRecord(record);
  };

  const loadWaitlistEntries = async (): Promise<void> => {
    if (!waitlistId.value) {
      throw new Error('Waitlist ID is not available.');
    }
    const response = await fetchWaitlistEntries(waitlistId.value);
    waitlistEntries.value = response.entries.map((entry) => {
      return formatEntry(entry);
    });
  };

  const formatEntryDetails = (
    entryValues: Record<string, string | boolean>
  ): WaitlistEntryDetail[] => {
    return waitlistFields.value.map((field): WaitlistEntryDetail => {
      const rawValue = entryValues[field.id];
      const displayValue =
        typeof rawValue === 'boolean' ? (rawValue ? 'Yes' : 'No') : `${rawValue}`;
      return {
        label: field.label,
        value: displayValue
      };
    });
  };

  const getPrimaryValue = (entryValues: Record<string, string | boolean>): string => {
    const emailField = waitlistFields.value.find(
      (field): boolean => field.type === 'email'
    );
    if (!emailField) {
      const firstValue = Object.values(entryValues)[0];
      return typeof firstValue === 'string' ? firstValue : 'New response';
    }
    const value = entryValues[emailField.id];
    return typeof value === 'string' && value ? value : 'New response';
  };

  const formatEntry = (entry: WaitlistEntryResponse): WaitlistEntry => {
    return {
      id: entry.id,
      joinedAt: entry.joinedAt,
      values: {
        primary: getPrimaryValue(entry.values)
      },
      details: formatEntryDetails(entry.values)
    };
  };

  const submitPublicJoin = async (): Promise<void> => {
    const slug = activeWaitlistSlug.value || waitlistSlug.value;
    if (!slug) {
      throw new Error('Waitlist slug is not available.');
    }

    const entryValues: Record<string, string | boolean> = {};
    waitlistFields.value.forEach((field): void => {
      entryValues[field.id] = publicFormValues[field.id];
    });

    const entry = await submitPublicEntry(slug, { values: entryValues });
    waitlistEntries.value = [formatEntry(entry), ...waitlistEntries.value];
    publicJoinCompleted.value = true;
  };

  const resetPublicJoin = (): void => {
    waitlistFields.value.forEach((field): void => {
      publicFormValues[field.id] = field.type === 'boolean' ? false : '';
    });
    publicJoinCompleted.value = false;
  };

  const setUrlCopied = (value: boolean): void => {
    urlCopied.value = value;
  };

  const getShareableUrl = (origin: string): string => {
    return `${origin}/#/public/${waitlistSlug.value}`;
  };

  return {
    waitlistConfig,
    waitlistFields,
    waitlistEntries,
    publicFormValues,
    waitlistSaved,
    urlCopied,
    publicJoinCompleted,
    waitlistSlug,
    addField,
    removeField,
    saveWaitlist,
    loadOwnerWaitlist,
    loadWaitlistBySlug,
    loadWaitlistEntries,
    submitPublicJoin,
    resetPublicJoin,
    setUrlCopied,
    getShareableUrl
  };
};

export const waitlistStoreKey: InjectionKey<WaitlistStore> =
  Symbol('waitlistStore');

export const useWaitlistStore = (): WaitlistStore => {
  const store = inject(waitlistStoreKey);
  if (!store) {
    throw new Error('Waitlist store is not available');
  }
  return store;
};
