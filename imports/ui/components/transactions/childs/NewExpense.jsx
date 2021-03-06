import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { _ } from 'underscore';
import { createContainer } from 'meteor/react-meteor-data';
import { routeHelpers } from '../../../../helpers/routeHelpers.js'

import { Input, Button, ProgressBar, Snackbar, Dropdown, DatePicker, TimePicker, FontIcon, IconButton } from 'react-toolbox';
import { Card} from 'react-toolbox/lib/card';

import { Meteor } from 'meteor/meteor';
import { Slingshot } from 'meteor/edgee:slingshot'

import { Transactions } from '../../../../api/transactions/transactions.js';
import { Accounts } from '../../../../api/accounts/accounts.js';
import { Categories } from '../../../../api/categories/categories.js';
import {FormattedMessage, intlShape, injectIntl, defineMessages} from 'react-intl';

import theme from '../theme';
import dropdownTheme from '../dropdownTheme';


const il8n = defineMessages({
    ADD_EXPENSE_BUTTON: {
        id: 'TRANSACTIONS.ADD_EXPENSE_BUTTON'
    },
    UPDATE_EXPENSE_BUTTON: {
        id: 'TRANSACTIONS.UPDATE_EXPENSE_BUTTON'
    },
    REMOVE_EXPENSE_BUTTON: {
        id: 'TRANSACTIONS.REMOVE_EXPENSE_BUTTON'
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
    ADD_NEW_EXPENSE: {
        id: 'TRANSACTIONS.ADD_NEW_EXPENSE'
    }
});



class NewExpense extends Component {

    constructor(props) {
        super(props);

        let datetime = new Date();

        this.state = {
            account: '',
            amount: '',
            description: '',
            spentAt: datetime,
            spentTime: datetime,
            category: '',
            categoryName: '',
            categoryIcon: '',
            accountBank: '',
            accountNumber: '',
            active: false,
            loading: false,
            billUrl: '',
            disableButton: false
        };
    }

    componentWillReceiveProps (p){
        p.expense.billUrl = p.expense.billUrl || '';
        p.expense.spentTime = p.expense.transactionAt;
        p.expense.spentAt = p.expense.transactionAt;
        if(p.expense.category){
            let { category } = p.expense;
            p.expense.category = category._id;
            p.expense.categoryName = category.name;
            p.expense.categoryIcon = category.icon;
        }
        if(p.expense.account){
            let { account } = p.expense;
            p.expense.account = account._id;
            p.expense.accountBank = account.bank;
            if(p.expense.accountNumber){
                account.number = p.expense.accountNumber
            }
        }
        this.setState(p.expense);
        let isNew = p.params.id === 'new';
        this.setCurrentRoute(isNew);
        isNew && this.resetExpense();
    }

    setCurrentRoute(value){
        this.setState({
            isNew: value
        })
    }

    resetExpense(){
        let datetime = new Date();
        this.setState({
            account: '',
            amount: '',
            description: '',
            spentAt: datetime,
            spentTime: datetime,
            category: ''
        })
    }


    onSubmit(event){
        event.preventDefault();
        this.setState({
            disableButton: true,
            loading: true
        });
        this.state.isNew ? this.createExpense() : this.updateExpense();
    }

    createExpense(){
        let {account, amount, description, spentAt, spentTime, category, billUrl} = this.state;
        let transactionAt = new Date(spentAt);
        let type = 'expense';
        spentTime = new Date(spentTime);
        transactionAt.setHours(spentTime.getHours(), spentTime.getMinutes(), 0, 0);
        //category processing
        if (!Object.keys(category).length) {
            this.setState({
                disableButton: false,
                active: true,
                barMessage: 'You must select the category'
            });
            return
        }
        category = category && {_id: category};
        let categoryExists = Categories.findOne({_id: category._id});
        if(categoryExists){
            category.name = categoryExists.name;
            category.icon = categoryExists.icon;
        }

        //account processing
        if (!Object.keys(account).length) {
            this.setState({
                disableButton: false,
                active: true,
                barMessage: 'You must select the account'
            });
            return
        }
        account = {_id: account};
        let accountExists = Accounts.findOne({_id: account._id});
        if(accountExists){
            account.bank = accountExists.bank;
            accountExists.number && (account.number = accountExists.number)
        }
        else{
            //fall back for old records in old transactions
            account.bank = this.state.accountBank;
            this.state.accountNumber && (account.number = this.state.accountNumber);
        }

        Meteor.call('transactions.insert', {
            transaction: {
                account,
                amount: Number(amount),
                transactionAt,
                type,
                description,
                billUrl,
                category
            }
        }, (err, response) => {
            if(response){
                routeHelpers.changeRoute('/app/transactions', 1200, {}, true);
                this.setState({
                    active: true,
                    barMessage: 'Expense created successfully',
                    barIcon: 'done',
                    barType: 'accept'
                });
            }else {
                this.setState({
                    disableButton: false,
                    active: true,
                    barMessage: err.reason,
                    barIcon: 'error_outline',
                    barType: 'cancel'
                });
            }
            this.setState({loading: false})
        });
    }

    updateExpense(){
        let {_id, account, amount ,spentAt ,spentTime ,description, billUrl, category} = this.state;
        let transactionAt = new Date(spentAt);
        let type = 'expense';
        spentTime = new Date(spentTime);
        transactionAt.setHours(spentTime.getHours(), spentTime.getMinutes(), 0, 0);
        //category processing
        if (!Object.keys(category).length) {
            this.setState({
                disableButton: false,
                active: true,
                barMessage: 'You must select the category'
            });
            return
        }
        category = category && {_id: category};
        let categoryExists = Categories.findOne({_id: category._id});
        if(categoryExists){
            category.name = categoryExists.name;
            category.icon = categoryExists.icon;
        }
        else{
            //fall back for old records in old transactions
            category.name = this.state.categoryName;
            category.icon = this.state.categoryIcon;
        }
        //account processing
        if (!Object.keys(account).length) {
            this.setState({
                disableButton: false,
                active: true,
                barMessage: 'You must select the account'
            });
            return
        }
        account = {_id: account};
        let accountExists = Accounts.findOne({_id: account._id});
        if(accountExists){
            account.bank = accountExists.bank;
            accountExists.number && (account.number = accountExists.number)
        }
        else{
            //fall back for old records in old transactions
            account.bank = this.state.accountBank;
            this.state.accountNumber && (account.number = this.state.accountNumber);
        }
        Meteor.call('transactions.update', {
            transaction: {
                _id,
                account,
                amount: Number(amount),
                transactionAt,
                type,
                description,
                billUrl,
                category
            }
        }, (err, response) => {
            if(err){
                this.setState({
                    disableButton: false,
                    active: true,
                    barMessage: err.reason,
                    barIcon: 'error_outline',
                    barType: 'cancel'
                });
            }else{
                routeHelpers.changeRoute('/app/transactions', 1200, {}, true);
                this.setState({
                    active: true,
                    barMessage: 'Expense updated successfully',
                    barIcon: 'done',
                    barType: 'accept'
                });
            }
            this.setState({loading: false})
        });
    }

    removeExpense(){
        const {_id} = this.state;
        Meteor.call('transactions.remove', {
            transaction: {
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
                routeHelpers.changeRoute('/app/transactions', 1200, {}, true);
                this.setState({
                    active: true,
                    barMessage: 'Expense deleted successfully',
                    barIcon: 'done',
                    barType: 'accept'
                });
            }
        });
    }

    onChange (val, e) {
        this.setState({[e.target.name]: val});
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

    renderButton (){
        const { formatMessage } = this.props.intl;
        let button;
        if(this.state.isNew){
            button = <div className={theme.addExpensesBtn}>
                <Button type='submit' disabled={this.state.disableButton} icon='add' label={formatMessage(il8n.ADD_EXPENSE_BUTTON)} raised primary />
            </div>
        }else{
            button = <div className={theme.addExpensesBtn}>
                <Button type='submit' disabled={this.state.disableButton} icon='mode_edit' label={formatMessage(il8n.UPDATE_EXPENSE_BUTTON)} raised primary />
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
        const { accounts } = this.props;
        const { account, accountBank, accountNumber } = this.state;
        //
        //if any account deleted then just add value to prevent empty values on updating record
        let index = _.findIndex(accounts, {_id: account});
        if(index === -1){
            accounts.push({
                _id: account,
                bank: accountBank,
                number: accountNumber
            })
        }
        return accounts.map((account, index) => {
            account.value = account._id;

            index++;
            if(index % 5 === 0){
                account.removeRightBorder = true
            }
            let lastItems = this.props.accounts.length % 5 === 0 ? 5 : this.props.accounts.length % 5;
            if(index > this.props.accounts.length - lastItems){
                account.removeBottomBorder = true
            }

            return account;
        })
    }

    categoryItem(category){
        const containerStyle = {
            display: 'flex',
            flexDirection: 'row'
        };

        return (
            <div style={containerStyle}>
                <div className={theme.iconsBox}>
                    <i className={category.icon}/>
                    <strong>{category.name}</strong>
                </div>
            </div>
        );
    }

    categories(){
        const { categories } = this.props;
        const { category, categoryName, categoryIcon, isNew } = this.state;

        if(!isNew){
            //if any category deleted then just add value to prevent empty values on updating record
            let index = _.findIndex(categories, {_id: category});
            if(index === -1){
                categories.push({
                    _id: category,
                    name: categoryName,
                    icon: categoryIcon
                })
            }
        }

        return categories.map((category) => {
            category.value = category._id;
            return category;
        })
    }

    componentWillMount(){
        //we create this rule both on client and server
        Slingshot.fileRestrictions('imageUploader', {
            allowedFileTypes: ['image/png', 'image/jpeg', 'image/gif'],
            maxSize: 4 * 1024 * 1024 // 4 MB (use null for unlimited).
        });
    }

    resetBillUpload(){
        this.setState({
            data_uri: '',
            billUrl: ''
        });
    }

    uploadBill(value, e){
        let userId = Meteor.user()._id;
        if(e.target.files.length){

            this.setState({
                disableButton: true,
                loading: true
            });

            const reader = new FileReader();
            const file = e.target.files[0];
            reader.onload = (upload) => {
                console.log(upload);
                this.setState({
                    data_uri: upload.target.result
                });
            };
            reader.readAsDataURL(file);

            let metaContext = {
                folder: "bills",
                uploaderId: userId
            };

            let uploader = new Slingshot.Upload('imageUploader', metaContext);
            uploader.send(e.target.files[0],  (error, downloadUrl) => { // you can use refs if you like
                if (error) {
                    // Log service detailed response
                    console.error('Error uploading', uploader.xhr.response);
                    alert (error); // you may want to fancy this up when you're ready instead of a popup.
                }
                else {
                    // we use $set because the user can change their avatar so it overwrites the url :)
                    //Meteor.users.update(Meteor.userId(), {$set: {"profile.avatar": downloadUrl}});
                    console.log(downloadUrl);
                    this.setState({billUrl: downloadUrl});
                }
                this.setState({
                    disableButton: false,
                    loading: false
                });
            });
        }
    }

    render() {
        let uploadedBill, billUpload;
        const { formatMessage } = this.props.intl;
        //Show bill if added
        if(this.state.billUrl || this.state.data_uri){
            uploadedBill = <div className='bill-group'>
                <Button
                    className='bill-change-button'
                    label={formatMessage(il8n.CHANGE_BILL_BUTTON)}
                    type='button'
                    onClick={this.resetBillUpload.bind(this)}
                />
                <img className='expenses-bill' src={this.state.billUrl || this.state.data_uri} />
            </div>
        }else{
            //Enable upload bill option
            billUpload = <Input
                type='file'
                id='input'
                onChange={this.uploadBill.bind(this)} />
        }
        return (
            <div className={theme.incomeCard}>
                <Card theme={theme}>
                    <h3>{formatMessage(il8n.ADD_NEW_EXPENSE)}</h3>
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

                        <Dropdown theme={dropdownTheme} className={theme.accountsDropdown}
                                  auto={false}
                                  source={this.accounts()}
                                  name='account'
                                  onChange={this.onChange.bind(this)}
                                  label={formatMessage(il8n.SELECT_ACCOUNT)}
                                  value={this.state.account}
                                  template={this.accountItem}
                                  required
                        />

                        <Input type='number' label={formatMessage(il8n.AMOUNT)}
                               name='amount'
                               value={this.state.amount}
                               onChange={this.onChange.bind(this)}
                               required
                        />
                        <Dropdown
                            auto={false}
                            source={this.categories()}
                            name='category'
                            onChange={this.onChange.bind(this)}
                            label={formatMessage(il8n.SELECT_CATEGORY)}
                            value={this.state.category}
                            template={this.categoryItem}
                            required
                        />
                        <Input type='text' label={formatMessage(il8n.DESCRIPTION)} className={theme.boxShadowNone}
                               name='description'
                               multiline
                               value={this.state.description}
                               onChange={this.onChange.bind(this)}
                               required
                        />
                        <DatePicker
                            label= {formatMessage(il8n.CREATION_DATE)}
                            name='spentAt'
                            onChange={this.onChange.bind(this)}
                            value={this.state.spentAt}
                        />
                        <TimePicker
                            label={formatMessage(il8n.CREATION_TIME)}
                            name='spentTime'
                            onChange={this.onChange.bind(this)}
                            value={this.state.spentTime}
                            format='ampm'
                        />

                        {billUpload}
                        {uploadedBill}

                        {this.renderButton()}
                    </form>
                </Card>
            </div>
        );
    }
}

NewExpense.propTypes = {
    expense: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    expenseExists: PropTypes.bool.isRequired,
    intl: intlShape.isRequired
};

NewExpense = createContainer((props) => {
    const { id } = props.params;
    const expenseHandle = Meteor.subscribe('transactions.single', id);
    const loading = !expenseHandle.ready();
    const expense = Transactions.findOne(id);
    const expenseExists = !loading && !!expense;
    Meteor.subscribe('accounts');
    Meteor.subscribe('categories');

    return {
        loading,
        expenseExists,
        expense: expenseExists ? expense : {},
        accounts: Accounts.find({}).fetch(),
        categories: Categories.find({}).fetch()
    };
}, NewExpense);

export default injectIntl(NewExpense);
