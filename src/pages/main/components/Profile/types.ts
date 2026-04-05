export interface UserProfileData {
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  streak: number;
}

export interface StatItem {
  label: string;
  value: string | number;
  iconUrl: string; // Using URL for SmartImage
}

export interface Achievement {
  title: string;
  iconUrl: string;
  color: string;
  isActive: boolean;
}

export interface Activity {
  title: string;
  timestamp: string;
  xpGain: number;
  iconUrl: string;
}
