import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import moment from 'moment';

import { List, ListItem, ListDivider, Button, IconButton, ListSubHeader } from 'react-toolbox';
import { Link } from 'react-router'

import { ReactiveVar } from 'meteor/reactive-var'
import { Meteor } from 'meteor/meteor';
import { Expenses } from '../../../api/expences/expenses.js';

const RECORDS_PER_PAGE = 8;
let pageNumber = new ReactiveVar(1);


class ExpensesPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
        };

    }

    toggleSidebar(event){
        this.props.toggleSidebar(true);
    }

    handleScroll(event) {
        let infiniteState = event.nativeEvent;
        if((infiniteState.srcElement.scrollTop + infiniteState.srcElement.offsetHeight) > (infiniteState.srcElement.scrollHeight -1)){
          pageNumber.set(pageNumber.get() + 1)
        }
    }

    renderExpense(){
        const { expenses } = this.props;
    
        let groupedExpenses = _.groupBy(expenses, (result) => moment(result['spentAt'], 'DD/MM/YYYY').format("YYYY-MM-DD"));

        return _.map(groupedExpenses, (expenses, date) => {

            let items = expenses.map((expense) => {
                return <Link
                    key={expense._id}
                    activeClassName='active'
                    to={`/app/expenses/${expense._id}`}>

                    <ListItem
                        selectable
                        onClick={ this.toggleSidebar.bind(this) }
                        leftIcon='content_cut'
                        rightIcon='mode_edit'
                        caption={`PKR : ${expense.amount}`}
                        legend={`PURPOSE : ${expense.purpose} - DESCRIPTION: ${expense.description}`}
                    />
                </Link>
            });

            return (
                <section>
                    <ListSubHeader caption={moment(date).format('ll')} />
                    {items}
                </section>
            )
        });
    }

    render() {
        return (
            <div style={{ flex: 1, display: 'flex', position: 'relative' }} >
                <Link
                    to={`/app/expenses/new`}>
                    <Button onClick={ this.toggleSidebar.bind(this) } icon='add' floating accent className='add-button' />
                </Link>
                <div style={{ flex: 1, padding: '1.8rem', overflowY: 'auto' }} onScroll={this.handleScroll} >
                    <List ripple>
                        {this.renderExpense()}
                    </List>
                </div>
            </div>
        );
    }
}

ExpensesPage.propTypes = {
    expenses: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('expenses', RECORDS_PER_PAGE * pageNumber.get());

    return {
        expenses: Expenses.find({}).fetch()
    };
}, ExpensesPage);