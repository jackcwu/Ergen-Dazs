import React, { Component } from 'react';
import './App.css';
import firebase from 'firebase';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import App from './App';
import Analytics from './analytics';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import './components/LoginBox';

class Login extends Component {
  state = { isSignedIn: false, doneWithMain: false, screenshot: '' };
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
      <>
        {this.state.isSignedIn ? (
          <div>
            <div className='navbar'>
              <button
                className='signout-button'
                onClick={() => firebase.auth().signOut()}
              >
                Sign out!
              </button>
              <h1>Welcome {firebase.auth().currentUser.displayName}</h1>
            </div>
            <div>
              {!this.state.doneWithMain ? (
                <App
                  onDoneWithMain={(imgbase64) => {
                    console.log('in here with', imgbase64);
                    this.setState({
                      doneWithMain: true,
                      screenshot: imgbase64,
                    });
                  }}
                />
              ) : (
                <Analytics screenshot={this.state.screenshot} />
              )}
            </div>
          </div>
        ) : (
          <div className='Login'>
            <div className='login-container'>
              <h1>
                <i>Erg</i>
              </h1>
              <StyledFirebaseAuth
                uiConfig={this.uiConfig}
                firebaseAuth={firebase.auth()}
              />
            </div>
          </div>
        )}
      </>
    );
  }
}

export default Login;
