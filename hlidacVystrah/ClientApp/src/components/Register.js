import React, { Component } from 'react';
import { NavMenu } from './NavMenu';
import { Footer } from './Footer';
import '../styles/userForm.scss';
import '../styles/spinnerAbsolute.scss';
import axios from "axios";
import { Spinner } from './Spinner';
import UserFormHelper from './UserFormHelper';

export class Register extends Component {
    static displayName = Register.name;

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password1: "",
            password2: "",
            passwordVisible: false,
            passwordMismatch: false,
            passwordTooShort: false,
            emailError: false,
            response: null,
            loading: false
        }

        this.helper = new UserFormHelper();
    }

    HandleTogglePassword = () => {

        this.setState((prevState) => ({
            ...prevState,
            passwordVisible: !this.state.passwordVisible
        }))
    }

    ValidateInputs = () => {

        let passwordMismatch = this.state.password1 != this.state.password2;
        let passwordTooShort = this.state.password1.length < this.helper.minPasswordLength;
        let emailError = !this.helper.EmailValid(this.state.email);

        this.setState((prevState) => ({
            ...prevState,
            passwordMismatch: passwordMismatch,
            passwordTooShort: passwordTooShort,
            emailError: emailError
        }))

        return !(passwordMismatch || passwordTooShort || emailError);
    }

    Register = () => {

        let inputsValid = this.ValidateInputs();
        if (!inputsValid)
            return;

        this.setState((prevState) => ({
            ...prevState,
            loading: true,
            response: null
        }));

        axios
            .post("/api/user/register", {
                email: this.state.email,
                password: this.state.password1
            })
            .then((response) => {
                this.setState((prevState) => ({
                    ...prevState,
                    response: response.data.responseCode,
                    loading: false,
                    password1: '',
                    password2: ''
                }))
            }).catch(() => {
                this.setState((prevState) => ({ ...prevState, response: 500 }));
            }).finally(() => {

            });
    }

    HandleHidePasswordMismatch = () => {
        this.setState((prevState) => ({ ...prevState, passwordMismatch: false }));
    }

    HandleHidePasswordTooShort = () => {
        this.setState((prevState) => ({ ...prevState, passwordTooShort: false }));
    }

    HandleEmailError = () => {
        this.setState((prevState) => ({ ...prevState, emailError: false }));
    }

    RenderResponseText = () => {

        if (this.state.response != null)
            setTimeout(() => {
                this.setState((prevState) => ({ ...prevState, response: null }));
            }, this.helper.timeoutDuration);

        switch (this.state.response) {
            case 200:
                return this.helper.RenderInformationText("Registrace proběhla úspěšně!", false);
            case 409:
                return this.helper.RenderInformationText("Email je již zaregistrován!", true);
            case 500:
                return this.helper.RenderInformationText("Něco se nepovedlo. Zkuste to později.", true);
            default:
                return;
        }
    }

    render() {

        return (
            <>
                <NavMenu />
                <div id="register" className='d-flex justify-content-center align-items-center'>
                    <div className='d-flex flex-column justify-content-center p-4 p-lg-5 rounded position-relative'>
                        <h2 className='mb-3 mx-auto'>Registrace</h2>
                        <span className='mb-2 d-flex align-items-center mx-auto'>
                            <i className="fa-solid fa-envelope me-2"></i>
                            <input className='p-1' type='text' placeholder='E-mail' value={this.state.email} onChange={(e) => this.setState((prevState) => ({ ...prevState, email: e.target.value }))} />
                        </span>
                        <span className='mb-2 d-flex align-items-center position-relative mx-auto'>
                            <i className="fa-solid fa-lock me-2"></i>
                            <input className='p-1' type={`${this.state.passwordVisible ? 'text' : 'password'}`} placeholder='Heslo' value={this.state.password1} onChange={(e) => this.setState((prevState) => ({ ...prevState, password1: e.target.value }))} />
                            <i
                                className={`toggler fa-regular fa-eye${this.state.passwordVisible ? '-slash' : ''}`}
                                onClick={() => this.HandleTogglePassword()}
                            ></i>
                        </span>
                        <span className='mb-2 d-flex align-items-center position-relative mx-auto'>
                            <i className="fa-solid fa-lock me-2"></i>
                            <input className='p-1' type={`${this.state.passwordVisible ? 'text' : 'password'}`} placeholder='Heslo znovu' value={this.state.password2} onChange={(e) => this.setState((prevState) => ({ ...prevState, password2: e.target.value }))} />
                        </span>
                        {this.state.passwordMismatch && this.helper.RenderInformationText('Hesla se neshodují', true, this.HandleHidePasswordMismatch)}
                        {this.state.passwordTooShort && this.helper.RenderInformationText('Heslo musí obsahovat alespoň 6 znaků', true, this.HandleHidePasswordTooShort)}
                        {this.state.emailError && this.helper.RenderInformationText('Email nemá správný formát (email@priklad.xx)', true, this.HandleEmailError)}
                        {this.RenderResponseText()}
                        <button className='ms-auto border p-2 rounded my-2' onClick={() => this.Register()}>Registrovat</button>
                        <span className='mt-2 d-flex justify-content-center mx-auto'>
                            Již máte účet?
                            <a href='/login' className='ms-1' title='Registrace'>Přihlašte se</a>
                        </span>
                        {this.state.loading && <Spinner />}
                    </div>
                </div>
                <Footer />
            </>
        );
    }
}
