import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MapHelper from './MapHelper';
import '../styles/map.scss';
export class MapEventController extends Component {
    static displayName = MapEventController.name;

    constructor(props) {
        super(props);
        this.helper = new MapHelper(this.props.map, this.props.OpenLocalityDetail);

        this.isDetail = this.props.isDetail;

        this.state = {
            labelOpened: false,
            labelId: 0
        }
    }

    render() {

        let affected = this.isDetail ? this.GetAffectedLocality() : this.GetAffectedLocalityList();

        return (
            <div id="map" className='d-flex justify-content-center mx-auto'>
                {this.state.labelOpened && 
                    this.helper.GetLocalityLabel(this.props.allLocalities, this.state.labelId)
                }
                {this.helper.GetColoredMap(affected, this.HandleLocalityHover, this.HandleLocalityHoverEnd)}
            </div>
        );
    }

    HandleLocalityHover = (cisorp) => {
        //console.log(cisorp);
        this.setState({
            labelOpened: true,
            labelId: cisorp
        })
    }

    HandleLocalityHoverEnd = () => {
        this.setState((prevState) => ({
            ...prevState,
            labelOpened: false
        }));
    }

    GetAffectedLocality() {
        let affected = [];
        let event = this.props.events[0];
        let color = this.props.GetEventColor(event.severity);
        affected[color] = [];

        Object.entries(event.localityList).forEach(([region, localities]) => {
            affected[color].push(localities);
        });

        affected = this.helper.FlattenAffected(affected);

        return affected;
    }

    GetAffectedLocalityList = () => {

        let affected = {};
        affected["noEvent"] = [];
        Object.entries(this.props.allLocalities).forEach(([region, localities]) => {
            affected["noEvent"].push(localities);
        })

        this.props.events.forEach((event) => {
            Object.entries(event.localityList).forEach(([region, localities]) => {
                let severityColor = this.props.GetEventColor(event.severity);
                if (!affected.hasOwnProperty(severityColor))
                    affected[severityColor] = [];
                affected[severityColor].push(localities);
            });
        });

        affected = this.helper.FlattenAffected(affected);
        affected = this.helper.FilterLessSevereLocalities(affected);

        return affected;
    }
}
