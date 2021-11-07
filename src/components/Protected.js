import React, { useEffect } from "react";
import { Redirect, Route } from "react-router";

const Protected = (props) => {
  if (!sessionStorage.getItem("accesToken")) {
    return <Redirect to="/" />;
  }

  return <Route {...props} />;
};

export default Protected;
