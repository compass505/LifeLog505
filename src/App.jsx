import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './lib/auth.jsx';
import AppRouter from './routes/AppRouter.jsx';

const basename = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
