import React, { Component } from 'react';
import { NavMenu } from './NavMenu';
import { Footer } from './Footer';
import '../styles/userForm.scss';
import '../styles/spinnerAbsolute.scss';
import axios from "axios";
import { Spinner } from './Spinner';
import { InfoBox } from './InfoBox';
import UserFormHelper from './UserFormHelper';

export class Login extends Component {
    static displayName = Login.name;

    constructor(props) {
        super(props);

        this.state = {
            passwordVisible: false,
            email: "",
            password: "",
            loading: false,
            loggedIn: false,
            loggedUserEmail: null,
            response: null,
            emailInvalidFormat: false,
            passwordEmpty: false
        }

        this.formHelper = new UserFormHelper();
    }

    componentDidMount() {
    }

    HandleTogglePassword = () => {
        this.setState({passwordVisible: !this.state.passwordVisible})
    }

    Login = () => {

        let emailInvalidFormat = !this.formHelper.EmailValid(this.state.email);
        let passwordEmpty = this.state.password == "";

        this.setState((prevState) => ({
            ...prevState,
            emailInvalidFormat: emailInvalidFormat,
            passwordEmpty: passwordEmpty
        }));

        if (emailInvalidFormat || passwordEmpty)
            return;

        this.setState((prevState) => ({ loading: true }));
            
        axios
            .post("/api/user/login", {
                Email: this.state.email,
                Password: this.state.password
            })
            .then((response) => {

                let data = response.data;
                this.setState((prevState) => ({
                    ...prevState,
                    loggedIn: data.responseCode == 200,
                    loggedUserEmail: data.email,
                    response: data.responseCode
                }));

                if (data.responseCode == 200) {
                    //COOKIE CHECK
                    localStorage.setItem("loginToken", data.loginToken)
                    this.props.HandleUserLogIn(data.loginToken);
                }
                    
            }).catch(() => {
                this.setState((prevState) => ({ ...prevState, response: 500 }));
            }).finally(() => {
                this.setState((prevState) => ({ ...prevState, loading: false, password: "" }));
            });
    }

    HandleHideEmailInvalidFormat = () => {
        this.setState((prevState) => ({ ...prevState, emailInvalidFormat: false }));
    }

    HandleHidePasswordEmpty = () => {
        this.setState((prevState) => ({ ...prevState, passwordEmpty: false }));
    }

    RenderResponseText = () => {

        if (this.state.response != null)
            setTimeout(() => {
                this.setState((prevState) => ({ ...prevState, response: null }));
            }, this.formHelper.timeoutDuration);

        switch (this.state.response) {
            case 200:
                return this.props.isAdministration ? "" : this.formHelper.RenderInformationText("Přihlášení proběhlo úspěšně!", false);
            case 401:
                return this.formHelper.RenderInformationText("Nesprávné přihlašovací údaje!", true);
            case 403:
                return <span className='d-flex align-items-center'>
                    {this.formHelper.RenderInformationText("Nejdříve si účet aktivujte!", true)}
                    <InfoBox text={'Na zadaný email byl zaslán aktivační odkaz.'} />
                </span>
            case 500:
                return this.formHelper.RenderInformationText("Něco se nepovedlo. Zkuste to později.", true);
            default:
                return;
        }
    }

    InputOnPressEnter = (event) => {
        if (event.key === 'Enter')
            this.Login();
    }

    render() {

        return (
            <>
                <NavMenu />
                <div id="login" className='d-flex justify-content-center align-items-center container'>
                    <div className='d-flex flex-column justify-content-center p-4 p-lg-5 rounded position-relative'>
                        {this.props.loginExpired &&
                            <span className='position-absolute loginExpired'>
                                {this.formHelper.RenderInformationText("Přihlášení vypršelo!", true)}
                            </span>
                        }
                        <h2 className='mb-3 mx-auto'>Přihlášení {this.props.isAdministration && " do administrace"}</h2>
                        <span className='mb-2 d-flex align-items-center mx-auto'>
                            <i className="fa-solid fa-envelope me-2"></i>
                            <input
                                className='p-1'
                                type='text'
                                placeholder='E-mail'
                                value={this.state.email}
                                onKeyDown={(e) => this.InputOnPressEnter(e)}
                                onChange={(e) => this.setState((prevState) => ({ ...prevState, email: e.target.value }))}
                            />
                        </span>
                        <span className='mb-2 d-flex align-items-center mx-auto position-relative'>
                            <i className="fa-solid fa-lock me-2"></i>
                            <input
                                className='p-1'
                                type={`${this.state.passwordVisible ? 'text' : 'password'}`}
                                placeholder='Heslo' value={this.state.password}
                                onKeyDown={(e) => this.InputOnPressEnter(e)}
                                onChange={(e) => this.setState((prevState) => ({ ...prevState, password: e.target.value }))}
                            />
                            <i
                                className={`toggler fa-regular fa-eye${this.state.passwordVisible ? '-slash' : ''}`}
                                onClick={() => this.HandleTogglePassword()}
                            ></i>
                        </span>
                        {this.RenderResponseText()}
                        {this.state.emailInvalidFormat && this.formHelper.RenderInformationText('Email nemá správný formát (email@priklad.xx)', true, this.HandleHideEmailInvalidFormat)}
                        {this.state.passwordEmpty && this.formHelper.RenderInformationText("Vyplňte heslo!", true, this.HandleHidePasswordEmpty)}
                        {!this.props.isAdministration &&
                            <a href='/resetpassword' className='d-flex mt-1 fit-content' title='Žádost o změnu hesla'>Zapomněli jste heslo?</a>
                        }
                        <button className='ms-auto border p-2 rounded my-2' onClick={() => this.Login()}>Přihlásit</button>
                        {this.props.isAdministration != true &&
                            <div className='mt-2 d-flex justify-content-center mx-auto'>
                                Nemáte účet?
                                <a href='/register' className='ms-1' title='Registrace'>Zaregistrujte se</a>
                            </div>
                        }
                        {this.state.loading && <Spinner />}
                    </div>
                </div>
                <Footer />
            </>
        );
    }
}
