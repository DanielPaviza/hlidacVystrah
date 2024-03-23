import React, { Component } from 'react';
import '../styles/backButton.scss';

export class BackButton extends Component {
    static displayName = BackButton.name;

    constructor(props) {
        super(props);

        let lastRecord = this.props.history.RecordGetLast();

        this.state = {
            isHome: lastRecord.type == "home"
        }
    }

    componentDidUpdate() {

        let lastRecord = this.props.history.RecordGetLast();
        let isHome = (lastRecord.type == "home");

        // Only update the state if necessary
        if (isHome !== this.state.isHome) {
            this.setState({
                isHome: isHome
            });
        }
    }

    render() {

        return (
            this.props.history.history.length < 1 ?
                <span></span>
                :
                <div className='backButtons d-flex'>
                    <span className='d-flex align-items-center' onClick={() => this.props.history.NavigateBack()}>
                        <i className="fa-solid fa-arrow-left me-2"></i>
                        Zpět
                    </span>
                    {!this.state.isHome &&
                        <>
                            <div className='verticalLine ms-3 me-3'></div>
                            <span className='borderLeft' onClick={() => this.props.NavigateHome()}>
                                <i className="fa-solid fa-house me-2"></i>
                                Domů
                            </span>
                        </>
                    }
                </div>
        );
    }
}
