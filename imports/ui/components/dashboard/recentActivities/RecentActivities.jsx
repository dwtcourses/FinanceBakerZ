import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { Card, Table, Button } from 'react-toolbox';
import { Link } from 'react-router'

import { Meteor } from 'meteor/meteor';
import { Incomes } from '/imports/api/incomes/incomes.js';
import { Expenses } from '/imports/api/expences/expenses.js';

import { currencyFormatHelpers, userCurrencyHelpers } from '/imports/helpers/currencyHelpers.js'

import Loader from '/imports/ui/components/loader/Loader.jsx';
import Arrow from '/imports/ui/components/arrow/Arrow.jsx';
import localeData from '../../../../../data.json'

import theme from './theme';
import tableTheme from './tableTheme';
import tableRightTheme from './tableRightTheme';

class RecentActivities extends Component {

    constructor(props) {
        super(props);

        this.state = {
        };
    }

    renderRecents(userLanguage){
        return (
            <div className='dashboard-card-group'>
                <div className={theme.recentIncomeWrapper}>
                    {this.renderRecentIncomes(userLanguage)}
                </div>

                <div className={theme.recentExpensesWrapper}>
                    {this.renderRecentExpenses(userLanguage)}
                </div>
            </div>
        )
    }
    getIncomesOrAdd(){
        const model = {
            icon: {type: String},
            type: {type: String},
            amount: {type: String},
            iconLast: {type: String}
        };
        let incomes = this.props.incomes.map(function(i){
            return {
                icon: <Arrow primary width='16px' height='16px' />,
                type: i.type == "project" ? i.project.name || i.project : i.type,
                amount: (<span>
        <i className={userCurrencyHelpers.loggedUserCurrency()}></i>{currencyFormatHelpers.currencyStandardFormat(i.amount)}</span>),
                iconLast: <Arrow primary width='16px' height='16px' />
            }
        });
        const table = <Table selectable={false} heading={false} model={model} source={incomes} theme={tableTheme}/>
        const add =
            <div className={theme.errorShowIncomes}>
                <Link to={ `/app/transactions/incomes/new`}>
                <Button type='button' icon='add' raised primary  />
                <p>add something to show</p> </Link>
            </div>;
        return this.props.incomesExists ? table : add
    }

    renderRecentIncomes(userLanguage){
        return (
            <div>
                <Card className='card' theme={theme}>
                    <h3>{localeData[userLanguage].recentIncomes}</h3>
                    {this.props.incomesLoading ? <Loader primary /> : this.getIncomesOrAdd()}
                </Card>
                <div className={theme.tableLink}>
                    <Link to={`/app/transactions/incomes`}> View All </Link>
                </div>
            </div>
        )
    }
    getExpensesOrAdd(){
        const model = {
            icon: {type: String},
            category: {type: String},
            amount: {type: String},
            iconLeft: {type: String}
        };
        const expenses = this.props.expenses.map(function(i){
            return {
                icon:  <i className={i.category.icon || ''}/> ,
                category: i.category.name || i.category,
                amount:(<span>
        <i className={userCurrencyHelpers.loggedUserCurrency()}></i>  {currencyFormatHelpers.currencyStandardFormat(i.amount)}</span>),
                iconLeft: <Arrow down danger width='16px' height='16px' />
            }
        });
        const table = <Table selectable={false} heading={false} model={model} source={expenses} theme={tableRightTheme}/>
        const add =
            <div className={theme.errorShowExpenses}>
                <Link to={`/app/transactions/expenses/new`}>
                <Button type='button' icon='add' raised accent />
                <p>add something to show</p> </Link>
            </div>;
        return this.props.expensesExists ? table : add
    }
    renderRecentExpenses(userLanguage){
        return (
            <div>
                <Card className='card' theme={theme}>
                    <h3>{localeData[userLanguage].recentExpenses}</h3>
                    {this.props.expensesLoading ? <Loader accent /> : this.getExpensesOrAdd()}
                </Card>
                <div className={theme.tableLink}>
                    <Link to={`/app/transactions/expenses`}> View All </Link>
                </div>
            </div>
        )
    }
    render() {
        const userLanguage = Meteor.user().profile.language;
        return this.renderRecents(userLanguage);
    }
}

RecentActivities.propTypes = {
    incomes: PropTypes.array.isRequired,
    expenses: PropTypes.array.isRequired
};

export default createContainer(() => {
    const incomesHandle = Meteor.subscribe('incomes', 5);
    const incomesLoading = !incomesHandle.ready();
    const incomes = Incomes.find({}, {fields: {amount: 1, type: 1, project: 1}}).fetch();
    const incomesExists = !incomesLoading && !!incomes.length;


    const expensesHandle = Meteor.subscribe('expenses', 5);
    const expensesLoading = !expensesHandle.ready();
    const expenses = Expenses.find({}, {fields: {amount: 1, 'category': 1}}).fetch();
    const expensesExists = !expensesLoading && !!expenses.length;

    return {
        incomesLoading,
        incomes,
        incomesExists,

        expensesLoading,
        expenses,
        expensesExists
    };
}, RecentActivities);