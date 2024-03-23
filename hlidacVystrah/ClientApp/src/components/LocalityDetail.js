import React, { Component } from 'react';
import { MapEventList } from "./MapEventList";
import '../styles/localityDetail.scss';
import { Prev } from '../../../../node_modules/react-bootstrap/esm/PageItem';
export class LocalityDetail extends Component {
    static displayName = LocalityDetail.name;

    constructor(props) {
        super(props);
        this.props.ScrollToTop();

        this.state = {
            targetId: this.props.targetId,
        }
    }

    ValidateLocality = () => {

        const allLocalitiesArray = Object.values(this.props.allLocalities).flat();
        let localityIsValid = allLocalitiesArray.some(localityObj => localityObj.cisorp == this.props.targetId);

        if (!localityIsValid && !this.props.isHistory) {
            this.props.RemoveLastHistoryRecord();
        }  

        return localityIsValid;
    }

    ValidateRegion = () => {
        let keys = Object.keys(this.props.allLocalities);
        let regionIsValid = keys.some(key => key == this.props.targetId);
        if (!regionIsValid && !this.props.isHistory)
            this.props.RemoveLastHistoryRecord();

        return regionIsValid;
    }

    GetSimilarCisorpsToInvalidInput = () => {

        let similar = [];

        Object.entries(this.props.allLocalities).forEach(([region, localities]) => {

            let localityList;

            if (this.props.targetId.length < 4) {

                localityList = localities.filter((l) =>
                    l.cisorp.toString().includes(this.props.targetId.toString())
                );
            } else {
                localityList = localities.filter((l) =>
                    this.props.targetId.toString().includes(l.cisorp.toString())
                );
            }

            if (localityList.length > 0)
                similar.push(localityList);
        })

        return similar.flat();
    }

    componentDidMount() {
    }

    componentDidUpdate() {

        if (this.props.targetId != this.state.targetId) {
            this.props.ScrollToTop();
        }
    }

    GetLocalityInfo = () => {

        let result = { region: null, name: null, cisorp: null };

        if (this.props.isRegion)
            result.region = this.props.targetId;

        Object.entries(this.props.allLocalities).forEach(([region, localities]) => {

            const locality = localities.find((item) => item.cisorp == this.props.targetId);
            if (locality)
                return result = { region, name: locality.name, cisorp: locality.cisorp };
        })
        
        return result;
    }

    GetEventsInLocality = () => {

        let filteredEvents;

        if (this.props.isRegion) {
            filteredEvents = this.props.allEvents.filter(event =>
                Object.keys(event.localityList).includes(this.props.targetId)
            );
        } else {

            filteredEvents = this.props.allEvents.filter((event) =>
                Object.values(event.localityList).some((list) =>
                    list.some((item) => item.cisorp == this.props.targetId)
                )
            );
        }

        return filteredEvents;
    }

    render() {

        if (!this.props.isRegion && !this.ValidateLocality()) {
            return <div id="notFound" className='container mt-5 mb-3'>
                <h2>Obec s rozšířenou působností s číslem CISORP <i>{this.props.targetId}</i> nebyla nalezena.</h2>
                {
                    (this.props.targetId.length >= 2 && this.GetSimilarCisorpsToInvalidInput().length > 0) &&
                    <div className='mb-4'>
                        <p className='mb-0'>Podobná čísla CISORP:</p>
                        {this.GetSimilarCisorpsToInvalidInput().map((item) => (
                            <div className='mb-1' key={item.cisorp}>
                                <span className='me-1'>{item.cisorp} -</span>
                                <a href={`/obec/${item.cisorp}`}>{item.name}</a>
                            </div>
                        ))}
                    </div>
                }
                <a href='/' title='Meteorologické jevy v České republice'>Zpět na hlavní stranu</a>
            </div>
        }

        if (this.props.isRegion && !this.ValidateRegion()) {
            return <div id="notFound" className='container mt-5 mb-3'>
                <h2>Kraj s názvem <i>{this.props.targetId}</i> nebyl nalezen.</h2>
                <a href='/' title='Meteorologické jevy v České republice'>Zpět na hlavní stranu</a>
            </div>
        }

        this.events = this.GetEventsInLocality();
        this.localityInfo = this.GetLocalityInfo();

        return (
            <section id="localityDetail">
                <h2 className='mt-3 pb-1 mb-0 mt-lg-4 border-bottom fit-content'>Meteorologické výstrahy v {this.props.isRegion ? 'kraji' : 'obci'} {this.props.isHistory && ' - ARCHIV'}</h2>
                {this.props.isRegion ?
                    <h3 className='pt-1 mb-3 mb-md-4'>{this.localityInfo.region}</h3>
                    :
                    <>
                        <h3 className='pt-1 mb-1'>{this.localityInfo.name}</h3>
                        <h4 className='mb-3 mb-md-4 fit-content' role="button" onClick={() => this.props.OpenLocalityDetail(this.localityInfo.region, true)}>{this.localityInfo.region}</h4>
                    </>
                }
                <MapEventList
                    events={this.events}
                    openEvent={this.props.openEvent}
                    GetEventColor={this.props.GetEventColor}
                    mapType={"locality"}
                    localityInfo={this.localityInfo}
                    allLocalities={this.props.allLocalities}
                    OpenLocalityDetail={this.props.OpenLocalityDetail}
                    map={this.props.map}
                />
            </section>
        );
    }
}
