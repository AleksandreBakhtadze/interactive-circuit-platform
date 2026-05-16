import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/HomePage/HomePage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import LoginPage from './pages/LoginPage/LoginPage';
import ChallengesPage from './pages/ChallengesPage/ChallengesPage';
import ChapterChallengesPage from './pages/ChapterChallengesPage/ChapterChallengesPage';
import ChallengeDetailPage from './pages/ChallengeDetailPage/ChallengeDetailPage';

function App() {
    return (
        <AuthProvider>
            <LangProvider>
                <BrowserRouter>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/challenges" element={<ChallengesPage />} />
                        <Route path="/challenges/:chapterCode/:problemSlug" element={<ChallengeDetailPage />} />
                        <Route path="/challenges/:chapterCode" element={<ChapterChallengesPage />} />
                    </Routes>
                </BrowserRouter>
            </LangProvider>
        </AuthProvider>
    );
}

export default App;