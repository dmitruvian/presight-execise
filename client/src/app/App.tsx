import { BrowserRouter } from 'react-router-dom';
import { DirectoryPage } from '../pages/directory';

export default function App() {
  return (
    <BrowserRouter>
      <DirectoryPage />
    </BrowserRouter>
  );
}
