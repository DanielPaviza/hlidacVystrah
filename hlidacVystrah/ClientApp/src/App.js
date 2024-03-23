import React, { Component, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HomeController } from "./components/HomeController";
import { Register } from "./components/Register";
import { ResetPassword } from "./components/ResetPassword";
import { NotFound } from "./components/NotFound";
import { UserAccount } from "./components/UserAccount";
import { NewPassword } from "./components/NewPassword";
import { Adm } from "./components/adm/Adm";
import { Logs } from "./components/adm/Logs";
import { Users } from "./components/adm/Users";
import { History } from "./components/History";
import ActivateAccount from "./components/ActivateAccount";
import LocalityController from './components/LocalityController';
import { BrowserRouter as Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './styles/shared.scss';
import { Helmet } from 'react-helmet';
import { HistoryController } from './components/HistoryController';

const LoginRedirect = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        navigate('/account', { replace: true });
    }, [navigate]);

    return null;
};

const App = () => {

    const [baseMetaDescription] = useState('Přehled výstrah ČHMÚ před meteorologickými jevy pro Českou republiku a jednotlivé obce s rozšířenou působností.');
    const [baseShortTitle] = useState('Hlídač výstrah');

    const [localityMetaDescription, setLocalityMetaDescription] = useState('');
    const [localityMetaTitle, setLocalityMetaTitle] = useState('');

    const HandleSetLocalityMetaDescription = (description) => {
        setLocalityMetaDescription(description);
    };

    const HandleSetLocalityMetaTitle = (title) => {
        setLocalityMetaTitle(title);
    };

    const AppRoutes = [
        {
            index: true,
            element: <>
                <Helmet>
                    <title>Hlídač meteorologických výstrah</title>
                    <meta name="description" content={baseMetaDescription + " Možnost nastavení odesílání emailových notifikací při výskytu jevu Vašeho výběru."} />
                </Helmet>
                <HomeController />
            </>
        },
        {
            path: '/obec/:cisorp',
            element: <>
                <Helmet>
                    <title>{baseShortTitle + " - " + localityMetaTitle}</title>
                    <meta name="description" content={baseMetaDescription + " " + localityMetaDescription} />
                </Helmet>
                <LocalityController SetLocalityMetaDescription={HandleSetLocalityMetaDescription} SetLocalityMetaTitle={HandleSetLocalityMetaTitle} />
            </>
        },
        {
            path: '/register',
            element: <>
                <Helmet>
                    <title>{baseShortTitle + " - Registrace"}</title>
                    <meta name="description" content={baseMetaDescription + " Registrace nového uživatelského účtu."} />
                </Helmet>
                <Register />
            </>
        },
        {
            path: '/resetpassword',
            element: <>
                <Helmet>
                    <title>{baseShortTitle + " - Zapomenuté heslo"}</title>
                    <meta name="description" content={baseMetaDescription + " Odeslání odkazu pro nastavení nového hesla na daný email."} />
                </Helmet>
                <ResetPassword />
            </>
        },
        {
            path: '/newpassword',
            element: <>
                <Helmet>
                    <title>{baseShortTitle + " - Nové heslo"}</title>
                    <meta name="description" content={baseMetaDescription + " Změna zapomenutého hesla."} />
                </Helmet>
                <NewPassword />
            </>
        },
        {
            path: '/activateaccount',
            element: <>
                <Helmet>
                    <title>{baseShortTitle + " - Aktivace účtu"}</title>
                    <meta name="description" content={baseMetaDescription + " Aktivace nově vytvořeného účtu."} />
                </Helmet>
                <ActivateAccount />
            </>
        },
        {
            path: '/login',
            element: <>
                <Helmet>
                    <title>{baseShortTitle + " - Přihlášení"}</title>
                    <meta name="description" content={baseMetaDescription + " Přihlášení do správy účtu s možností úpravy sledovaných jevů."} />
                </Helmet>
                <LoginRedirect />
            </>
        },
        {
            path: '/account',
            element: <>
                <Helmet>
                    <title>{baseShortTitle + " - Účet"}</title>
                    <meta name="description" content={baseMetaDescription + " Správa účtu uživatele s možností úpravy sledovaných jevů."} />
                </Helmet>
                <UserAccount />
            </>
        },
        {
            path: '/_adm',
            element: <>
                <Helmet>
                    <title>{baseShortTitle + " - Administrace"}</title>
                    <meta name="description" content={baseMetaDescription} />
                </Helmet>
                <Adm />
            </>
        },
        {
            path: '/_adm/logs',
            element: <>
                <Helmet>
                    <title>{baseShortTitle + " - Administrace/Logy"}</title>
                    <meta name="description" content={baseMetaDescription} />
                </Helmet>
                <Logs />
            </>
        },
        {
            path: '/_adm/users',
            element: <>
                <Helmet>
                    <title>{baseShortTitle + " - Administrace/Uživatelé"}</title>
                    <meta name="description" content={baseMetaDescription} />
                </Helmet>
                <Users />
            </>
        },
        {
            path: '/historie',
            element: <>
                <Helmet>
                    <title>{baseShortTitle + " - Historie"}</title>
                    <meta name="description" content={baseMetaDescription} />
                </Helmet>
                <HistoryController />
            </>
        },
        {
            path: '*',
            element: <>
                <Helmet>
                    <title>{baseShortTitle + " - Nenalezeno"}</title>
                    <meta name="description" content={baseMetaDescription + " Neexistující adresa na webu. 404 not found."} />
                </Helmet>
                <NotFound />
            </>
        },
    ];

    return (
        <Routes>
            {AppRoutes.map((route, index) => {
                const { path, element, ...rest } = route;
                return <Route key={index} path={path} element={element} {...rest} />;
            })}
        </Routes>
    );
}

export default App;