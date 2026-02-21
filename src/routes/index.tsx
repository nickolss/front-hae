import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import {
  ActivateAccount,
  Settings,
  Coordenadores,
  Dashboard,
  DashboardAdmin,
  DashboardCoordenador,
  DashboardDiretor,
  ForgotPassword,
  ManageUsers,
  Login,
  MyRequests,
  Professores,
  Register,
  RequestHae,
  ResetPassword,
  ContactUs,
  AllHaesByInstitution,
  ViewHae,
  DashboardDev,
  CreateInstitution,
  EditInstitution,
  ListInstitutions,
  AllHaes,
  RequestClosurePage,
  ClosureRequests,
  ApprovedHaes,
  ViewClosureRequest,
} from "../pages";
import { PrivateRouteLayout } from "./layout/PrivateRouteLayout";

function PrivateWrapper() {
  return (
    <PrivateRouteLayout>
      <Outlet />
    </PrivateRouteLayout>
  );
}

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rotas privadas agrupadas */}
        <Route element={<PrivateWrapper />}>
          <Route path="/" element={<></>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requestHae" element={<RequestHae />} />
          <Route path="/myrequests" element={<MyRequests />} />
          <Route
            path="/dashboard-coordenador"
            element={<DashboardCoordenador />}
          />
          <Route path="/dashboard-admin" element={<DashboardAdmin />} />
          <Route path="/gerenciar-usuarios" element={<ManageUsers />} />
          <Route path="/dashboard-diretor" element={<DashboardDiretor />} />
          <Route path="/professores" element={<Professores />} />
          <Route path="/coordenadores" element={<Coordenadores />} />
          <Route path="/haes" element={<AllHaesByInstitution />} />
          <Route path="/configuracoes" element={<Settings />} />
          <Route path="/hae/:id" element={<ViewHae />} />
          <Route path="/support" element={<ContactUs />} />
          <Route path="/dashboard-dev" element={<DashboardDev />} />
          <Route path="/create-institution" element={<CreateInstitution />} />
          <Route path="/institution/edit/:institutionCode" element={<EditInstitution />} />
          <Route path="/institutions" element={<ListInstitutions />} />
          <Route path="/allHaes" element={<AllHaes />} />
          <Route path="/request-closure/:id" element={<RequestClosurePage />} />
          <Route path="/closure-requests" element={<ClosureRequests />} />
          <Route path="/approved-haes" element={<ApprovedHaes />} />
          <Route path="/view-closure-request/:id" element={<ViewClosureRequest />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
