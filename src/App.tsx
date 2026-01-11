import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import RoleSelection from './components/RoleSelection';
import DetectiveLogin from './components/DetectiveLogin';
import ChiefLogin from './components/ChiefLogin';
import DetectiveLogout from './components/DetectiveLogout';
import ChiefLogout from './components/ChiefLogout';
import WaitingRoom from './components/WaitingRoom';
import DetectiveDashboard from './components/DetectiveDashboard';
import ChiefDashboard from './components/ChiefDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/detective-login" element={<DetectiveLogin />} />
        <Route path="/chief-login" element={<ChiefLogin />} />
        <Route path="/detective/logout" element={<DetectiveLogout />} />
        <Route path="/chief/logout" element={<ChiefLogout />} />
        <Route 
          path="/waiting-room" 
          element={
            <ProtectedRoute redirectTo="/detective-login" requiredRole="detective">
              <WaitingRoom />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/detective-dashboard" 
          element={
            <ProtectedRoute redirectTo="/detective-login" requiredRole="detective">
              <DetectiveDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chief-dashboard" 
          element={
            <ProtectedRoute redirectTo="/chief-login" requiredRole="chief">
              <ChiefDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
