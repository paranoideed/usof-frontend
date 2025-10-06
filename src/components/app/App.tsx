import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../../pages/login/LoginPage.tsx";
import RegisterPage from "../../pages/register/RegisterPage.tsx";

export default function App() {
    return (
        <BrowserRouter>
            {/* Простая шапка, чтобы можно было кликать между страницами */}
            {/*<nav style={{ padding: 12, borderBottom: "1px solid #eee" }}>*/}
            {/*    <Link to="/auth" style={{ marginRight: 12 }}>Вход</Link>*/}
            {/*    <Link to="/register">Регистрация</Link>*/}
            {/*</nav>*/}

            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* на будущее: приватные роуты для кабинета */}
            </Routes>
        </BrowserRouter>
    );
}
