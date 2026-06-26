const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true 
}));

app.use(express.json());

app.use(session({
  secret: 'hackathon_super_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true, 
    maxAge: 1000 * 60 * 60 
  }
}));

// No camelCase here!
function readdb() {
  let rawdata = fs.readFileSync('./db.json', 'utf-8');
  let parseddata = JSON.parse(rawdata);
  
  let currenttime = Date.now();
  let validtasks = [];
  
  for (let i = 0; i < parseddata.tasks.length; i++) {
    if (parseddata.tasks[i].expiresAt > currenttime) {
      validtasks.push(parseddata.tasks[i]);
    }
  }
  
  parseddata.tasks = validtasks;
  writedb(parseddata);
  return parseddata;
}

// Lowercase function name and variables
function writedb(datatowrite) {
  fs.writeFileSync('./db.json', JSON.stringify(datatowrite, null, 2));
}

app.post('/login', function(req, res) {
  let userinputname = req.body.username;
  let userinputpass = req.body.password;
  
  let database = readdb();
  let founduser = null;

  for (let i = 0; i < database.users.length; i++) {
    if (database.users[i].username === userinputname && database.users[i].password === userinputpass) {
      founduser = database.users[i];
    }
  }
  
  if (founduser !== null) {
    req.session.user = { 
      id: founduser.id, 
      username: founduser.username, 
      clearance: founduser.clearance 
    };
    res.json({ message: "Login successful", user: req.session.user });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.get('/auth/me', function(req, res) {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});

app.post('/logout', function(req, res) {
  req.session.destroy();
  res.send("Logged out");
});

app.get('/tasks', function(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in!" });
  }
  let database = readdb();
  res.json(database.tasks);
});

app.post('/tasks', function(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in!" });
  }

  let database = readdb();
  
  let newtask = {
    id: Date.now(),
    title: req.body.title,
    requiredClearance: req.body.requiredClearance,
    expiresAt: Date.now() + (req.body.timeInMinutes * 60 * 1000)
  };
  
  database.tasks.push(newtask);
  writedb(database);
  
  res.json(newtask);
});

app.delete('/tasks/:id', function(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in!" });
  }

  let targetid = parseInt(req.params.id);
  let database = readdb();
  
  let tasktodelete = null;
  for (let i = 0; i < database.tasks.length; i++) {
    if (database.tasks[i].id === targetid) {
      tasktodelete = database.tasks[i];
    }
  }

  if (tasktodelete === null) {
    return res.status(404).json({ error: "Task not found" });
  }
  
  let userlevel = 1;
  if (req.session.user.clearance === "LEVEL_2") userlevel = 2;
  if (req.session.user.clearance === "LEVEL_3") userlevel = 3;

  let tasklevel = 1;
  if (tasktodelete.requiredClearance === "LEVEL_2") tasklevel = 2;
  if (tasktodelete.requiredClearance === "LEVEL_3") tasklevel = 3;
  
  if (userlevel < tasklevel) {
    return res.status(403).json({ error: "You are not a high enough level to delete this." });
  }
  
  let updatedarray = [];
  for (let i = 0; i < database.tasks.length; i++) {
    if (database.tasks[i].id !== targetid) {
      updatedarray.push(database.tasks[i]);
    }
  }
  database.tasks = updatedarray;
  writedb(database);

  res.json({ message: "Deleted!" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});