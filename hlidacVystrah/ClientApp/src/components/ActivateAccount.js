import React, { useState, useEffect } from 'react';
import { NavMenu } from './NavMenu';
import { Footer } from './Footer';
import '../styles/userForm.scss';
import '../styles/activateAccount.scss';
import { Spinner } from './Spinner';
import { useSearchParams } from 'react-router-dom';
import UserFormHelper from './UserFormHelper';
import axios from "axios";

function ActivateAccount() {
    // Access the token parameter from the URL
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState(null);
    const helper = new UserFormHelper();

    useEffect(() => {
        if (token == null || token == '') {
            setResponse(400);
            setLoading(false);
        } else {
            axios
                .post("/api/user/activateaccount", {
                    ActivationToken: token
                })
                .then((response) => {
                    setResponse(response.data.responseCode);
                    if (response.data.responseCode == 200) {
                        //COOKIE CHECK
                        localStorage.setItem("loginToken", response.data.loginToken);
                        setTimeout(() => {
                            window.location.href = '/account';
                        }, 1000);
                    }
                }).catch(err => {
                    setResponse(500);
                }).finally(() => {
                    setLoading(false);
                });
        }
    }, []);

    const RenderResponseText = () => {

        switch (response) {
            case 200:
                return helper.RenderInformationText("Účet byl úspěšně aktivován!", false);
            case 400:
                return helper.RenderInformationText("Odkaz není platný, nebo účet je již aktivován!", true);
            case 500:
                return helper.RenderInformationText("Něco se nepovedlo. Zkuste to později.", true);
            default:
                return;
        }
    }

    return (
        <>
            <NavMenu />
            <div id="activateAccount" className='d-flex justify-content-center align-items-center'>
                <div className='d-flex flex-column justify-content-center p-4 p-lg-5 rounded'>
                    <h2 className='mb-3 mx-auto'>Aktivování účtu {(response == 400 || response == 500) && 'se nezdařilo'}</h2>
                    {RenderResponseText()}
                    {loading ?
                        <Spinner />
                        :
                        <span className='d-flex justify-content-center mt-3'>
                            <a href='/login' className='' title='Přihlášení'>Přihlašte se</a>
                        </span>
                    }
                </div>
            </div>
            <Footer background={'lightGray'} />
        </>
    );
}

export default ActivateAccount;