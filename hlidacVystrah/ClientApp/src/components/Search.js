import React, { Component } from 'react';
import '../styles/search.scss';
import { Prev } from '../../../../node_modules/react-bootstrap/esm/PageItem';
export class Search extends Component {
    static displayName = Search.name;

    constructor(props) {
        super(props);

        this.state = {
            listOpened: false,
            filteredLocalityList: this.props.localityList,
            searchText: ""
        };
    }

    FilterLocalityList = (val) => {

        this.setState((prevState) => ({
            ...prevState,
            searchText: val
        }));

        val = val.toLowerCase();
        let filteredNames = {};

        // filter region names
        Object.keys(this.props.localityList).forEach(key => {
            if (key.toLowerCase().includes(val)) {
                filteredNames[key] = []
            }                
        });

        // filter locality names
        Object.keys(this.props.localityList).forEach(key => {
            for (let i in this.props.localityList[key]) {
                let locality = this.props.localityList[key][i];
                if (locality.name.toLowerCase().includes(val)) {
                    if (!filteredNames.hasOwnProperty(key))
                        filteredNames[key] = [];
                    filteredNames[key].push(locality);
                }
            }
        });

        this.setState((prevState) => ({
            ...prevState,
            listOpened: true,
            filteredLocalityList: filteredNames
        }));
    }

    DeleteSearchText = () => {

        if (this.props.isAccount)
            this.props.HandleSelectArea(null, false);

        this.setState((prevState) => ({
            ...prevState,
            searchText: "",
            filteredLocalityList: this.props.localityList
        }));
    }

    HandleOpenLocality = (cisorp, text) => {

        if (this.props.isAccount) {
            this.props.HandleSelectArea(cisorp, false);
            this.setState((prevState) => ({
                ...prevState,
                searchText: text
            }));
        } else {
            this.props.OpenLocalityDetail(cisorp);
        }
    }

    HandleOpenRegion = (name) => {

        if (this.props.isAccount) {
            this.props.HandleSelectArea(name, true);
            this.setState((prevState) => ({
                ...prevState,
                searchText: name
            }));
        } else {
            this.props.OpenLocalityDetail(name, true);
        }
    }

    RenderLocalityList = () => {

        return (
            Object.keys(this.state.filteredLocalityList).map(key => (

                <div className='mt-2' key={key}>
                    <p className='fw-bold m-0 ps-2 region' onClick={() => this.HandleOpenRegion(key)}>{key}</p>
                    <div className='d-flex flex-wrap flex-column'>
                        {this.state.filteredLocalityList[key].map(locality => (
                            <div key={locality.cisorp} className='ps-3 pe-3 locality d-flex justify-content-between' onClick={() => this.HandleOpenLocality(locality.cisorp, locality.name)}>
                                <span>{locality.name}</span>
                                <span className='opacity-50'>{locality.cisorp}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))
        )
    }

    HandleInputBlur = () => {
        setTimeout(() => {
            this.setState((prevState) => ({
                ...prevState,
                listOpened: false
            }));
        }, 100);
    };

    HandleInputFocus = () => {
        this.setState((prevState) => ({
            ...prevState,
            listOpened: true
        }));
    };

    render() {

        return (
            <div id='search' className={`${this.props.isAccount ? '' : 'd-flex flex-column mb-3 col-12 col-lg-10 col-xl-8 mx-auto position-relative'}`}>
                <input
                    id='localitySearch'
                    type="text"
                    className={`${!this.props.isAccount && 'm-1'} ${this.state.listOpened && "opened"} ps-2 mw-100 w-100`}
                    onChange={(event) => this.FilterLocalityList(event.target.value)}
                    onFocus={() => this.HandleInputFocus()}
                    onBlur={() => this.HandleInputBlur()}
                    autoComplete="off"
                    placeholder="Vyhledejte lokalitu"
                    value={this.state.searchText}
                />
                {this.state.searchText.length > 0 &&
                    <div className='position-absolute top-0 end-0 pe-2 h-100 d-flex align-items-center' onClick={() => this.DeleteSearchText() }>
                        <i className="fa-solid fa-xmark"></i>
                    </div>
                }
                {this.state.listOpened &&
                    <div className='list w-100 border border-top-0'>
                        {Object.keys(this.state.filteredLocalityList).length < 1 ?
                            <div className='p-2'>Nebyla nalezena žádná lokalita</div>
                            :
                            this.RenderLocalityList()
                        }
                    </div>    
                }
            </div>
        );
    }
}
