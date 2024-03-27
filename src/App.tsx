import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";
import { ApiContextProvider } from "./context/ApiContext";
import MyProfile from "./pages/MyProfile";
import DashboardLotes from "./pages/DashboardLotes";
import { Dashboard } from "./pages/Dashboard";
import RegisterForm from "./pages/RegisterForm";
import BatchManage from "./pages/BatchManage";
import LoteForm from "./pages/AddLote";
import "./styles/MainMenuStyles";
import "./App.css";
import NewCrop from "./pages/NewCrop";

function App() {
  const { isAuthenticated, isLoading } = useAuth0();
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {isAuthenticated ? (
          <>
            <Route
              path="/"
              element={
                <ApiContextProvider>
                  <AppContextProvider>
                    <Dashboard />
                  </AppContextProvider>
                </ApiContextProvider>
              }
            ></Route>
            <Route
              path="/my-profile"
              element={
                <ApiContextProvider>
                  <AppContextProvider>
                    <MyProfile />
                  </AppContextProvider>
                </ApiContextProvider>
              }
            ></Route>
            <Route
              path="/register-form"
              element={
                <ApiContextProvider>
                  <AppContextProvider>
                    <RegisterForm />{" "}
                  </AppContextProvider>
                </ApiContextProvider>
              }
            />
            <Route path="/lote-menu" element={<DashboardLotes />} />
            <Route path="/add-lote" element={<LoteForm />} />
            <Route path="/new-crop" element={<NewCrop />} />
            <Route path="/batch-manage" element={<BatchManage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<LoginPage />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

const LoginPage = () => {
  const { loginWithRedirect } = useAuth0();
  loginWithRedirect();
  return <div>Login</div>;
};

export default App;
