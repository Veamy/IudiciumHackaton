import AppRoutes from './AppRoutes';
import CustomNavbar from './widgets/CustomNavbar/CustomNavbar';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="app-wrapper">
      <CustomNavbar />
      <main className="app-main">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;