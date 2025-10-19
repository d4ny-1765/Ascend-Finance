import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
          <h1>An error occurred while loading the app</h1>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px', background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
              Error Details (click to expand)
            </summary>
            <h3>Error:</h3>
            <p style={{ color: 'red' }}>{this.state.error && this.state.error.toString()}</p>
            <h3>Stack Trace:</h3>
            <pre>{this.state.error && this.state.error.stack}</pre>
            <h3>Component Stack:</h3>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
