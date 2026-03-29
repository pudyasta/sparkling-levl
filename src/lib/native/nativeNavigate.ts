export const navigate = (
  activity: string,
  params: Record<string, any> = {},
  isFinishCurrent = false,
) => {
  console.log('ok');
  NativeModules.NavigationModule.navigateTo(activity, params, isFinishCurrent);
};

export const navigateBack = () => {
  console.log('ok');
  NativeModules.NavigationModule.navigateBack();
};
