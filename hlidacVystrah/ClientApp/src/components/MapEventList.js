import React, { Component } from 'react';
import { MapEventController } from "./MapEventController"; 
import { MapLocalityController } from "./MapLocalityController"; 
import { EventList } from "./EventList"; 
import { Legend } from "./Legend";
import '../styles/mapEvents.scss';
export class MapEventList extends Component {
    static displayName = MapEventList.name;

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div id="mapEvents">
                {this.props.mapType == "event" && 
                    <MapEventController
                        events={this.props.events}
                        GetEventColor={this.props.GetEventColor}
                        OpenLocalityDetail={this.props.OpenLocalityDetail}
                        map={this.props.map}
                        allLocalities={this.props.allLocalities}
                        isDetail={this.props.isDetail}
                    />
                }
                {this.props.mapType == "locality" && 
                    <MapLocalityController
                        events={this.props.events}
                        GetEventColor={this.props.GetEventColor}
                        localityInfo={this.props.localityInfo}
                        allLocalities={this.props.allLocalities}
                        OpenLocalityDetail={this.props.OpenLocalityDetail}
                        map={this.props.map}
                    />
                }
                <Legend />
                <EventList
                    events={this.props.events}
                    openEvent={this.props.openEvent}
                    GetEventColor={this.props.GetEventColor}
                />
            </div>
        );
    }
}
