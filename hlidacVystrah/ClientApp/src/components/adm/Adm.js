import React, { Component } from 'react';
import { NavMenu } from '../NavMenu';
import { Footer } from '../Footer';
import { Spinner } from '../Spinner';
import UserLoginHelper from '../UserLoginHelper';
import '../../styles/adm/adm.scss';
import { Login } from '../Login';

export class Adm extends Component {
    static displayName = Adm.name;

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            loggedIn: false,
        }

        this.loginHelper = new UserLoginHelper();
    }

    componentDidMount() {
        this.TokenLogin();
    }

    TokenLogin = (token) => {
        this.loginHelper.AdminTokenLogin(token).then(adminLoggedIn => {

            this.setState((prevState) => ({
                ...prevState,
                loggedIn: adminLoggedIn,
                loading: false
            }));
        });
    }

    RenderAdmContent = () => {
        return (
            <section id='adm' className='container d-flex flex-column'>
                <h2 className='mt-4 mb-3'>Administrace</h2>
                <a href='/_adm/logs' className='mb-1'>Výpis logů</a>
                <a href='/_adm/users'>Výpis uživatelů</a>
            </section>
        );
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
                        {this.RenderAdmContent()}
                        < Footer />
                    </>
                    :
                    <Login HandleUserLogIn={this.TokenLogin} isAdministration={true} loginExpired={this.state.loginExpired} />

        );
    }
}
