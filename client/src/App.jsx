import { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
import ScrollToTop from "./utils/ScrollToTop"
import HomePage from './pages/HomePage'
import { ThemeToggleSwitch } from './components/UI/ThemeToggleSwitch'
import ProtectedRoute from './utils/ProtectedRoute'


function App() {

  return (
    <>
    <ThemeToggleSwitch/>
    <Router>
      <ScrollToTop>
        <Routes>
          <Route path='/' element={<HomePage/>}/>
          <Route element={<ProtectedRoute/>}>
            {/* ohters route */}
          </Route>
        </Routes>
      </ScrollToTop>
    </Router>
    <Toaster />
    </>
  )
}

export default App
