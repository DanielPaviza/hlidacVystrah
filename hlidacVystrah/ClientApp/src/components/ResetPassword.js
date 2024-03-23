import React, { Component } from 'react';
import { NavMenu } from './NavMenu';
import { Footer } from './Footer';
import '../styles/userForm.scss';
import '../styles/resetPassword.scss';
import { Spinner } from './Spinner';
import axios from "axios";
import UserFormHelper from './UserFormHelper';

export class ResetPassword extends Component {
    static displayName = ResetPassword.name;

    constructor(props) {
        super(props);

        this.state = {
            response: null,
            loading: false,
            email: "",
            emailError: false
        }

        this.helper = new UserFormHelper();
    }

    ValidateInput = () => {

        let emailError = !this.helper.emailRegex.test(this.state.email);

        this.setState((prevState) => ({
            ...prevState,
            emailError: emailError
        }))

        return !emailError;
    }

    ResetPassword = () => {

        this.setState((prevState) => ({
            ...prevState,
            response: null,
        }));

        let inputsValid = this.ValidateInput();
        if (!inputsValid)
            return;

        this.setState((prevState) => ({
            ...prevState,
            loading: true,
            email: "",
        }));

        axios
            .post("/api/user/resetpassword", {
                email: this.state.email
            })
            .then((response) => {
                this.setState((prevState) => ({
                    ...prevState,
                    response: response.data.responseCode,
                    loading: false,
                }))
            }).catch(() => {
                this.setState((prevState) => ({ ...prevState, response: 500 }));
            }).finally(() => {

            });
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
                return this.helper.RenderInformationText("Email byl úspěšně odeslán!", false);
            case 400:
                return this.helper.RenderInformationText("Zadaný email neexistuje!", true);
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
                <div id="resetpassword" className='d-flex justify-content-center align-items-center container'>
                    <div className='d-flex flex-column justify-content-center p-4 p-lg-5 rounded position-relative'>
                        <h2 className='mb-2 mx-auto'>Zapomněli jste heslo?</h2>
                        <p className='mb-4 w-100 d-inline-block'>Na zadaný email Vám přijde zpráva s odkazem na nastavení nového hesla.</p>
                        <div className='resetPasswordInputButton mx-auto d-flex flex-column'>
                            <span className='mb-2 d-flex align-items-center mx-auto'>
                                <i className="fa-solid fa-envelope me-2"></i>
                                <input className='p-1' type='text' placeholder='E-mail' value={this.state.email} onChange={(e) => this.setState((prevState) => ({ ...prevState, email: e.target.value }))} />
                            </span>
                            {this.RenderResponseText()}
                            {this.state.emailError && this.helper.RenderInformationText('Email nemá správný formát (email@priklad.xx)', true, this.HandleEmailError)}
                            <button className='ms-auto border p-2 rounded my-2' onClick={() => this.ResetPassword()}>Odeslat</button>
                            <span className='d-flex justify-content-center'>
                                <a href='/login' className='fit-content' title='Přihlášení'>Přihlašte se zde</a>
                            </span>
                        </div>
                        {this.state.loading && <Spinner />}
                    </div>
                </div>
                <Footer />
            </>
        );
    }
}
