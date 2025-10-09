import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@pages/login/LoginPage.tsx";
import RegisterPage from "@pages/register/RegisterPage.tsx";
import MyProfilePage from "@pages/profiles/MyProfilePage.tsx";
import UserProfilePage from "@pages/profiles/UserProfile.tsx";
import SearchProfilesPage from "@pages/profiles/SearchProfilesPage.tsx";
import CategoryFormPage from "@pages/categories/CategoryFormPage.tsx";
import CategoriesPage from "@pages/categories/CategoriesPage.tsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/profiles" element={<SearchProfilesPage />} />
                <Route path="/profiles/me" element={<MyProfilePage />} />
                <Route path="/profiles/id/:user_id" element={<UserProfilePage />} />
                <Route path="/profiles/u/:username" element={<UserProfilePage />} />

                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/categories/create" element={<CategoryFormPage />} />
                <Route path="/categories/:id/edit" element={<CategoryFormPage />} />
            </Routes>
        </BrowserRouter>
    );
}