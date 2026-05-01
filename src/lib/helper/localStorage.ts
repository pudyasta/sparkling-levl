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

export async function setPref<T>(key: PrefKey, value: T) {
  return NativeModules.NativeLocalStorageModule.setStorageItem(key, JSON.stringify(value));
}
