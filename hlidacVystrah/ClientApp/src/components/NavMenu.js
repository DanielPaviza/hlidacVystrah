import React, { Component } from 'react';
import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './../styles/navMenu.scss';
import UserLoginHelper from './UserLoginHelper';

export class NavMenu extends Component {
  static displayName = NavMenu.name;

    constructor (props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true,
            userEmail: null
        };

        this.loginHelper = new UserLoginHelper();
    }

    componentDidMount() {
        this.loginHelper.TokenLogin().then(tokenLoginResponse => {
            this.setState((prevState) => ({
                ...prevState,
                userEmail: tokenLoginResponse.userEmail
            }));
        });
    }

    toggleNavbar () {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    CloseDetail = () => {

        let path = window.location.pathname;

        if (path == '/')
            return this.props.NavigateHome();

        if (path.split('/')[1] == 'obec')
            return this.props.NavigateHome();
    }

    RenderLoginNavLink = () => {

        if (this.props.HandleUserLoginExpired)
            return <NavLink tag={Link} className="text-dark" onClick={() => this.props.HandleUserLoginExpired(401, true)}>Odhlásit</NavLink>

        return <NavLink tag={Link} className="text-dark" to="/account">{this.state.userEmail ? this.state.userEmail : 'Přihlásit'}</NavLink>
    }

    render() {

        return (
            <header>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow" container light>
                    <NavbarBrand tag={Link} to="/" onClick={() => this.CloseDetail()} className='d-flex align-items-center p-0'>
                        <h1 className='m-0 me-2'>Hlídač výstrah</h1>
                        <img src='/images/logo.png' alt='Logo'/>
                    </NavbarBrand>
                    <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                    <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
                        <ul className="navbar-nav flex-grow">
                            <NavItem>
                                <NavLink tag={Link} className="text-dark" to="/" onClick={() => this.CloseDetail()}>Domů</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink tag={Link} className="text-dark" to="/historie">Historie</NavLink>
                            </NavItem>
                            <NavItem>
                                {this.RenderLoginNavLink()}
                            </NavItem>
                        </ul>
                    </Collapse>
                </Navbar>
            </header>
        );
    }
}
