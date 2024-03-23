import React, { Component } from 'react';
import '../styles/spinner.scss';
export class Spinner extends Component {
    static displayName = Spinner.name;

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div id="spinner">
                <div className='base '>
                    <div className='spinner '></div>
                </div>
            </div>
        );
    }
}
