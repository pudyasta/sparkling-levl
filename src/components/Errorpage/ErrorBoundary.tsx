import { Component } from '@lynx-js/react';

import { ErrorPage } from './Errorpage';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  retry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return <ErrorPage error={this.state.error} onRetry={this.retry} />;
    }
    return this.props.children;
  }
}
