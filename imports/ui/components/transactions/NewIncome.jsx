import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import ReactDOM from 'react-dom';
import { Input, Button, ProgressBar, Snackbar, Dropdown, DatePicker, TimePicker } from 'react-toolbox';
import { Card} from 'react-toolbox/lib/card';

import { Meteor } from 'meteor/meteor';
import { Incomes } from '../../../api/incomes/incomes.js';
import { Accounts } from '../../../api/accounts/accounts.js';
import { Projects } from '../../../api/projects/projects.js';
import { accountHelpers } from '/imports/helpers/accountHelpers.js'
import {FormattedMessage, intlShape, injectIntl, defineMessages} from 'react-intl';
import theme from './theme';
import dropdownTheme from './dropdownTheme';


const il8n = defineMessages({
    ADD_INCOME_BUTTON: {
        id: 'TRANSACTIONS.ADD_INCOME_BUTTON'
    },
    UPDATE_INCOME_BUTTON: {
        id: 'TRANSACTIONS.UPDATE_INCOME_BUTTON'
    },
    REMOVE_INCOME_BUTTON: {
        id: 'TRANSACTIONS.REMOVE_INCOME_BUTTON'
    },
    CHANGE_BILL_BUTTON: {
        id: 'TRANSACTIONS.CHANGE_BILL_BUTTON'
    },
    SELECT_ACCOUNT: {
        id: 'TRANSACTIONS.SELECT_ACCOUNT'
    },
    AMOUNT: {
        id: 'TRANSACTIONS.AMOUNT'
    },
    SELECT_CATEGORY: {
        id: 'TRANSACTIONS.SELECT_CATEGORY'
    },
    CREATION_DATE: {
        id: 'TRANSACTIONS.CREATION_DATE'
    },
    CREATION_TIME: {
        id: 'TRANSACTIONS.CREATION_TIME'
    },
    DESCRIPTION: {
        id: 'TRANSACTIONS.DESCRIPTION'
    },
    INCOME_ACCOUNT: {
        id: 'TRANSACTIONS.INCOME_ACCOUNT'
    },
    INCOME_AMOUNT: {
        id: 'TRANSACTIONS.INCOME_AMOUNT'
    },
    RECEIVING_DATE: {
        id: 'TRANSACTIONS.RECEIVING_DATE'
    },
    RECEIVING_TIME: {
        id: 'TRANSACTIONS.RECEIVING_TIME'
    },
    SELECT_TYPE: {
        id: 'TRANSACTIONS.SELECT_TYPE'
    },
    SELECT_PROJECT: {
        id: 'TRANSACTIONS.SELECT_PROJECT'
    }
});



class NewIncome extends Component {

    constructor(props) {
        super(props);

        let datetime = new Date();

        this.state = {
            account: '',
            amount: '',
            receivedAt: datetime,
            receivedTime: datetime,
            type: 'project',
            project: '',
            active: false,
            loading: false
        };
    }

    setCurrentRoute(value){
        this.setState({
            isNewRoute: value
        })
    }

    resetIncome(){
        let datetime = new Date();
        this.setState({
            account: '',
            amount: '',
            receivedAt: datetime,
            receivedTime: datetime,
            type: 'project',
            project: ''
        })
    }


    onSubmit(event){
        event.preventDefault();
        this.state.isNewRoute ? this.createIncome() : this.updateIncome();
        this.setState({loading: true})
    }

    createIncome(){
        let {account, amount, receivedAt, receivedTime, type, project} = this.state;

        receivedAt = new Date(receivedAt);
        receivedTime = new Date(receivedTime);
        receivedAt.setHours(receivedTime.getHours(), receivedTime.getMinutes(), 0, 0);
        project = (project && type == "project" && {_id: project}) || {};

        Meteor.call('incomes.insert', {
            income: {
                account,
                amount: Number(amount),
                receivedAt,
                type,
                project
            }
        }, (err, response) => {
            if(response){
                this.setState({
                    active: true,
                    barMessage: 'Income created successfully',
                    barIcon: 'done',
                    barType: 'accept'
                });
                this.resetIncome();
                this.props.closePopup();
            }else{
                this.setState({
                    active: true,
                    barMessage: err.reason,
                    barIcon: 'error_outline',
                    barType: 'cancel'
                });
            }
            this.setState({loading: false})
        });
    }

