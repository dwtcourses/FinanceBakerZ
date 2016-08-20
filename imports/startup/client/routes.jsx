import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import AuthLayout from '../../ui/components/AuthLayout.jsx';
import AppLayout from '../../ui/components/AppLayout.jsx';

import DashboardPage from '../../ui/components/dashboard/Dashboard.jsx';

import Register from '../../ui/components/auth/Register.jsx';

import AccountsPage from '../../ui/components/accounts/Accounts.jsx';
import AccountsSideBar from '../../ui/components/accounts/AccountsSideBar.jsx';

import IncomesPage from '../../ui/components/incomes/Incomes.jsx';
import IncomesSideBar from '../../ui/components/incomes/IncomesSideBar.jsx';

import ExpensesPage from '../../ui/components/expenses/Expenses.jsx';
import ExpensesSideBar from '../../ui/components/expenses/ExpensesSideBar.jsx';

Meteor.startup( () => {
    render(
        <Router history={ browserHistory }>
            <Route path="app" component={AppLayout}>
                <IndexRoute components={{ content: DashboardPage}} />
                <Route path="dashboard" components={{ content: DashboardPage}} />
                <Route path="accounts" components={{ content: AccountsPage, sidebar: AccountsSideBar }}>
                    <Route path="new" />
                    <Route path=":id" />
                </Route>
                <Route path="incomes" components={{ content: IncomesPage, sidebar: IncomesSideBar }}>
                    <Route path="new" />
                    <Route path=":id" />
                </Route>
                <Route path="expenses" components={{ content: ExpensesPage, sidebar: ExpensesSideBar }}>
                    <Route path="new" />
                    <Route path=":id" />
                </Route>
            </Route>
            <Route path="/" component={AuthLayout}>
                <IndexRoute component={ Register} />
                <Route path="register" component={ Register} />
            </Route>
            </Router>,
        document.getElementById( 'render-root' )
    );
});