import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PetProvider } from './contexts/PetContext';
import AuthScreen from './pages/AuthScreen';
import ProfileSetupScreen from './pages/ProfileSetupScreen';
import DashboardLayout from './components/DashboardLayout';
import DashboardScreen from './pages/DashboardScreen';
import HealthcareScreen from './pages/HealthcareScreen';
import MedicareScreen from './pages/MedicareScreen';
import ConsultationScreen from './pages/ConsultationScreen';
import PetCareGuideScreen from './pages/PetCareGuideScreen';
import MedicalRecordsScreen from './pages/MedicalRecordsScreen';
import RemindersScreen from './pages/RemindersScreen';
import ProfileScreen from './pages/ProfileScreen';
import ProtectedRoute from './components/ProtectedRoute';
import AIAssistant from './components/AIAssistant';
import ResetPasswordScreen from './pages/ResetPasswordScreen';

function App() {
  return (
    <Router>
      <AuthProvider>
        <PetProvider>
          <Routes>
            <Route 
              path="/auth" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <AuthScreen />
                </ProtectedRoute>
              } 
            />
            <Route path="/reset-password" element={<ResetPasswordScreen />} />
            <Route 
              path="/profile-setup" 
              element={
                <ProtectedRoute>
                  <ProfileSetupScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardScreen />} />
              <Route path="healthcare" element={<HealthcareScreen />} />
              <Route path="medicare" element={<MedicareScreen />} />
              <Route path="medicare/consultation" element={<ConsultationScreen />} />
              <Route path="medicare/pet-care-guide" element={<PetCareGuideScreen />} />
              <Route path="medicare/records" element={<MedicalRecordsScreen />} />
              <Route path="medicare/reminders" element={<RemindersScreen />} />
              <Route path="profile" element={<ProfileScreen />} />
            </Route>
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </PetProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;