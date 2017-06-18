import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Dropdown } from 'react-toolbox';
import {intlShape, injectIntl, defineMessages} from 'react-intl';

const il8n = defineMessages({
    FILTER_BY_TYPE: {
        id: 'TRANSACTIONS.FILTER_BY_TYPE'
    },
    FILTER_BY_BOTH: {
        id: 'TRANSACTIONS.FILTER_BY_BOTH'
    },
    FILTER_BY_INCOMES: {
        id: 'TRANSACTIONS.FILTER_BY_INCOMES'
    },
    FILTER_BY_EXPENSES: {
        id: 'TRANSACTIONS.FILTER_BY_EXPENSES'
    }
});

class TransactionsType extends Component {

    constructor(props) {
        super(props);
    }
    types(){
        const { formatMessage } = this.props.intl;
        return [{
                name: formatMessage(il8n.FILTER_BY_BOTH),
                value: ''
            }, {
                name: formatMessage(il8n.FILTER_BY_INCOMES),
                value: 'incomes'
            }, {
                name: formatMessage(il8n.FILTER_BY_EXPENSES),
                value: 'expenses'
            }
        ];
    }
    selectType (type) {
        updateFilter('reports', 'type', type)
    }
    typeItem (type) {
        return (
            <div>
                <strong>{type.name}</strong>
            </div>
        );
    }
    render() {
        const { formatMessage } = this.props.intl;
        return (
            <Dropdown
                auto={false}
                source={this.types()}
                onChange={this.selectType.bind(this)}
                label={formatMessage(il8n.FILTER_BY_TYPE)}
                value={this.props.local.type}
                template={this.typeItem}
            />
        );
    }
}

export default injectIntl(createContainer(() => {
    return {
        local: LocalCollection.findOne({
            name: 'reports'
        })
    };
}, TransactionsType));