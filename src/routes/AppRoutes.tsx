import { Route, Routes } from 'react-router-dom';

import EditorPage from '@/pages/EditorPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<EditorPage />} />
    </Routes>
  );
}

export default AppRoutes;
