import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { IconButton, Input, Button } from 'react-toolbox';

import { Accounts } from 'meteor/accounts-base'

// App component - represents the whole app
export default class Register extends Component {

    constructor(props) {
        super(props);

        this.state = {
            fullName: '',
            usernameOrEmail: '',
            password: '',
            loading: false
        }
    }

    onChange (val, e) {
        this.setState({[e.target.name]: val});
    }

    onSubmit(event){
        event.preventDefault();

        const {fullName, usernameOrEmail, password} = this.state;
        let selector;
        if (typeof usernameOrEmail === 'string')
            if (usernameOrEmail.indexOf('@') === -1)
                selector = {username: usernameOrEmail};
            else
                selector = {email: usernameOrEmail};

        const key = Object.keys(selector)[0];

        this.props.progressBarUpdate(true);

        Accounts.createUser({
            [key]: selector[key],
            password,
            profile: {fullName}
        }, (err) => {
            if(err){
                this.props.showSnackbar({
                    activeSnackbar: true,
                    barMessage: err.reason,
                    barIcon: 'error_outline',
                    barType: 'cancel'
                });
            }else{
                this.props.showSnackbar({
                    activeSnackbar: true,
                    barMessage: 'Successfully Registered',
                    barIcon: 'done',
                    barType: 'accept'
                });
                setTimeout(() => {
                    this.props.history.push('/app/dashboard');
                }, 1000);
            }
            this.props.progressBarUpdate(false);
        });
    }

    render() {
        return (
            <form onSubmit={this.onSubmit.bind(this)} className="register">
                <Input type='text' label='Full Name'
                       name='fullName'
                       maxLength={ 30 }
                       value={this.state.fullName}
                       onChange={this.onChange.bind(this)}
                       required
                    />
                <Input type='text' label='Username or Email'
                       name='usernameOrEmail'
                       maxLength={ 30 }
                       value={this.state.usernameOrEmail}
                       onChange={this.onChange.bind(this)}
                       required
                    />
                <Input type='password' label='Password'
                       name='password'
                       maxLength={ 20 }
                       value={this.state.password}
                       onChange={this.onChange.bind(this)}
                       required
                    />
                <Button type='submit' disabled={this.props.loading} icon='person_add' label='Register' raised primary />
            </form>
        );
    }
}