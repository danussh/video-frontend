import React,{useEffect} from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import {  Route, Switch } from "react-router-dom";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div className="container">
      <Switch>
        <Route exact path="/" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>
  </div>

    
  );
}

export default App;
