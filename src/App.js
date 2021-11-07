import React from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { Route, Switch } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Time from "./components/Time";
import Protected from "./components/Protected";

function App() {
  return (
    <>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route path="/signup" component={Signup} />
        <Protected path="/dashboard" component={Dashboard} />
        <Protected path="/timelogs" component={Time} />
      </Switch>
    </>
  );
}

export default App;
