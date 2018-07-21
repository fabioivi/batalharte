import React from 'react';
// react-router-dom
import { BrowserRouter, Switch, Route } from 'react-router-dom';
// components
import AppBar from '../Common/AppBar/AppBar';
import Welcome from '../Welcome/Welcome';
import SignIn from '../Auth/SignIn/SignIn';
import SignUp from '../Auth/SignUp/SignUp';
import Dashboard from '../Dashboard/Dashboard';

export default props => {

    return (
        <BrowserRouter>
            <div>
                <AppBar />
                <Switch>
                    <Route exact path="/" component={Welcome} />
                    <Route exact path="/signin" component={SignIn} />
                    <Route exact path="/signup" component={SignUp} />
                    <Route exact path="/dashboard" component={Dashboard} />
                </Switch>
            </div>
        </BrowserRouter>
    );
}