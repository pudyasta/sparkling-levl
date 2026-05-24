import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children, onRefresh }) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      scrollEventThrottle={16}
    >
      {children}
    </ScrollView>
  );
};
