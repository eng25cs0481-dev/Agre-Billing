import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Agre Billing:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c3c78',
          color: '#ffffff',
          fontFamily: 'Segoe UI, system-ui, sans-serif',
          padding: 24,
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>Agre Billing</h2>
          <p style={{ fontSize: 14, color: '#e0e7ff', maxWidth: 450, marginBottom: 20 }}>
            An unexpected error occurred while loading the application view.
          </p>
          <pre style={{
            background: 'rgba(0,0,0,0.3)',
            padding: 12,
            borderRadius: 4,
            fontSize: 11,
            color: '#fca5a5',
            maxWidth: 550,
            overflowX: 'auto',
            marginBottom: 20,
            textAlign: 'left'
          }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 20px',
              backgroundColor: '#e5a00d',
              color: '#000',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
