import React, { Component } from 'react';
import '../../styles/adm/logs.scss';
import '../../styles/adm/adm.scss';
import axios from "axios";
import { NavMenu } from '../NavMenu';
import { Footer } from '../Footer';
import { Spinner } from '../Spinner';
import UserFormHelper from '../UserFormHelper';
import UserLoginHelper from '../UserLoginHelper';
import { Login } from '../Login';

export class Logs extends Component {
    static displayName = Logs.name;

    constructor(props) {
        super(props);

        this.state = {
            response: null,
            responseOk: false,
            logs: [],
            allLogsCount: 0,

            pageSize: 50,
            pageSizeOptions: [
                25,
                50,
                100,
                500
            ],
            pageNumber: 1,

            showId: false,
            showSession: false,

            filterOptionsServices: [],
            filterOptionsTypes: [],

            filterType: null,
            filterService: null,

            loggedIn: false,
            loading: true,
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

            if (adminLoggedIn) {
                this.FetchLogs(this.state.pageSize, 1);
                this.FetchFilterOptions();
            }
        });
    }

    HandleToggleShowId = () => {
        this.setState((prevState) => ({ ...prevState, showId: !this.state.showId }));
    }

    HandleToggleShowSession = () => {
        this.setState((prevState) => ({ ...prevState, showSession: !this.state.showSession }));
    }

    HandleChangePageSize = (value) => {
        this.setState((prevState) => ({ ...prevState, pageSize: value }));
        this.setState((prevState) => ({ ...prevState, pageNumber: 1 }));
        this.FetchLogs(value, 1);
    }

    HandleChangePageNumber = (value) => {
        this.setState((prevState) => ({ ...prevState, pageNumber: value }));
        this.FetchLogs(this.state.pageSize, value);
    }

    HandleChangeFilterType = (value) => {

        if (value == "Any")
            value = null;

        this.setState((prevState) => ({ ...prevState, pageNumber: 1, filterType: value }));
        this.FetchLogs(this.state.pageSize, 1, value, this.state.filterService);
    }

    HandleChangeFilterService = (value) => {

        if (value == "Any")
            value = null;

        this.setState((prevState) => ({ ...prevState, pageNumber: 1, filterService: value }));
        this.FetchLogs(this.state.pageSize, 1, this.state.filterType, value);
    }

    FetchFilterOptions = () => {

        axios
            .post("/api/adm/logs/options", {
                LoginToken: localStorage.getItem("loginToken")
            })
            .then((response) => {

                let data = response.data;
                this.setState((prevState) => ({
                    ...prevState,
                    filterOptionsTypes: data.logTypes,
                    filterOptionsServices: data.logServices
                }))
            });
    }

    FetchLogs = (pageSize, pageNumber, filterType = null, filterService = null) => {

        this.setState((prevState) => ({ ...prevState, responseOk: false }));
        axios
            .post("/api/adm/logs", {
                LoginToken: localStorage.getItem("loginToken"),
                PageSize: pageSize,
                PageNumber: pageNumber,
                FilterType: filterType,
                FilterService: filterService
            })
            .then((response) => {

                let data = response.data;
                this.setState((prevState) => ({
                    ...prevState,
                    response: data.responseCode,
                    logs: data.logs,
                    allLogsCount: data.allLogsCount,
                    responseOk: data.responseCode == 200
                }))
            }).catch(() => {
                this.setState((prevState) => ({ ...prevState, response: 500, allLogsCount: 0 }));
            }).finally(() => {
            });
    }

    RenderResponseText = () => {

        if (this.state.response == 200)
            setTimeout(() => {
                this.setState((prevState) => ({ ...prevState, response: null }))
            }, this.helper.timeoutDuration);

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

    RenderPageNumbers = () => {

        let numberOfPages = Math.ceil(this.state.allLogsCount / this.state.pageSize);
        let pageNumbers = [];

        for (let i = 1; i < numberOfPages + 1; i++) {
            pageNumbers.push(
                <div key={i} className={`pageNumber d-flex align-items-center me-2 ${(i === this.state.pageNumber) && 'fw-bold border-bottom selected'}`} onClick={() => this.HandleChangePageNumber(i)}>
                    {i}
                </div>
            );
        }

        return pageNumbers;
    }

    RenderLogOptions = () => {
        return (
            <>
                <div className='d-flex flex-column align-items-md-center flex-md-row'>
                    <div className='mt-1 mt-md-0 d-flex align-items-center'>
                        <label htmlFor="showId" className='me-2'>Ukázat ID</label>
                        <input type="checkbox" id="showId" className='' onChange={() => this.HandleToggleShowId()} checked={this.state.showId} />
                    </div>
                    <div className='border-start mt-1 mt-md-0 d-flex align-items-center ps-md-3 ms-md-3'>
                        <label htmlFor="showSession" className='me-2'>Ukázat SID</label>
                        <input type="checkbox" id="showSession" className='' onChange={() => this.HandleToggleShowSession()} checked={this.state.showSession} />
                    </div>
                    <div className='border-start d-flex align-items-center mt-1 ps-md-3 ms-md-3'>
                        <label className='me-2' htmlFor='recordOnPage'>Záznamů na stránce:</label>
                        <select id='recordOnPage' className='border p-1 fit-content' defaultValue={this.state.pageSize} onChange={(e) => this.HandleChangePageSize(e.target.value)}>
                            {this.state.pageSizeOptions.map((option, index) => (
                                <option key={index} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='border-start d-flex align-items-center mt-1 ps-md-3 ms-md-3'>
                        <label className='me-2' htmlFor='typeFilter'>Typ:</label>
                        <select id='typeFilter' className='border p-1 fit-content' defaultValue={null} onChange={(e) => this.HandleChangeFilterType(e.target.value)}>
                            <option value="Any">Any</option>
                            {this.state.filterOptionsTypes.map(option => (
                                <option key={option.id} value={option.id} className={option.id}>
                                    {option.id}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='border-start d-flex align-items-center mt-1 ps-md-3 ms-md-3'>
                        <label className='me-2' htmlFor='serviceFilter'>Třída:</label>
                        <select id='serviceFilter' className='border p-1 fit-content' defaultValue={null} onChange={(e) => this.HandleChangeFilterService(e.target.value)}>
                            <option value={null}>Any</option>
                            {this.state.filterOptionsServices.map(option => (
                                <option key={option.id} value={option.id} className={option.id}>
                                    {option.id}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className='pt-2 d-flex mt-1 mt-md-0'>
                    <div className='me-2'>Page:</div>
                    <div className='d-flex flex-wrap'>
                        {this.RenderPageNumbers()}
                    </div>
                </div>
            </>
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

    RenderPageContent = () => {
        return (
            <>
                <NavMenu HandleUserLoginExpired={this.HandleUserLoginExpired} />
                <section id="logspage" className='container mb-5'>
                    <div className='mt-2 mt-md-3'>
                        <a href='/_adm' className='administrationBack border-bottom fit-content'>
                            <i className="fa-solid fa-arrow-left me-2"></i>
                            Zpět do menu administrace
                        </a>
                    </div>
                    <h2 className='mt-3 mt-md-4 mb-3'>Systémové logy</h2>
                    {this.RenderResponseText()}
                    {this.RenderLogOptions()}
                    <div className='position-relative mt-3 pt-3 border-top'>
                        {this.state.responseOk ?
                            <>
                                {this.RenderLogTable()}
                            </>
                            :
                            <Spinner />
                        }
                    </div>
                </section>
                <Footer />
            </>
        )
    }

    RenderLogTable = () => {
        return (
            <table className='logs col-12'>
                <thead className='border-bottom '>
                    <tr className='col-12'>
                        {this.state.showId && <th className='col-1'>Id</th>}
                        <th className='col-1'>Čas</th>
                        <th className='col-1'>Typ</th>
                        <th className='col-1'>Třída</th>
                        <th className='col-2'>Název</th>
                        <th className='col-3'>Zpráva</th>
                        {this.state.showSession && <th className='col-1 overflow-auto'>Session</th>}
                        <th className='col-3'>Browser info</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.logs.map(log => (
                        <tr key={log.id} className='col-12'>
                            {this.state.showId && <td className='col-1 fw-bold'>{log.id}</td>}
                            <td className='col-1'>{log.timestamp}</td>
                            <td className={`col-1 ${log.id_log_type}`}>{log.id_log_type}</td>
                            <td className='col-1'>{log.id_log_service}</td>
                            <td className='col-2'>{log.name}</td>
                            <td className='col-3'>{log.text}</td>
                            {this.state.showSession && <td className='col-1'>{log.session}</td>}
                            <td className='col-3'>{log.client_info}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
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