    updateIncome(){
        let {_id, account, amount, receivedAt, receivedTime, type, project} = this.state;

        receivedAt = new Date(receivedAt);
        receivedTime = new Date(receivedTime);
        receivedAt.setHours(receivedTime.getHours(), receivedTime.getMinutes(), 0, 0);
        project = (project && type == "project" && {_id: project}) || {};

        Meteor.call('incomes.update', {
            income: {
                _id,
                account,
                amount: Number(amount),
                receivedAt,
                type,
                project
            }
        }, (err, response) => {
            if(err){
                this.setState({
                    active: true,
                    barMessage: err.reason,
                    barIcon: 'error_outline',
                    barType: 'cancel'
                });
            }else{
                this.setState({
                    active: true,
                    barMessage: 'Income updated successfully',
                    barIcon: 'done',
                    barType: 'accept'
                });
                this.props.closePopup();
            }
            this.setState({loading: false})
        });
    }

    removeIncome(){
        const {_id} = this.state;
        Meteor.call('incomes.remove', {
            income: {
                _id
            }
        }, (err, response) => {
            if(err){
                this.setState({
                    active: true,
                    barMessage: err.reason,
                    barIcon: 'error_outline',
                    barType: 'cancel'
                });
            }else{
                this.props.history.replace('/app/incomes/new');
                this.setState({
                    active: true,
                    barMessage: 'Income deleted successfully',
                    barIcon: 'done',
                    barType: 'accept'
                });
            }
        });
    }

    onChange (val, e) {
        this.setState({[e.target.name]: val});
        e.target.name == 'project' && this.setState({['projectName']: e.target.textContent});
    }

    handleBarClick (event, instance) {
        this.setState({ active: false });
    }

    handleBarTimeout (event, instance) {
        this.setState({ active: false });
    }

    progressBarToggle (){
        return this.props.loading || this.state.loading ? 'progress-bar' : 'progress-bar hide';
    }

    componentWillReceiveProps (p){
        p.income.receivedTime = p.income.receivedAt;
        p.income.type == "project" && ((p.income.projectName = p.income.project.name) && (p.income.project = p.income.project._id));
        this.setState(p.income);
        this.setCurrentRoute(p.isNewRoute);
        if(p.isNewRoute){
            this.resetIncome()
        }
    }

    renderButton (){
        const { formatMessage } = this.props.intl;
        let button;
        if(this.state.isNewRoute){
            button = <div className={theme.addIncomeBtn}>
                <Button type='submit' icon='add' label={formatMessage(il8n.ADD_INCOME_BUTTON)} raised primary />
            </div>
        }else{
            button = <div className={theme.addIncomeBtn}>
                {/*<Button type='submit' icon='mode_edit' label={formatMessage(il8n.UPDATE_INCOME_BUTTON)} raised primary />*/}
                {/*<Button*/}
                    {/*onClick={this.removeIncome.bind(this)}*/}
                    {/*type='button'*/}
                    {/*icon='delete'*/}
                    {/*label={formatMessage(il8n.REMOVE_INCOME_BUTTON)}*/}
                    {/*className='float-right'*/}
                    {/*accent />*/}
            </div>
        }
        return button;
    }

    accountItem (account) {

        let parentClass = '';

        if(account.removeRightBorder){
            parentClass = dropdownTheme['removeRightBorder']
        }

        if(account.removeBottomBorder){
            parentClass = dropdownTheme['removeBottomBorder']
        }

        return (
            <div className={parentClass}>
                <i className={account.bank}/>
            </div>
        );
    }

