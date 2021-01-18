import React, { Component } from 'react';
import './App.css';
import firebase from 'firebase';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import App from './App';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';

class Login extends Component {
  state = { isSignedIn: false };
  uiConfig = {
    signInFlow: 'popup',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccess: () => false,
    },
  };

  componentDidMount = () => {
    firebase.auth().onAuthStateChanged((user) => {
      this.setState({ isSignedIn: !!user });
      console.log('user', user);
    });
  };

  // currUser = {firebase.auth().currentUser.email ? firebase.auth().currentUser.email : null}
  
  render() {
    return (
      <div className='App'>
        {this.state.isSignedIn ? (
          <span>
            <button onClick={() => firebase.auth().signOut()}>Sign out!</button>
            <h1>Welcome {firebase.auth().currentUser.displayName}</h1>
            <App />
          </span>
        ) : (
          <StyledFirebaseAuth
            uiConfig={this.uiConfig}
            firebaseAuth={firebase.auth()}
          />
        )}
      </div>
