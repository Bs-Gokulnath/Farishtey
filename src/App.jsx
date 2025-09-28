import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signup from './auth/signup';
import Signin from './auth/signin';
import BookTraining from './pages/book_training';
import AdminApprovalDashboard from './pages/approval_dashboard';
import RequestStatus from "./pages/MyTrainingRequests";
import { TrainingProvider } from './components/TrainingContext'; 
import AdminApprovalPage from './pages/add_ins_tra';
import SuperAdminApprovalDashboard from './pages/SuperAdminApprovalDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';
import FarishteyDash from './pages/farishtey_dash';
import AddNewTrainer from './pages/add_train';
import AddNewInstitute from './pages/add_inst';
import RegisterCertificate from './pages/regis_cert';


// function App(){
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Homepage />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/signin" element={<Signin />} />
//         <Route path="/unauthorized" element={<Unauthorized />} />
//         <Route path="/farishtey-dash" element={<FarishteyDash />} />
//         <Route path="/book-training" element={<BookTraining />} />
//         <Route path="/approval" element={<AdminApprovalDashboard />} />
//         <Route path="/admin-ins-tra" element={<AdminApprovalPage />} />
//         <Route path="/request-status" element={<RequestStatus />} />
//         <Route path="/super-admin-approval" element={<SuperAdminApprovalDashboard />} />
//         <Route path="/add-train" element={<AddNewTrainer />} />
//         <Route path="/add-inst" element={<AddNewInstitute />} />
//       </Routes>
    
//     </BrowserRouter>
//   )
// }
  



function App() {
  return (
    <TrainingProvider>
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<Homepage />} /> */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<FarishteyDash />} />
          {/* Redirect old farishtey-dash route to new home */}
          <Route path="/farishtey-dash" element={<FarishteyDash />} />
          <Route path="/book-training" element={<BookTraining />} />
          <Route path="/register-certificate" element={<RegisterCertificate />} />
          <Route 
            path="/approval" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_DEFAULT', 'admin', 'super_admin']}>
                <AdminApprovalDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-ins-tra" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_DEFAULT', 'admin', 'super_admin']}>
                <AdminApprovalPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/request-status" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_DEFAULT', 'user', 'trainer', 'admin', 'super_admin']}>
                <RequestStatus />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/super-admin-approval" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SuperAdminApprovalDashboard />
              </ProtectedRoute>
            } 
          />
          

          <Route 
            path="/add-train" 
            element={
              <ProtectedRoute allowedRoles={['admin','ROLE_DEFAULT']}>
                <AddNewTrainer />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/add-inst" 
            element={
              <ProtectedRoute allowedRoles={['admin','ROLE_DEFAULT']}>
                <AddNewInstitute />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TrainingProvider>
  );
}

export default App;
