import "./App.css";
import Login from './pages/login';
import Signup from './pages/signup'
import RegistrationForm from './components/registration';
import GenerateQR from './components/qrComponent'
import QRScanner from './components/security/scanQr';

function App() {
  return (
    <>
      <Login/>
      <Signup />
      <RegistrationForm/>
      <GenerateQR />
      <QRScanner />
    </>
  );
}

export default App;
