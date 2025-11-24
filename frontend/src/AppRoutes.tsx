import { Routes, Route } from 'react-router-dom';
import InfoPage from './pages/InfoPage/InfoPage';
import Home from './pages/Home/HomePage';
import { ROUTES } from './ROUTES';

const AppRoutes = () => {
  return (
      <Routes>
        <Route path={`/`} element={<Home />} />
        <Route path={`${ROUTES.INFO}/:idInfo`} element={<InfoPage />} />
        <Route path={`${ROUTES.INFO}/:typeInfo/:idInfo`} element={<InfoPage />} />
        <Route path={ROUTES.INFO} element={<InfoPage />} />
      </Routes>
  );
};

export default AppRoutes;