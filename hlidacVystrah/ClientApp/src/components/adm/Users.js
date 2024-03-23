import React, { Component } from 'react';
import '../../styles/adm/users.scss';
import '../../styles/adm/adm.scss';
import axios from "axios";
import { NavMenu } from '../NavMenu';
import { Footer } from '../Footer';
import { Spinner } from '../Spinner';
import UserFormHelper from '../UserFormHelper';
import UserLoginHelper from '../UserLoginHelper';
import { Login } from '../Login';

export class Users extends Component {
    static displayName = Users.name;

    constructor(props) {
        super(props);

        this.state = {
            response: null,
            makeAdminResponse: null,
            removeAdminResponse: null,
            deleteUserResponse: null,

            loggedIn: false,
            loading: true,

            users: [],
            admins: []
        };

        this.loginHelper = new UserLoginHelper();
        this.helper = new UserFormHelper();
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

            if(adminLoggedIn)
                this.FetchUsers();
        });
    }

    FetchUsers = () => {

        this.setState((prevState) => ({
            ...prevState,
            loading: true
        }));
        axios
            .post("/api/adm/users", {
                LoginToken: localStorage.getItem("loginToken")
            })
            .then((response) => {

                let data = response.data;
                this.setState((prevState) => ({
                    ...prevState,
                    admins: data.admins,
                    users: data.users,
                    response: data.responseCode
                }))
            }).catch(() => {
                this.setState((prevState) => ({ ...prevState, response: 500 }));
            }).finally(() => {
                this.setState((prevState) => ({ ...prevState, loading: false }));
            });
    }

    HandleMakeUserAdmin = (id) => {

        axios
            .post("/api/adm/users/makeadmin", {
                LoginToken: localStorage.getItem("loginToken"),
                Id: id
            })
            .then((response) => {

                let data = response.data;
                this.setState((prevState) => ({
                    ...prevState,
                    makeAdminResponse: data.responseCode
                }));

                this.FetchUsers();

            }).catch(() => {
                this.setState((prevState) => ({ ...prevState, makeAdminResponse: 500 }));
            });
    }

    HandleRemoveUserAdmin = (id) => {

        axios
            .post("/api/adm/users/removeadmin", {
                LoginToken: localStorage.getItem("loginToken"),
                Id: id
            })
            .then((response) => {

                let data = response.data;
                this.setState((prevState) => ({
                    ...prevState,
                    removeAdminResponse: data.responseCode
                }));

                this.FetchUsers();

            }).catch(() => {
                this.setState((prevState) => ({ ...prevState, removeAdminResponse: 500 }));
            });
    }

    HandleDeleteUser = (id) => {

        axios
            .post("/api/adm/users/delete", {
                LoginToken: localStorage.getItem("loginToken"),
                Id: id
            })
            .then((response) => {

                let data = response.data;
                this.setState((prevState) => ({
                    ...prevState,
                    deleteUserResponse: data.responseCode
                }));

                this.FetchUsers();

            }).catch(() => {
                this.setState((prevState) => ({ ...prevState, deleteUserResponse: 500 }));
            });
    }

    RenderResponseText = () => {

        switch (this.state.response) {
            case 401:
                return this.helper.RenderInformationText("Přístup odepřen!", true);
            case 440:
                return this.helper.RenderInformationText("Přihlášení vypršelo!", true);
            case 500:
                return this.helper.RenderInformationText("Něco se nepovedlo. Zkuste to později.", true);
            default:
                return;
        }
    }

    RenderUserDeleteResponseText = () => {

        setTimeout(() => {
            this.setState((prevState) => ({ ...prevState, deleteUserResponse: null }))
        }, this.helper.timeoutDuration);

        switch (this.state.deleteUserResponse) {
            case 200:
                return this.helper.RenderInformationText("Uživatel smazán!", false);
            case 400:
                return this.helper.RenderInformationText("Uživatele nelze smazat!", true);
            case 401:
                return this.helper.RenderInformationText("Přístup odepřen!", true);
            case 440:
                return this.helper.RenderInformationText("Přihlášení vypršelo!", true);
            case 500:
                return this.helper.RenderInformationText("Něco se nepovedlo. Zkuste to později.", true);
            default:
                return;
        }
    }

    RenderMakeAdminResponseText = () => {

        setTimeout(() => {
            this.setState((prevState) => ({ ...prevState, makeAdminResponse: null }))
        }, this.helper.timeoutDuration);

        switch (this.state.makeAdminResponse) {
            case 200:
                return this.helper.RenderInformationText("Práva přidělena!", false);
            case 401:
                return this.helper.RenderInformationText("Přístup odepřen!", true);
            case 440:
                return this.helper.RenderInformationText("Přihlášení vypršelo!", true);
            case 500:
                return this.helper.RenderInformationText("Něco se nepovedlo. Zkuste to později.", true);
            default:
                return;
        }
    }

    RenderRemoveAdminResponseText = () => {

        setTimeout(() => {
            this.setState((prevState) => ({ ...prevState, removeAdminResponse: null }))
        }, this.helper.timeoutDuration);

        switch (this.state.removeAdminResponse) {
            case 200:
                return this.helper.RenderInformationText("Práva odstraněna!", false);
            case 400:
                return this.helper.RenderInformationText("Neplatný, nebo nesmazatelný admin!", true);
            case 401:
                return this.helper.RenderInformationText("Přístup odepřen!", true);
            case 440:
                return this.helper.RenderInformationText("Přihlášení vypršelo!", true);
            case 500:
                return this.helper.RenderInformationText("Něco se nepovedlo. Zkuste to později.", true);
            default:
                return;
        }
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

    RenderAdmins = () => {
        return (
            this.state.admins.length > 0 &&
                <table className='col-12'>
                    <thead className='border-bottom '>
                        <tr className='col-12'>
                            <th className='col-1 p-1'>DEL</th>
                            <th className='col-1 p-1'>ID</th>
                            <th className='col-3 p-1'>ID uživatele</th>
                            <th className='col-4 p-1'>E-mail uživatele</th>
                            <th className='col-3 p-1'>Popis</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.admins.map(a => (
                            <tr key={a.id} className='col-12'>
                                <td className='col-1 p-1 del'>
                                    <i className="fa-solid fa-xmark" onClick={() => this.HandleRemoveUserAdmin(a.id)}></i>
                                </td>
                                <td className='col-1 p-1'>{a.id}</td>
                                <td className='col-3 p-1'>{a.idUser}</td>
                                <td className='col-4 p-1'>{a.email}</td>
                                <td className='col-3 p-1'>{a.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
        );
    }

    RenderUsers = () => {
        return (
            this.state.users.length > 0 &&
            <table className='col-12'>
                <thead className='border-bottom '>
                    <tr className='col-12'>
                        <th className='col-1 p-1'>DEL</th>
                        <th className='col-1 p-1'>ID</th>
                        <th className='col-3 p-1'>E-mail</th>
                        <th className='col-2 p-1'>Aktivní</th>
                        <th className='col-2 p-1'>Vytvořen</th>
                        <th className='col-1 p-1'>Admin</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.users.map(u => (
                        <tr key={u.id} className='col-12'>
                            <td className='col-1 p-1 del'>
                                <i className="fa-solid fa-xmark" onClick={() => this.HandleDeleteUser(u.id)}></i>
                            </td>
                            <td className='col-1 p-1'>{u.id}</td>
                            <td className='col-4 p-1'>{u.email}</td>
                            <td className='col-2 p-1'>{u.isActive ? 'Ano' : 'Ne'}</td>
                            <td className='col-2 p-1'>{u.createdAt}</td>
                            <td className='col-1 p-1'>
                                {this.state.admins.find(a => a.idUser == u.id) ?
                                    'Ano' :
                                    <>
                                        Ne
                                        <button className='border rounded p-1 ms-2' onClick={() => this.HandleMakeUserAdmin(u.id)}>Přidat</button>
                                    </>
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    RenderPageContent = () => {
        return (
            <>
                <NavMenu HandleUserLoginExpired={this.HandleUserLoginExpired} />
                <section id="users" className='container mb-5'>
                    <div className='mt-2 mt-md-3'>
                        <a href='/_adm' className='administrationBack border-bottom fit-content'>
                            <i className="fa-solid fa-arrow-left me-2"></i>
                            Zpět do menu administrace
                        </a>
                    </div>

                    {this.state.response == 200 ?
                        <>
                            <h2 className='mt-3 mt-md-4 mb-3'>Administrátoři aplikace</h2>
                            {this.RenderRemoveAdminResponseText()}
                            {this.RenderAdmins()}
                            <h2 className='mt-3 mt-md-4 mb-3'>Uživatelské účty</h2>
                            {this.RenderMakeAdminResponseText()}
                            {this.RenderUserDeleteResponseText()}
                            {this.RenderUsers()}
                        </>
                        :
                        <div className='mt-4'>{this.RenderResponseText()}</div>
                    }
                </section>
                <Footer />
            </>
        )
    }

    render() {

        return (
            this.state.loading ?
                <Spinner />
                :
                this.state.loggedIn ?
                    this.RenderPageContent()
                    :
                    <Login HandleUserLogIn={this.TokenLogin} isAdministration={true} loginExpired={this.state.loginExpired} />
        );
    }
}
