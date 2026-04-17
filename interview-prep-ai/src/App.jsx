import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import InterviewQuestions from './pages/InterviewQuestions'
import MockInterview from './pages/MockInterview'
import LearningPath from './pages/LearningPath'
import SkillGap from './pages/SkillGap'
import Analytics from './pages/Analytics'
import StudyConcepts from './pages/StudyConcepts'
import CodePractice from './pages/CodePractice'

import History from './pages/History'

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard"  element={<P><Dashboard /></P>} />
          <Route path="/resume"     element={<P><ResumeBuilder /></P>} />
          <Route path="/questions"  element={<P><InterviewQuestions /></P>} />
          <Route path="/mock"       element={<P><MockInterview /></P>} />
          <Route path="/study"      element={<P><StudyConcepts /></P>} />
          <Route path="/code"       element={<P><CodePractice /></P>} />
          <Route path="/learn"      element={<P><LearningPath /></P>} />
          <Route path="/skills"     element={<P><SkillGap /></P>} />
          <Route path="/analytics"  element={<P><Analytics /></P>} />
          <Route path="/history"    element={<P><History /></P>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </AuthProvider>
  )
}
