import './App.css';
import HelloTest from './Components/hello_test';
import { BrowserRouter, Route,Routes } from 'react-router-dom';
import Login from './Pages/Login';
import Home from './Pages/Home';
function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/hello_test" element={<HelloTest />} />
      <Route path ="/login" element = {<Login/>}></Route>
      <Route path = "/home" element = {<Home/>}></Route>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
