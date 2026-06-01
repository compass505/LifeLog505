import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './lib/auth.jsx';
import AppRouter from './routes/AppRouter.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
