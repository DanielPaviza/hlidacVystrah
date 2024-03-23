import React, { Component } from 'react';
import { MapEventController } from "./MapEventController";
import { Legend } from "./Legend";
import '../styles/eventDetail.scss';
export class EventDetail extends Component {
    static displayName = EventDetail.name;

    constructor(props) {
        super(props);

        this.event = this.props.allEvents.find(e => e.id === this.props.targetId);

        this.state = {
            showDescription: true,
            showLocalityList: false
        };

        this.props.ScrollToTop();
    }

    componentDidUpdate() {
        if(this.props.event != this.state.event)
            this.props.ScrollToTop();
    }

    ToggleShowDescription = () => {
        this.setState((prevState) => ({
            ...prevState,
            showDescription: !this.state.showDescription
        }));
    }

    ToggleShowLocalityList = () => {
        this.setState((prevState) => ({
            ...prevState,
            showLocalityList: !this.state.showLocalityList
        }));
    }

    RenderRegions = () => {
        return (
            <div className='mt-2 affectedLocalities ps-2'>
                {Object.entries(this.event.localityList).map(([key, value]) => (
                    <div key={key} className='d-flex flex-column'>
                        <span className='fw-bold fit-content' onClick={() => this.props.OpenLocalityDetail(key, true)}>{key}</span>
                        <span>
                            {this.RenderLocalityList(value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    GetDescriptionArrowDirection = () => {
        return this.state.showDescription ? "up" : "down";
    }

    GetLocalityListArrowDirection = () => {
        return this.state.showLocalityList ? "up" : "down";
    }

    RenderLocalityList = (nameList) => {
        return (
            Object.values(nameList).map((item, index, array) => (
                <span key={item.cisorp} onClick={() => this.props.OpenLocalityDetail(item.cisorp) }>
                    {item.name}
                    {index < array.length - 1 && ', '}
                </span>
            ))
        );
    }

    render() {

        if (this.event == null || this.event == undefined) {

            if (!this.props.isHistory)
                this.props.RemoveLastSiteHistory();
            this.props.CloseDetail();
            return "";
        }

        return (
            <section id="eventDetail">
                <h2 className='mt-4 mt-md-5 mb-3'>Detail meteorologické výstrahy {this.props.isHistory && ' - ARCHIV'}</h2>
                <div className='detail d-flex flex-column'>
                    <div className='d-flex'>
                        <div className=''>
                            <div className='d-flex flex-column short'>
                                <span className='detailRow d-flex-inline'>
                                    <span className='fw-bold me-1'>Typ:</span>
                                    <span>{this.event.eventType}</span>
                                </span>
                                <span className='detailRow d-flex align-items-center'>
                                    <span className='fw-bold me-1'>Závažnost:</span>
                                    <span>{this.event.severity}</span>
                                    <div className={`ms-2 colorCircle ${this.props.GetEventColor(this.event.severity)}`}></div>
                                </span>
                                <span className='detailRow'>
                                    <span className='fw-bold me-1'>Výskyt:</span>
                                    <span>{this.event.certainty}</span>
                                </span>
                                <span className='detailRow'>
                                    <span className='fw-bold me-1'>Doba výskytu:</span>
                                    <span>{this.event.urgency}</span>
                                </span>
                                <span className='detailRow'>
                                    <span className='fw-bold me-1'>Začátek:</span>
                                    <span>{this.event.onset}</span>
                                </span>
                                {this.event.expires &&
                                    <span className='detailRow'>
                                        <span className='fw-bold me-1'>Konec~:</span>
                                        <span>{this.event.expires}</span>
                                    </span>
                                }
                            </div>
                        </div>
                        <div className='eventIconContainer col-4 mx-auto my-auto d-flex justify-content-center align-items-center p-3'>       
                            <img className={`typeImg `} src={`/images/${this.event.imgPath}`} alt={`Ikona jevu ${this.event.eventType}`} />
                        </div>
                    </div>
                    <div className='rollDown detailRow' onClick={() => this.ToggleShowDescription() }>
                        <span className='d-flex justify-content-between'>
                            <span className='fw-bold me-1'>Popis:</span>
                            <i className={`fa-solid fa-angles-${this.GetDescriptionArrowDirection()} d-flex align-items-center`}></i>
                        </span>
                        {this.state.showDescription &&
                            <div className='ms-2 mt-2 description'>
                                <span>{this.event.description}</span>
                                <br />
                                <span>{this.event.instruction}</span>
                            </div>
                        }
                    </div>
                    <div className='rollDown detailRow' onClick={() => this.ToggleShowLocalityList()}>
                        <span className='d-flex justify-content-between'>
                            <span className='fw-bold me-1'>Postižené oblasti:</span>
                            <i className={`fa-solid fa-angles-${this.GetLocalityListArrowDirection()} d-flex align-items-center`}></i>
                        </span>
                        {this.state.showLocalityList &&
                            this.RenderRegions()
                        }
                    </div>
                    <div className='mt-4 mt-md-5'>
                        <MapEventController
                            events={[this.event]}
                            GetEventColor={this.props.GetEventColor}
                            OpenLocalityDetail={this.props.OpenLocalityDetail}
                            map={this.props.map}
                            allLocalities={this.props.allLocalities}
                            isDetail={true}
                        />
                        <Legend isDetail={true} />
                    </div>
                </div>
            </section>
        );
    }
}
