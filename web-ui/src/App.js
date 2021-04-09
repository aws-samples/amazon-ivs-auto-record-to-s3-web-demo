import React from "react";
import Home from "./pages/Home";
import Video from "./pages/Video";
import AdminHome from "./pages/AdminHome";
import AdminLive from "./pages/AdminLive";
import AdminVideo from "./pages/AdminVideo";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/video/:id">
          <Video />
        </Route>
        <Route path="/admin/live/:id">
          <AdminLive />
        </Route>
        <Route path="/admin/:id">
          <AdminVideo />
        </Route>
        <Route exact path="/admin">
          <AdminHome />
        </Route>
        <Route exact path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
