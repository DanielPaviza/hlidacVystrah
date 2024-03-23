import React, { Component } from 'react';
import './../styles/loading.scss';
import { Spinner } from './Spinner';

export class Loading extends Component {
    static displayName = Loading.name;

    constructor (props) {
        super(props);
    }

  render() {
    return (
        <div id='loading' className='d-flex justify-content-center align-items-center'>
            <div className='d-flex flex-column justify-content-center align-items-center'>
                <h2>Hlídač výstrah</h2>
                <img src='/images/logo.png' className='mb-5' alt='Logo' />
                <Spinner />
            </div>
        </div>
    );
  }
}
