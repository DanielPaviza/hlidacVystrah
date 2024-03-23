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
import { Timestamp } from './Timestamp';
import axios from "axios";
export class HomeController extends Component {
    static displayName = HomeController.name;

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

    }

    componentDidMount() {
        this.GetEventList();
        this.GetLocalityList();
        this.GetSvgMap();

        this.history = this.InitializeSiteHistory();

        if (this.props.isLocalityForce)
            this.HandleOpenLocality(this.props.cisorp);    
    }

    InitializeSiteHistory = () => {

        let savedHistory;
        try {
            savedHistory = JSON.parse(localStorage.getItem("history"));
            if (!savedHistory)
                savedHistory = [];
        } catch (e) {
            localStorage.setItem("history", []);
            savedHistory = [];
        }

        return new SiteHistory(
            this.HandleCloseDetail,
            this.HandleOpenEvent,
            this.HandleOpenLocality,
            savedHistory
        );
    }

    HandleOpenEvent = (id) => {

        this.HandleCloseDetail();
        if (this.history)
            this.history.AddRecord("event", id);

        this.setState((prevState) => ({
            ...prevState,
            eventOpened: true,
            selectedEventId: id,
        }));
    }

    HandleOpenLocality = (id, isRegion = false) => {

        this.HandleCloseDetail();

        let historySiteName = isRegion ? "region" : "locality";
        if(this.history)
            this.history.AddRecord(historySiteName, id);

        this.setState((prevState) => ({
            ...prevState,
            localityOpened: true,
            selectedLocalityId: id,
            selectedLocalityIsRegion: isRegion,
        }));
    }

    HandleOpenHome = () => {

        this.HandleCloseDetail();
        if (this.history)
            this.history.AddRecord("home");

        let path = window.location.pathname;
        if (path.split('/')[1] == 'obec')
            window.location.href = '/';
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
                RemoveLastSiteHistory={this.history.RemoveLastRecord}
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
                RemoveLastHistoryRecord={this.history.RemoveLastRecord}
                map={this.state.map}
            />
        }

        return <section id='home'>
            <h2 className='mt-3 mb-3 mt-lg-4 mb-lg-4'>Meteorologické výstrahy v České Republice</h2>
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
                <Loading />
                :
                <>
                    <div className='min-vh-100'>
                        <NavMenu CloseDetail={this.HandleCloseDetail} NavigateHome={this.HandleOpenHome} />
                        <div className='container mt-3'>
                            <span className='d-flex justify-content-between '>
                                <BackButton history={this.history} NavigateHome={this.HandleOpenHome} />
                                <Timestamp timestamp={this.state.timestamp} />
                            </span>
                            {this.RenderPage()}
                        </div>
                    </div>
                    <Footer background={'lightGray'} />
                </>
        );
    }

    async GetEventList() {

        axios.get('/api/event/list')
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
