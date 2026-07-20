import AppRoutes from '@/routes/AppRoutes';
import ErrorBoundary from '@/shared/components/ui/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;

