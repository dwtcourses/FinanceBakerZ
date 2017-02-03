import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import moment from 'moment';

import { List, ListItem, Button, IconButton, ListSubHeader, Dropdown, Card, Checkbox, Dialog } from 'react-toolbox';
import { Link } from 'react-router'

import { Meteor } from 'meteor/meteor';
import { Categories } from '../../../api/categories/categories.js';

import theme from './theme';
import cardTheme from './cardTheme';
import checkboxTheme from './checkboxTheme';
import buttonTheme from './buttonTheme';
import dialogTheme from './dialogTheme';

class SettingsPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            userCurrency: Meteor.user().profile.currency ? Meteor.user().profile.currency.symbol : '',
            currencies: [],
            check1: true,
            check2: false
        }

    }
    handleChange (field, value) {
        this.setState({[field]: value});
    }

    componentWillMount() {
        Meteor.call("get.currencies",{}, (error, currencies) => {
            if(error) {
                // handle error
            } else {
                this.setState({ currencies });
            }
        });
    }

    onChange (val, e) {
        this.setState({[e.target.name]: val});
        e.target.name == 'userCurrency' && this.setCurrency(val)
    }


    userRemove () {
        if(!Meteor.userId()) return;
        var user = {account: {owner: Meteor.userId()}};
        Meteor.call('userRemove', user, (err, res) => {
            if(err) {

            }
             else {
                this.props.history.push('/login');
            }
        });

    }



    setCurrency(currency){
        currency = _.findWhere(this.state.currencies, {symbol: currency});
        delete currency.value;
        Meteor.call('setUserCurrency' , {currency} , (err, res) => {
            if(res){
                this.setState({
                    userCurrency : Meteor.user().profile.currency ? Meteor.user().profile.currency.symbol : ''
                })
            }
        });
    }

    currencies(){
        return this.state.currencies.map((currency) => {
            currency.value = currency.symbol;
            return currency;
        })
    }

    currencyItem (currency) {
        const containerStyle = {
            display: 'flex',
            flexDirection: 'row'
        };

        const imageStyle = {
            width: '40px',
            height: '32px',
            textAlign: 'center',
            paddingTop: '8px',
            flexGrow: 0,
            marginRight: '8px',
            backgroundColor: '#ccc'
        };

        const contentStyle = {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 2
        };

        return (
            <div style={containerStyle}>
                <span style={imageStyle}>{currency.symbol}</span>
                <div style={contentStyle}>
                    <strong>{currency.name}</strong>
                </div>
            </div>
        );
    }
    renderCategory(){
        return (
            <section>
                <Dropdown
                    auto={false}
                    source={this.currencies()}
                    name='userCurrency'
                    onChange={this.onChange.bind(this)}
                    label='Select your currency'
                    value={this.state.userCurrency}
                    template={this.currencyItem}
                    required
                    />
            </section>
        )
    }


    popupTemplate(){
        return(
            <Dialog theme={dialogTheme}
                active={this.state.openDialog}
                onEscKeyDown={this.closePopup.bind(this)}
                onOverlayClick={this.closePopup.bind(this)}
                >
                {this.switchPopupTemplate()}
            </Dialog>
        )
    }
    switchPopupTemplate(){
        switch (this.state.action){
            case 'remove':
                return this.renderConfirmationMessage();
                break;
            case 'personalInformation':
                return <div><h3 className={theme.titleSetting}>edit Personal Information</h3> Hello</div>;
                break;
            case 'accountSetting':
                return <div><h3 className={theme.titleSetting}>edit Account Settings</h3> Testing</div>;
                break;
        }
    }
    openPopup (action, account) {
        this.setState({
            openDialog: true,
            action,
            selectedAccount: account || null
        });
    }
    closePopup () {
        this.setState({
            openDialog: false
        });
    }
    renderConfirmationMessage(){
        return (
            <div className={theme.dialogSetting}>
                <div className={theme.confirmText}>
                    <h3>remove account</h3>
                    <p>This will remove your all data</p>
                    <p>Are you sure to remove your account?</p>
                </div>

                <div className={theme.buttonBox}>
                    <Button label='GO BACK' raised primary onClick={this.closePopup.bind(this)} />
                    <Button label='YES, REMOVE' raised onClick={this.userRemove.bind(this)} theme={buttonTheme}/>
                </div>
            </div>
        )
    }


    render() {
        return (
            <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
                <div style={{ flex: 1, padding: '1.8rem', overflowY: 'auto' }}>
                    <div className={theme.settingContent}>
                        <div className={theme.settingTitle}>
                            <h3>Settings</h3>
                        </div>
                        <Card theme={cardTheme}>
                            <div className={theme.cardTitle}>
                                <h5>personal information</h5>
                            </div>
                            <div className={theme.cardContent}>
                                <h6>name: <span>shahid afridi</span></h6>
                                <h6>contact number: <span>+92-300-32198765</span></h6>
                                <h6>email: <span>shahidafridi@hotmail.com</span></h6>
                                <h6>address: <span>house no.10, block j, karachi, pakistan</span></h6>
                                <div className={theme.settingBtn}>
                                    <Button label='EDIT INFO' raised accent onClick={this.openPopup.bind(this, 'personalInformation')} />
                                </div>
                            </div>
                        </Card>
                        <Card theme={cardTheme}>
                            <div className={theme.cardTitle}>
                                <h5>account settings</h5>
                            </div>
                            <div className={theme.cardContent}>
                                <h6>currency: <span>pakistani rupee (PKR)</span></h6>
                                <h6>language: <span>english</span></h6>
                                <h6>password: <span>**********</span></h6>
                                <h6>
                                    email notification:
                                    <span>
                                        <Checkbox theme={checkboxTheme}
                                            checked={this.state.check1}
                                            label="On"
                                            onChange={this.handleChange.bind(this, 'check1')}
                                            />
                                         <Checkbox theme={checkboxTheme}
                                             checked={this.state.check2}
                                             label="Off"
                                             onChange={this.handleChange.bind(this, 'check2')}
                                             />
                                    </span>
                                </h6>
                                <div className={theme.settingBtn}>
                                    <Button label='EDIT INFO' raised accent onClick={this.openPopup.bind(this, 'accountSetting')} />
                                </div>
                            </div>
                        </Card>
                        <div className={theme.buttonSite}>
                            <Button
                                label='REMOVE ACCOUNT'
                                onClick={this.openPopup.bind(this, 'remove')}
                                icon=''
                                raised
                                theme={buttonTheme} />
                        </div>
                    </div>
                    <List ripple className='list'>
                        {this.renderCategory()}
                        {this.popupTemplate()}
                    </List>
                </div>
            </div>
        );
    }
}

SettingsPage.propTypes = {
    categories: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('categories');

    return {
        categories: Categories.find({}).fetch()
    };
}, SettingsPage);