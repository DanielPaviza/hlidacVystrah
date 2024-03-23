import React, { Component } from 'react';
import '../styles/infoBox.scss';

export class InfoBox extends Component {
    static displayName = InfoBox.name;

    constructor(props) {
        super(props);

        this.state = {
            opened: false
        };
    }

    render() {

        return (
            <div
                className='infoBox position-relative d-flex align-items-center justify-content-center ms-2'
                onMouseOver={() => this.setState((prevState) => ({ ...prevState, opened: true }))}
                onMouseLeave={() => this.setState((prevState) => ({ ...prevState, opened: false }))}
            >
                <i className="fa-solid fa-circle-info"></i>
                {this.state.opened && 
                    <div className='infoContainer position-absolute d-flex flex-column align-items-end'>
                        <span className='rounded p-2'>{this.props.text}</span>    
                        <div className=''></div> 
                    </div>
                }
            </div>
        );
    }
}
