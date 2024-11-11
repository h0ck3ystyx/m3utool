import React from 'react';
import M3UViewer from './components/M3UViewer';

// Import PrimeReact styles
import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

function App() {
  return (
    <div className="w-screen min-h-screen surface-ground overflow-hidden">
      <M3UViewer />
    </div>
  );
}

export default App;