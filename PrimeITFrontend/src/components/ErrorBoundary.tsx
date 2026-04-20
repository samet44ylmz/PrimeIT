import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
             <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">BİR ŞEYLER TERS GİTTİ</h1>
          <p className="text-white/50 max-w-md mb-8">
            Beklenmedik bir hata oluştu. Sayfayı yenilemeyi deneyebilir veya ana sayfaya dönebilirsiniz.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="m-btn-primary"
          >
            ANA SAYFAYA DÖN
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
