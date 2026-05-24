import AsyncStorage from '@react-native-async-storage/async-storage';

export enum PrefKey {
  Theme = 'theme',
  Token = 'token',
  User = 'user',
  params = 'params',
  SubmissionId = 'submissionId',
}

export enum BizKey {
  Authorization = 'authorization',
  Quiz = 'quiz',
  Other = 'other',
}

const makeKey = (key: string, biz: string) => `${biz}:${key}`;

export async function getStorageItem<T>(key: PrefKey, biz: BizKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(makeKey(key, biz));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setStorageItem<T>(key: PrefKey, biz: BizKey, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(makeKey(key, biz), JSON.stringify(data));
  } catch {}
}

export async function removeStorageItem(key: PrefKey, biz: BizKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(makeKey(key, biz));
  } catch {}
}
