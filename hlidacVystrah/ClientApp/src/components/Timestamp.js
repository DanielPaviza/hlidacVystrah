import React, { Component } from 'react';
import '../styles/timestamp.scss';

export class Timestamp extends Component {
    static displayName = Timestamp.name;

    constructor(props) {
        super(props);
        this.state = {
            opened: false
        };
    }

    HandleToggleOpen = (state = null) => {


        if (state == null) {
            this.setState((prevState) => ({
                ...prevState,
                opened: !this.state.opened
            }));
            return;
        }

        this.setState((prevState) => ({
            ...prevState,
            opened: state
        }));
    }

    render() {

        return (
            <div id='timestamp' className='d-flex justify-content-end align-items-center position-relative'>
                <i className="fa-solid fa-circle-info p-1 me-1" onClick={() => this.HandleToggleOpen()} onMouseEnter={() => this.HandleToggleOpen(true)} onMouseLeave={() => this.HandleToggleOpen(false)} />
                <div className='d-flex flex-column'>
                    <span className='border-bottom'>Poslední aktualizace</span>
                    <span className=''>{this.props.timestamp == null ? "Nikdy" : this.props.timestamp}</span>
                </div>
                {this.state.opened &&
                    <div className='infoBox position-absolute border p-1 rounded' >

                        {this.props.timestamp == null ?
                            "Data o meteorologické situaci nebyla načtena."
                            :
                            <>
                                Poslední změna meteorologické situace proběhla {this.props.timestamp.toLowerCase()} a data jsou stále aktuální.
                            </>
                        }      
                    </div>    
                }
            </div>
        );
    }
}
