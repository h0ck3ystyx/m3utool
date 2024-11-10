import M3UViewer from './components/M3UViewer'

// Import PrimeReact styles
import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

/* Add custom styles */
import './App.css';


function App() {
  return (
    // Remove any width constraints and use full viewport
    <div className="min-h-screen w-screen surface-ground">
      <M3UViewer />
    </div>
  )
}

export default App