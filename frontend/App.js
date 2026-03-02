import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CVUpload from './pages/CVUpload';
import Search from './pages/Search';
import Messages from './pages/Messages';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/profile" component={Profile} />
        <Route path="/cv-upload" component={CVUpload} />
        <Route path="/search" component={Search} />
        <Route path="/messages" component={Messages} />
        <Route path="/" exact component={Login} />
      </Switch>
    </Router>
  );
};

export default App;