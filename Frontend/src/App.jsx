import { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/auth/me', { withCredentials: true })
      .then(function(response) {
        setUser(response.data.user);
        setLoading(false);
      })
      .catch(function(error) {
        setUser(null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h1 className="text-white text-center mt-20 text-2xl">Loading app...</h1>;
  }

  if (user === null) {
    return <Login setUser={setUser} />;
  } else {
    return <Dashboard user={user} setUser={setUser} />;
  }
}

export default App;