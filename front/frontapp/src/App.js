import './App.css';
import HelloTest from './Components/hello_test';
import { BrowserRouter, Route,Routes } from 'react-router-dom';

function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/hello_test" element={<HelloTest />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
