import React, { Component } from 'react';
import UserFormHelper from './UserFormHelper';

export class CurrentPasswordForm extends Component {
    static displayName = CurrentPasswordForm.name;

    constructor(props) {
        super(props);

        this.state = {
            passwordVisible: false,
            password: this.props.currentPassword,
            passwordTooShort: false
        }

         this.helper = new UserFormHelper();
    }

    HandleContinue = () => {
        if (this.state.password.length < this.helper.minPasswordLength) {
            this.setState((prevState) => ({
                ...prevState,
                passwordTooShort: true
            }));
            return;
        }

        this.props.SetCurrentPassword(this.state.password);
    }

    HandleTogglePassword = () => {
        this.setState((prevState) => ({
            ...prevState,
            passwordVisible: !this.state.passwordVisible
        }));
    }

    HandleHidePasswordTooShort = () => {
        this.setState((prevState) => ({
            ...prevState,
            passwordTooShort: false
        }));
    }

    render() {

        return (
            <div className='currentPassword accountSettingsContent d-flex justify-content-center'>
                <div className='d-flex flex-column p-4 m-3 align-items-center'>
                    <h3>Současné heslo</h3>
                    <span className='mb-2 d-flex align-items-center position-relative mx-auto'>
                        <i className="fa-solid fa-lock me-2"></i>
                        <input className='p-1' type={`${this.state.passwordVisible ? 'text' : 'password'}`} placeholder='Heslo' value={this.state.password} onChange={(e) => this.setState((prevState) => ({...prevState, password: e.target.value}))} />
                        <i
                            className={`toggler fa-regular fa-eye${this.state.passwordVisible ? '-slash' : ''} position-absolute`}
                            onClick={() => this.HandleTogglePassword()}
                        ></i>
                    </span>
                    {this.props.passwordChangeSuccess && this.helper.RenderInformationText("Heslo úspěšně změněno!", false, this.props.HandleClosePasswordChangeSuccess)}
                    {this.props.invalidCurrentPassword && this.helper.RenderInformationText("Nesprávné heslo!", true, this.props.HandleCloseInvalidCurrentPassword)}
                    {this.state.passwordTooShort && this.helper.RenderInformationText("Heslo musí obsahovat alespoň 6 znaků!", true, this.HandleHidePasswordTooShort)}
                    <button className='border rounded p-2 align-self-end mt-2' onClick={() => this.HandleContinue() }>Pokračovat</button>
                </div>
            </div>
        );
    }
}
