import { Component, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(): void {
    // The educational site deliberately avoids logging potentially sensitive runtime payloads.
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="recovery" id="main-content">
          <p className="eyebrow">Recoverable simulator error</p>
          <h1>FutureATC Lab needs a reset</h1>
          <p>
            The simulator encountered an unexpected display problem. No real system is affected.
          </p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload simulation
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
