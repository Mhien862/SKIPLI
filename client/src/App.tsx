import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Instructor from "./pages/Instructor";
import Student from "./pages/Student";
import Chat from "./pages/Chat";

function RequireAuth({
  children,
  role,
}: {
  children: JSX.Element;
  role?: "instructor" | "student";
}) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role") as
    | "instructor"
    | "student"
    | null;
  if (!token) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/instructor"
          element={
            <RequireAuth role="instructor">
              <Instructor />
            </RequireAuth>
          }
        />
        <Route
          path="/student"
          element={
            <RequireAuth role="student">
              <Student />
            </RequireAuth>
          }
        />
        <Route
          path="/chat"
          element={
            <RequireAuth>
              <Chat />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
