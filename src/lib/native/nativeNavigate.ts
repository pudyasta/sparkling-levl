import { useRouterParams } from '@/context/RouterParamsProvider';
import * as router from 'sparkling-navigation';

export const navigate = (
  activity: string,
  params: Record<string, any> = {},
  isFinishCurrent = false
) => {
  NativeModules.NavigationModule.navigateTo(activity, params, isFinishCurrent);
};

export const navigateBack = () => {
  NativeModules.NavigationModule.navigateBack();
};
