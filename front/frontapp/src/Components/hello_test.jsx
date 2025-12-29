import { useEffect,useState } from "react";
import axios from "axios";

export default function HelloTest() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/hello/").then((response) => {
        setMessage(response.data.message);});}, []);
    
  return (
 <div className="container">
      <h2>Wel Page (Quote Form)</h2>
        <p>Message from Django backend: {message}</p>
    </div>
  );
}
  