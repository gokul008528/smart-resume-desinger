import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, PublicRoute } from './routes/guards';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';
import LoadingPage from './components/LoadingPage';

const Landing = lazy(() => import('./pages/Landing'));
const Features = lazy(() => import('./pages/Features'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const About = lazy(() => import('./pages/About'));
const Templates = lazy(() => import('./pages/Templates'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Resumes = lazy(() => import('./pages/Resumes'));
const CreateResume = lazy(() => import('./pages/CreateResume'));
const ResumeEditor = lazy(() => import('./pages/ResumeEditor'));
const ResumePreview = lazy(() => import('./pages/ResumePreview'));
const AtsAnalysis = lazy(() => import('./pages/AtsAnalysis'));
const JobAnalysis = lazy(() => import('./pages/JobAnalysis'));
const Settings = lazy(() => import('./pages/Settings'));
const PublicResume = lazy(() => import('./pages/PublicResume'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingPage message="Loading page…" />}>
              <Routes>
                {/* Public marketing site */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Landing />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                </Route>

                {/* Auth (redirect to dashboard when already logged in) */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

                {/* Authenticated app */}
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/resumes" element={<Resumes />} />
                  <Route path="/templates" element={<Templates />} />
                  <Route path="/resumes/create" element={<CreateResume />} />
                  <Route path="/resumes/:id/edit" element={<ResumeEditor />} />
                  <Route path="/resumes/:id/preview" element={<ResumePreview />} />
                  <Route path="/ats-analysis" element={<AtsAnalysis />} />
                  <Route path="/job-analysis" element={<JobAnalysis />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Public resume sharing */}
                <Route path="/resume/:username/:resumeSlug" element={<PublicResume />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
