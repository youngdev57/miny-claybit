import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] 처리되지 않은 오류:', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-white p-6 text-center">
        <h1 className="text-lg font-semibold text-ink">예기치 않은 오류가 발생했습니다</h1>
        <p className="max-w-md text-sm text-slate-500">
          편집기에서 문제가 발생했습니다. 최근 작업 내용은 자동 저장되어 있으니, 새로고침 후에도 이어서 작업할 수 있습니다.
        </p>
        <p className="max-w-md truncate text-xs text-slate-400">{error.message}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm text-ink hover:border-signal hover:text-signal"
          >
            다시 시도
          </button>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-md bg-signal px-4 py-2 text-sm text-white hover:opacity-90"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
