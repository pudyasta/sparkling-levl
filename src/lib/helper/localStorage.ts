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

export async function setPref<T>(key: PrefKey, value: T) {
  return NativeModules.NativeLocalStorageModule.setStorageItem(key, JSON.stringify(value));
}
