import React, { Component } from 'react';
import '../styles/userAccount.scss';
import UserLoginHelper from './UserLoginHelper';
import { Spinner } from './Spinner';
import { Login } from './Login';
import { NavMenu } from './NavMenu';
import { Footer } from './Footer';
import { UserAccountSettings } from './UserAccountSettings';
import UserFormHelper from './UserFormHelper';
import { UserAccountNotifications } from './UserAccountNotifications';
import { UserAccountNotActive } from './UserAccountNotActive';

export class UserAccount extends Component {
    static displayName = UserAccount.name;

    constructor(props) {
        super(props);

        this.state = {
            loggedIn: false,
            userEmail: null,
            loginToken: "",
            tokenExpired: false,
            isActive: false,

            changePasswordOpened: false,
            deleteAccountOpened: false,
            deleteAccountConfirmationOpened: false,
            deleteAccountResponse: null,

            loading: true
        };

        this.loginHelper = new UserLoginHelper();
        this.formHelper = new UserFormHelper();
    }

    componentDidMount() {
        this.TokenLogin();
    }

    TokenLogin = (token) => {
        this.loginHelper.TokenLogin(token).then(tokenLoginResponse => {

            this.setState((prevState) => ({
                ...prevState,
                loggedIn: tokenLoginResponse.loggedIn,
                userEmail: tokenLoginResponse.userEmail,
                loginToken: tokenLoginResponse.loginToken,
                isActive: tokenLoginResponse.isActive,
                loading: false
            }));
        });
    }

    HandleUserLoginExpired = (statusCode, goHome = false) => {

        if (statusCode != 440 && statusCode != 401)
            return;

        localStorage.removeItem("loginToken");
        this.setState((prevState) => ({
            ...prevState,
            loggedIn: false,
            loginToken: null,
            loginExpired: true
        }));

        if (goHome)
            window.location.href = '/';
    }

    render() {

        return (

            this.state.loading ?
                <Spinner />
                :
                this.state.loggedIn ?
                    <>
                        <NavMenu HandleUserLoginExpired={this.HandleUserLoginExpired} />
                        <div id="userAccount" className='container'>
                            {this.state.isActive ?
                                <>
                                    <UserAccountNotifications loginToken={this.state.loginToken} HandleUserLoginExpired={this.HandleUserLoginExpired} />
                                </>
                                :
                                <UserAccountNotActive userEmail={this.state.userEmail} loginToken={this.state.loginToken} HandleUserLoginExpired={this.HandleUserLoginExpired} />
                            }
                            <UserAccountSettings loginToken={this.state.loginToken} HandleUserLoginExpired={this.HandleUserLoginExpired} userEmail={this.state.userEmail} />
                        </div>
                        <Footer background={'lightGray'} />
                    </>
                    :
                    <Login HandleUserLogIn={this.TokenLogin} loginExpired={this.state.loginExpired} />
        );
    }
}
