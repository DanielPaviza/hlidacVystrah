import React, { Component } from 'react';
import { NavMenu } from './NavMenu';
import { Footer } from './Footer';
import NewPasswordForm from './NewPasswordForm';
export class NewPassword extends Component {
    static displayName = NewPassword.name;

    constructor(props) {
        super(props);
    }


    render() {

        return (
            <>
                <NavMenu />
                    <div id="newpassword" className='d-flex justify-content-center align-items-center'>
                        <NewPasswordForm />
                    </div>
                <Footer />
            </>
        );
    }
}
