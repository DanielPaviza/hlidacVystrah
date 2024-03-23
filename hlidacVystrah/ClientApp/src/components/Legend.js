import React, { Component } from 'react';
import '../styles/legend.scss';
export class Legend extends Component {
    static displayName = Legend.name;

    constructor(props) {
        super(props);
        this.state = {
            opened: false
        };
    }

    HandleToggleOpen = () => {
        this.setState((prevState) => ({
            ...prevState,
            opened: !this.state.opened
        }));
    }

    render() {

        return (
            <div id='legend' className='my-2'>
                <div
                    className={`fw-bold d-flex align-items-center justify-content-end legendaButton ms-auto p-2 ${this.state.opened ? "border" : ""}`}
                    onClick={() => this.HandleToggleOpen()}
                >
                    Legenda
                    <i className="fa-solid fa-circle-info ms-2"></i>
                </div>
                {
                    this.state.opened &&
                    <div className='legenda ms-auto' onClick={() => this.HandleToggleOpen()}>
                        <div className='ms-auto p-2 border'>
                            <span className='fw-bold'>Stupeň nebezpečí</span>
                                <div className={`d-flex mt-1 flex-wrap align-items-center justify-content-${this.props.isDetail ? 'start' : 'between'}`}>
                                <div className='d-flex align-items-center me-3 mb-1'>
                                    <div className='colorCircle red me-1'></div>
                                    <span>Extrémní</span>
                                </div>
                                <div className='d-flex align-items-center me-3 mb-1'>
                                    <div className='colorCircle orange me-1'></div>
                                    <span>Vysoký</span>
                                </div>
                                <div className='d-flex align-items-center me-3 mb-1'>
                                    <div className='colorCircle yellow me-1'></div>
                                    <span>Nízký</span>
                                </div>
                                <div className='d-flex align-items-center me-3 mb-1'>
                                    <div className='colorCircle green me-1'></div>
                                    <span>Výhledový</span>
                                </div>
                                <div className='d-flex align-items-center me-3 mb-1'>
                                    <div className='colorCircle gray me-1'></div>
                                    <span>Neznámý</span>
                                </div>
                                {!this.props.isDetail &&
                                    <div className='d-flex align-items-center me-3 mb-1'>
                                        <div className='colorCircle noEvent me-1'></div>
                                        <span>Žádný</span>
                                    </div>
                                }
                            </div> 
                        </div>
                    </div>
                }
            </div>
        );
    }
}
