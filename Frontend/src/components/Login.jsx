import { useState } from 'react';
import axios from 'axios';

function Login(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    try {
      // Beginner: Hardcoded URL and config inside the function
      let response = await axios.post('http://localhost:5000/login', { 
        username: username, 
        password: password 
      }, { 
        withCredentials: true 
      });
      
      console.log(response.data); // Leftover debug log
      props.setUser(response.data.user); // Update parent state
      
    } catch (err) {
      // Beginner: Using alert boxes instead of pretty UI errors
      alert("Wrong username or password! Try again.");
      console.log(err);
    }
  };

  return (
    <div className="flex justify-center mt-20">
      <div className="bg-gray-800 p-8 rounded-lg w-96 border border-gray-600">
        <h1 className="text-2xl text-white font-bold mb-5 text-center">Login to System</h1>
        
        <form onSubmit={handleSubmit}>
          <p className="text-gray-300 mb-1">Username</p>
          <input
            type="text"
            className="w-full mb-4 p-2 bg-gray-700 text-white rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <p className="text-gray-300 mb-1">Password</p>
          <input
            type="password"
            className="w-full mb-6 p-2 bg-gray-700 text-white rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="w-full hover:cursor-pointer bg-blue-600 text-white p-2 rounded hover:bg-blue-500">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;