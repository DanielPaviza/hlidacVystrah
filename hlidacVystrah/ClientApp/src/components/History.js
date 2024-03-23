import React, { Component } from 'react';
import { MapEventList } from "./MapEventList";
import { EventDetail } from "./EventDetail";
import { LocalityDetail } from "./LocalityDetail";
import { NavMenu } from './NavMenu';
import { Search } from './Search';
import { Footer } from './Footer';
import SiteHistory from './SiteHistory';
import { BackButton } from './BackButton';
import { Loading } from './Loading';
import { Spinner } from './Spinner';
import { Timestamp } from './Timestamp';
import axios from "axios";
export class History extends Component {
    static displayName = History.name;

    constructor(props) {
        super(props);
        this.state = {
            timestamp: '',
            eventOpened: false,
            localityOpened: false,
            selectedEventId: null,
            selectedLocalityId: null,
            selectedLocalityIsRegion: false,
            localityList: [],
            localityListLoading: true,
            eventList: [],
            eventListLoading: true,
            map: [],
        };

        this.currentUpdate = this.props.currentUpdate;
    }

    componentDidMount() {
        this.GetEventList();
        this.GetLocalityList();
        this.GetSvgMap();
    }

    componentDidUpdate() {
        if (this.props.currentUpdate != this.currentUpdate) {
            this.GetEventList();
            if (this.state.eventOpened)
                this.HandleCloseDetail();
        }
            
        this.currentUpdate = this.props.currentUpdate;
    }

    HandleOpenEvent = (id) => {

        this.HandleCloseDetail();

        this.setState((prevState) => ({
            ...prevState,
            eventOpened: true,
            selectedEventId: id,
        }));
    }

    HandleOpenLocality = (id, isRegion = false) => {

        this.HandleCloseDetail();

        this.setState((prevState) => ({
            ...prevState,
            localityOpened: true,
            selectedLocalityId: id,
            selectedLocalityIsRegion: isRegion,
        }));
    }

    HandleOpenHome = () => {
        this.HandleCloseDetail();
    }

    HandleCloseDetail = () => {
        this.setState((prevState) => ({
            ...prevState,
            eventOpened: false,
            localityOpened: false,
        }));
    }

    HandleGetEventColor = (severity) => {

        let color;
        severity = severity.toLowerCase();
        switch (severity) {
            case "minimální":
                color = "green";
                break;
            case "nízká":
                color = "yellow";
                break;
            case "vysoká":
                color = "orange";
                break;
            case "extrémní":
                color = "red";
                break;
            default:
                color = "gray";
        }

        return color;
    }

    scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    GetLocalityInfo = (localityList, cisorp) => {

        let result = { region: null, name: null, cisorp: null };

        Object.entries(localityList).forEach(([region, localities]) => {

            const locality = localities.find((item) => item.cisorp == cisorp);
            if (locality)
                return result = { region, name: locality.name, cisorp: locality.cisorp };
        })

        return result;
    }

    RenderPage() {

        if (this.state.eventOpened) {
            return <EventDetail
                allEvents={this.state.eventList}
                targetId={this.state.selectedEventId}
                GetEventColor={this.HandleGetEventColor}
                OpenLocalityDetail={this.HandleOpenLocality}
                ScrollToTop={this.scrollToTop}
                map={this.state.map}
                allLocalities={this.state.localityList}
                CloseDetail={this.HandleCloseDetail}
                isHistory={true}
            />
        }

        if (this.state.localityOpened) {

            return <LocalityDetail
                allLocalities={this.state.localityList}
                allEvents={this.state.eventList}
                targetId={this.state.selectedLocalityId}
                isRegion={this.state.selectedLocalityIsRegion}
                openEvent={this.HandleOpenEvent}
                OpenLocalityDetail={this.HandleOpenLocality}
                GetEventColor={this.HandleGetEventColor}
                ScrollToTop={this.scrollToTop}
                map={this.state.map}
                isHistory={true}
            />
        }

        return <section id='home'>
            <h2 className={`mt-3 mb-3 `}>Meteorologické výstrahy v České Republice - ARCHIV</h2>
            <Search
                localityList={this.state.localityList}
                OpenLocalityDetail={this.HandleOpenLocality}
            />
            <MapEventList
                events={this.state.eventList}
                openEvent={this.HandleOpenEvent}
                GetEventColor={this.HandleGetEventColor}
                mapType={'event'}
                OpenLocalityDetail={this.HandleOpenLocality}
                map={this.state.map}
                allLocalities={this.state.localityList}
                isDetail={false}
            />
        </section>
    }

    render() {
        return (
            this.state.eventListLoading || this.state.localityListLoading || this.state.map.length <= 0 ?
                <div className='position-relative mt-5'>
                    <Spinner />
                </div>
                :
                <div className='container mt-3'>
                    <span className='d-flex justify-content-between mt-4'>
                        {(this.state.eventOpened || this.state.localityOpened) ?
                            <span className='borderLeft fw-bold cursor' onClick={() => this.HandleCloseDetail()}>
                                <i className="fa-solid fa-house me-2"></i>
                                Domů
                            </span>
                            :
                            <span></span>
                        }
                        <div className='d-flex flex-column'>
                            <span className='border-bottom'>Datum záznamu</span>
                            <span className=''>{this.props.currentUpdate.timestampReadable}</span>
                        </div>
                    </span>
                    {this.RenderPage()}
                </div>
        );
    }

    async GetEventList() {

        let url = '/api/event/list?timestamp=' + this.props.currentUpdate.timestamp
        axios.get(url)
            .then(response => {

                let data = response.data;
                if (data.responseCode == 200)
                    this.setState((prevState) => ({
                        ...prevState,
                        eventList: data.events,
                        eventListLoading: false,
                        timestamp: data.dataTimestamp,
                    }));
            });
    }

    async GetLocalityList() {

        axios.get('/api/locality/list')
            .then(response => {

                let data = response.data;
                if (data.responseCode == 200) {
                    this.setState((prevState) => ({
                        ...prevState,
                        localityList: data.localityList,
                        localityListLoading: false
                    }));

                    // locality detail meta tags
                    if (this.props.isLocalityForce) {
                        let localityInfo = this.GetLocalityInfo(data.localityList, this.props.cisorp);
                        if (localityInfo.name == null) {
                            this.props.SetLocalityMetaTitle("Neznámá obec");
                        } else {
                            this.props.SetLocalityMetaTitle(localityInfo.name);
                            this.props.SetLocalityMetaDescription("Detail obce " + localityInfo.name + " v kraji " + localityInfo.region + ".");
                        }
                    }
                }
            });
    }

    async GetSvgMap() {

        axios.get('/images/map.svg')
            .then(response => {

                if (response.status != 200)
                    throw new Error('Network response was not ok');

                let map = response.data;
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(map, 'image/svg+xml');
                let gs = Array.from(svgDoc.children[0].children[0].children);

                this.setState((prevState) => ({
                    ...prevState,
                    map: gs
                }));
            })
            .catch(error => {
                console.error('Error during fetch:', error);
            })
    }
}