    accounts(){
        return this.props.accounts.map((account, index) => {
            account.value = account._id;

            index++;
            if(index % 5 == 0){
                account.removeRightBorder = true
            }
            let lastItems = this.props.accounts.length % 5 == 0 ? 5 : this.props.accounts.length % 5;
            if(index > this.props.accounts.length - lastItems){
                account.removeBottomBorder = true
            }

            return account;
        })
    }

    typeItem (type) {
        return (
            <strong>{type.title}</strong>
        );
    }

    projectItem (project) {
        return (
            <strong>{project.name}</strong>
        );
    }

    projects(){
        return this.props.projects.map((project) => {
            project.value = project._id;
            project.icon = 'http://www.clasesdeperiodismo.com/wp-content/uploads/2012/02/radiohead-in-rainbows.png';
            return project;
        })
    }

    types(){
        return [
            {
                title: 'Salary',
                value: 'salary'
            },
            {
                title: 'Project',
                value: 'project'
            }
        ]
    }

    render() {
        const { formatMessage } = this.props.intl;
        return (
            <div className={theme.incomeCard}>
                <Card theme={theme}>
                    <h3>add new income</h3>
                    <form onSubmit={this.onSubmit.bind(this)} className={theme.incomeForm}>
                        <ProgressBar type="linear" mode="indeterminate" multicolor className={this.progressBarToggle()} />

                        <Snackbar
                            action='Dismiss'
                            active={this.state.active}
                            icon={this.state.barIcon}
                            label={this.state.barMessage}
                            timeout={2000}
                            onClick={this.handleBarClick.bind(this)}
                            onTimeout={this.handleBarTimeout.bind(this)}
                            type={this.state.barType}
                        />

                        <Dropdown theme={dropdownTheme}
                                  className={theme.bankFonts}
                                  auto={false}
                                  source={this.accounts()}
                                  name='account'
                                  onChange={this.onChange.bind(this)}
                                  label={formatMessage(il8n.INCOME_ACCOUNT)}
                                  value={this.state.account}
                                  template={this.accountItem}
                                  required
                        />

                        <Input type='number' label={formatMessage(il8n.INCOME_AMOUNT)}
                               name='amount'
                               value={this.state.amount}
                               onChange={this.onChange.bind(this)}
                               required
                        />
                        <DatePicker
                            label={formatMessage(il8n.RECEIVING_DATE)}
                            name='receivedAt'
                            onChange={this.onChange.bind(this)}
                            value={this.state.receivedAt}
                        />
                        <TimePicker
                            label={formatMessage(il8n.RECEIVING_TIME)}
                            name='receivedTime'
                            onChange={this.onChange.bind(this)}
                            value={this.state.receivedTime}
                            format='ampm'
                        />
                        <Dropdown
                            source={this.types()}
                            name='type'
                            label={formatMessage(il8n.SELECT_TYPE)}
                            onChange={this.onChange.bind(this)}
                            value={this.state.type}
                            template={this.typeItem}
                            required
                        />
                        {this.state.type == 'project' &&
                        <Dropdown
                            source={this.projects()}
                            name='project'
                            onChange={this.onChange.bind(this)}
                            label={formatMessage(il8n.SELECT_PROJECT)}
                            value={this.state.project}
                            template={this.projectItem}
                            required/>
                        }
                        {this.renderButton()}
                    </form>
                </Card>
                <Button label='add now' raised primary />
            </div>
        );
    }
}

NewIncome.propTypes = {
    income: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    incomeExists: PropTypes.bool.isRequired,
    intl: intlShape.isRequired
};

NewIncome = createContainer((props) => {
    const { id } = props.params;
    const incomeHandle = Meteor.subscribe('incomes.single', id);
    const loading = !incomeHandle.ready();
    const income = Incomes.findOne(id);
    const incomeExists = !loading && !!income;
    Meteor.subscribe('accounts');
    Meteor.subscribe('projects.all');
    return {
        loading,
        incomeExists,
        income: incomeExists ? income : {},
        accounts: Accounts.find({}).fetch(),
        projects: Projects.find({}).fetch()
    };
}, NewIncome);

export default injectIntl(NewIncome);