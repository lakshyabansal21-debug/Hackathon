import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard(props) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [clearance, setClearance] = useState('LEVEL_1');
  const [time, setTime] = useState(10); 
  const [, setTick] = useState(0);

  useEffect(() => {
    getTasks();
  }, []);

  useEffect(() => {
    let timerId = setInterval(() => {
      setTick(t => t + 1); 
    }, 1000);
    return () => clearInterval(timerId); 
  }, []);

  const getTasks = async () => {
    try {
      let res = await axios.get('http://localhost:5000/tasks', { withCredentials: true });
      setTasks(res.data);
    } catch (err) {
    }
  };

  const logoutButton = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
      props.setUser(null);
    } catch (err) {
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      let res = await axios.post('http://localhost:5000/tasks', {
        title: title,
        requiredClearance: clearance,
        timeInMinutes: time
      }, { withCredentials: true });
      
      let newArray = [...tasks];
      newArray.push(res.data);
      setTasks(newArray);
      setTitle(''); 
    } catch (err) {
      alert("Error creating task");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`, { withCredentials: true });
      getTasks();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert("Cannot delete this task.");
      }
    }
  };

  const calculateTime = (expiresAt) => {
    let timeLeft = expiresAt - Date.now();
    if (timeLeft <= 0) {
      return "EXPIRED";
    }
    
    let minutes = Math.floor(timeLeft / 60000);
    let seconds = Math.floor((timeLeft % 60000) / 1000);
    
    if (seconds < 10) {
      return minutes + ":0" + seconds;
    } else {
      return minutes + ":" + seconds;
    }
  };

  return (
    <div className="p-10">
      <div className="bg-gray-800 p-5 text-white flex justify-between items-center mb-10 rounded">
        <h2>Dashboard - Hello {props.user.username} ({props.user.clearance})</h2>
        <button onClick={logoutButton} className="bg-red-500 p-2 rounded">Logout</button>
      </div>

      <div className="flex gap-10">
        <div className="bg-gray-800 p-5 rounded w-1/3 text-white">
          <h3 className="text-xl mb-4 text-blue-400">Make a Task</h3>
          <form onSubmit={createTask}>
            <p>Title</p>
            <input required className="text-white p-1 w-full mb-3" value={title} onChange={(e) => setTitle(e.target.value)} />
            
            <p>Clearance</p>
            <select className="text-whitebg-gray-800 p-1 w-full mb-3" value={clearance} onChange={(e) => setClearance(e.target.value)}>
              <option value="LEVEL_1">Level 1</option>
              <option value="LEVEL_2">Level 2</option>
              <option value="LEVEL_3">Level 3</option>
            </select>
            
            <p>Time (minutes)</p>
            <input required type="number" className="text-white p-1 w-full mb-5" value={10}/>
            
            <button type="submit" className="bg-green-500 p-2 w-full rounded">Create</button>
          </form>
        </div>

        <div className="bg-gray-800 p-5 rounded w-2/3 text-white">
          <h3 className="text-xl mb-4 text-blue-400">Tasks</h3>
          
          {tasks.map(function(task) {
            return (
              <div key={task.id} className="bg-gray-700 p-3 mb-3 rounded flex justify-between items-center border border-gray-600">
                <div>
                  <h4 className="text-lg font-bold">{task.title}</h4>
                  <p className="text-sm text-gray-400">Requires: {task.requiredClearance}</p>
                </div>
                
                <div className="flex gap-5 items-center">
                  <p className="text-2xl text-yellow-400">{calculateTime(task.expiresAt)}</p>
                  <button onClick={() => deleteTask(task.id)} className="bg-red-500 p-2 rounded">Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
