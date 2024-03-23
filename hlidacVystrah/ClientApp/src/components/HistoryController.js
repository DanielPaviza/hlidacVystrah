
import React, { Component } from 'react';
import '../styles/history.scss';
import { Spinner } from './Spinner';
import { NavMenu } from './NavMenu';
import { Footer } from './Footer';
import { History } from './History';
import axios from "axios";

export class HistoryController extends Component {
    static displayName = HistoryController.name;

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            previousUpdates: [],
            nextUpdates: [],
            currentUpdate: null,
            response: null,
            selectedDate: null
        };

        this.todayDate = new Date().toISOString().substring(0, 10);
    }

    componentDidMount() {
        this.GetUpdateList(null);
    }

    async GetUpdateList(timestamp) {

        axios.post('/api/update/list', {
            "timestamp": timestamp
        })
            .then(response => {

                let data = response.data;
                this.setState((prevState) => ({
                    ...prevState,
                    response: data.responseCode,
                    selectedDate: this.GetDateFromTimestamp(timestamp)
                }));

                if (data.responseCode == 200) {
                    this.setState((prevState) => ({
                        ...prevState,
                        loading: false,
                        previousUpdates: data.previousUpdates,
                        currentUpdate: data.currentUpdate,
                        nextUpdates: data.nextUpdates,
                    }));
                }
            });
    }

    HandleGetNextUpdate = () => {

        if (this.state.nextUpdates.length <= 0)
            return;

        let nextUpdate = this.state.nextUpdates[this.state.nextUpdates.length-1];
        this.GetUpdateList(nextUpdate.timestamp);
    }

    HandleGetPreviousUpdate = () => {

        if (this.state.previousUpdates.length <= 0)
            return;

        let previousUpdate = this.state.previousUpdates[0];
        this.GetUpdateList(previousUpdate.timestamp);
    }

    HandleSetDateFromCalendar = (calendarDate) => {

        if (!calendarDate) {
            this.GetUpdateList(null);
            return;
        }

        this.GetUpdateList(calendarDate);
    }

    GetDateFromTimestamp = (timestamp) => {

        if (timestamp == null)
            return null;

        let dateSplit = timestamp.split("T")[0].split('-');
        let day = dateSplit[2].length < 2 ? ('0' + dateSplit[2]) : dateSplit[2];
        let date = dateSplit[0] + '-' + dateSplit[1] + '-' + day;

        return date;
    }

    RenderUpdates = () => {
        return (
            <div className='w-100 updates d-flex border-bottom justify-content-around'>
                {this.state.nextUpdates.map((update, index) => (
                    <div key={update.timestamp} className={`${(index != this.state.nextUpdates.length - 1) && 'd-none'} d-md-flex w-100 d-flex align-items-center justify-content-center p-1 m-1  ${index != 0 && 'border-start'}`} onClick={() => this.GetUpdateList(update.timestamp) }>
                        <div>{update.timestampReadable}</div>
                    </div>
                ))}

                <div key={this.state.currentUpdate.timestamp} className={`position-relative w-100 d-flex align-items-center justify-content-center currentTimestamp fw-bold p-2 ${this.state.nextUpdates.length > 0 && 'border-start'}`}>
                    <div>{this.state.currentUpdate.timestampReadable}</div>
                    <small className="text-muted position-absolute top-100">Vybráno</small>
                </div>

                {this.state.previousUpdates.map((update, index) => (
                    <div key={update.timestamp} className={`${index != 0 && 'd-none'} d-md-flex w-100 d-flex align-items-center justify-content-center p-1 m-1 border-start`} onClick={() => this.GetUpdateList(update.timestamp)}>
                        <div>{update.timestampReadable}</div>
                    </div>
                ))}
            </div>
        );
    }

    TimestampDateToHumanReadable = (date) => {
        let dateSplit = date.split('-');
        return dateSplit[2] + '.' + dateSplit[1] + '.' + dateSplit[0];
    } 

    render() {

        return (
            <>
                <NavMenu />
                <div id="history" className='container'>
                    <h2 className='mt-4'>Archiv meteorologických dat</h2>
                    {this.state.loading ?
                        <div className='position-relative mt-5'>
                            <Spinner />
                        </div>
                        :
                        <div className='d-flex flex-column'>
                            <div className='mt-2 mb-2'>
                                <label htmlFor="timestamp" className='me-2'>Vyhledat datum aktualizace:</label>
                                <input type="date" id="timestamp" max={this.todayDate} value={this.state.selectedDate ?? ""} onChange={(e) => this.HandleSetDateFromCalendar(e.target.value)} />
                                {this.state.selectedDate != null &&
                                    <i className="fa-solid fa-xmark ms-1" onClick={() => this.GetUpdateList(null)} />
                                }
                            </div>
                            {this.state.response == 200 ?
                                <>
                                    <div className='d-flex flex-column align-items-center'>
                                        <div className='d-flex align-items-center'>
                                            {this.state.nextUpdates.length > 0 ?
                                                <i className="fa-solid fa-arrow-left" onClick={() => this.HandleGetNextUpdate()} />
                                                :
                                                <i className="fa-solid fa-arrow-right invisible" />
                                            }
                                            <h5 className='m-0 m-2'>Časová osa aktualizací</h5>
                                            {this.state.previousUpdates.length > 0 ?
                                                <i className="fa-solid fa-arrow-right" onClick={() => this.HandleGetPreviousUpdate()} />
                                                :
                                                <i className="fa-solid fa-arrow-right invisible" />
                                            }
                                        </div>
                                        {this.RenderUpdates()}
                                    </div>
                                    <div className='p-2 w-100'>
                                        <History currentUpdate={this.state.currentUpdate} />
                                    </div>
                                </>
                                :
                                <h5 className='mt-4'>Pro datum {this.TimestampDateToHumanReadable(this.state.selectedDate)} nebyly nalezeny žádné aktualizace.</h5>
                            }
                        </div>
                    }
                </div>
                <Footer background={'lightGray'} />
            </>
        );
    }
}
