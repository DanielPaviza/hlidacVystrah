import React, { Component } from 'react';
import { Spinner } from './Spinner';
import { Search } from './Search';
import axios from "axios";
import UserFormHelper from './UserFormHelper';

export class UserAccountNewNotification extends Component {
    static displayName = UserAccountNewNotification.name;

    constructor(props) {
        super(props);

        this.state = {
            loading: true,

            optionsResponse: null,
            createResponse: null,

            eventTypeOptions: [],
            severityOptions: [],
            certaintyOptions: [],
            localityOptions: [],

            selectedAreaId: null,
            selectedAreaIsRegion: false
        };

        this.formHelper = new UserFormHelper();
    }

    componentDidMount() {
        this.GetNotificationOptions();
    }

    HandleSelectArea = (id, isRegion) => {

        this.setState((prevState) => ({
            ...prevState,
            selectedAreaId: id,
            selectedAreaIsRegion: isRegion
        }));
    }

    GetNewNotificationPayload = () => {
        let idEventType = document.getElementById("selectEventType").value;
        let idSeverity = document.getElementById("selectSeverity").value;
        let idCertainty = document.getElementById("selectCertainty").value;

        if (idSeverity.length <= 0)
            idSeverity = null;

        if (idCertainty.length <= 0)
            idCertainty = null;

        let selectedAreaString = this.state.selectedAreaId;
        if(selectedAreaString != null)
            selectedAreaString = selectedAreaString.toString()

        return {
            "LoginToken": this.props.loginToken,
            "IdEventType": idEventType,
            "IdSeverity": idSeverity,
            "IdCertainty": idCertainty,
            "IdArea": selectedAreaString,
            "IsRegion": this.state.selectedAreaIsRegion,
        };
    }

    GetNotificationOptions = () => {

        axios.get('/api/user/notificationoptions')
            .then(response => {

                let data = response.data;

                this.props.HandleUserLoginExpired(data.responseCode);

                this.setState((prevState) => ({
                    ...prevState,
                    optionsResponse: data.responseCode,
                    eventTypeOptions: data.eventTypeList,
                    severityOptions: data.severityList,
                    certaintyOptions: data.certaintyList,
                    localityOptions: data.localityList
                }));
            })
            .catch(error => {
                this.setState((prevState) => ({
                    ...prevState,
                    optionsResponse: 500
                }));
            })
            .finally(() => {
                this.setState((prevState) => ({
                    ...prevState,
                    loading: false
                }));
            });
    }

    SetNewNotification = () => {

        this.setState((prevState) => ({
            ...prevState,
            loading: true
        }));

        let payload = this.GetNewNotificationPayload();

        axios.post('/api/user/addnotification', payload)
            .then(response => {

                let data = response.data;

                this.props.HandleUserLoginExpired(data.responseCode);

                this.setState((prevState) => ({
                    ...prevState,
                    createResponse: data.responseCode
                }));

                this.props.GetNotifications();
            })
            .catch(error => {
                this.setState((prevState) => ({
                    ...prevState,
                    createResponse: 500
                }));
            })
            .finally(() => {
                this.setState((prevState) => ({
                    ...prevState,
                    loading: false,
                    selectedAreaId: null,
                    selectedAreaIsRegion: false
                }));
            });
    }

    RenderCreateResponse = () => {

        if (this.state.createResponse != null)
            setTimeout(() => {
                this.setState((prevState) => ({ ...prevState, createResponse: null }))
            }, this.formHelper.timeoutDuration);

        switch (this.state.createResponse) {
            case 200:
                return this.formHelper.RenderInformationText("Výstraha úspěšně uložena", false);
            case 400:
                return this.formHelper.RenderInformationText("Neplatná volba!", true);
            case 409:
                return this.formHelper.RenderInformationText("Výstraha je již uložena", true);
            case 500:
                return this.formHelper.RenderInformationText("Něco se nepovedlo. Obnovte stránku.", true);
            default:
                return;
        }
    }

    RenderContent = () => {
        return (
            this.state.optionsResponse == 200 ?
                <>
                    <div className='d-flex flex-wrap justify-content-between'>
                        <div className='selectBox d-flex flex-column'>
                            <label>Typ výstrahy</label>
                            <select id='selectEventType' className='rounded'>
                                {this.state.eventTypeOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='selectBox d-flex flex-column '>
                            <label>Závažnost</label>
                            <select id='selectSeverity' className='rounded'>
                                <option value=''>Jakákoliv</option>
                                {this.state.severityOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.text}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='selectBox d-flex flex-column mt-2 mt-md-0'>
                            <label>Výskyt</label>
                            <select id='selectCertainty' className='rounded'>
                                <option value=''>Jakýkoliv</option>
                                {this.state.certaintyOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.text}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='selectBox d-flex flex-column mt-2 mt-md-0'>
                            <label>Lokalita</label>
                            <Search isAccount={true} localityList={this.state.localityOptions} HandleSelectArea={this.HandleSelectArea} />
                        </div>                       
                    </div>
                    <span className='d-flex justify-content-end mt-3'>
                        <button className='border-0 p-2 rounded addNotification' onClick={() => this.SetNewNotification() }>Přidat</button>
                    </span>
                </>
                :
                this.formHelper.RenderInformationText("Něco se nepovedlo. Obnovte stránku.", true)
        );
    }

    render() {

        return (
                <div className=''>
                <p className='fw-bold mb-2'>Přidat sledovanou výstrahu</p>
                {this.RenderCreateResponse()}
                    {this.state.loading ? 
                        <Spinner />
                        :
                        this.RenderContent()
                    }
                </div>
        );
    }
}
