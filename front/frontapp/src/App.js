import './App.css';
import HelloTest from './Components/hello_test';
import { BrowserRouter, Route,Routes } from 'react-router-dom';
import Login from './Pages/Login';
import Home from './Pages/Home';
import Registration from './Pages/Registration'
import Nav_Bar from "./Pages/Nav_Bar";
import  AnimatedBackground from "./Components/AnimatedBackground";

function App() {

  return (
    <BrowserRouter>
    <div className='App'>
      <div className="AnimatedBackground-container">
                <AnimatedBackground />
      </div>
      <Nav_Bar />
    </div>
    <div className='main-content'>
      <Routes>
        <Route path="/hello_test" element={<HelloTest />} />
        <Route path ="/login" element = {<Login />}></Route>
        <Route path = "/" element = {<Home/>}></Route>
        <Route path = "/Registration" element = {<Registration/>}></Route>
      </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;