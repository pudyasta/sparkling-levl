export enum PrefKey {
  Theme = 'theme',
  Token = 'token',
  User = 'user',
  params = 'params',
}

export enum BizKey {
  Authorization = 'authorization',
  Other = 'other',
}

export function getPref<T>(key: PrefKey): Promise<T | null> {
  return new Promise((resolve) => {
    NativeModules.NativeLocalStorageModule.getStorageItem(key, (value: string) => {
      resolve(value ? (JSON.parse(value) as T) : null);
    });
  });
}

export async function setPref<T>(key: PrefKey, value: T) {
  return NativeModules.NativeLocalStorageModule.setStorageItem(key, JSON.stringify(value));
}

export async function removePref() {
  return NativeModules.NativeLocalStorageModule.clearStorage();
}
