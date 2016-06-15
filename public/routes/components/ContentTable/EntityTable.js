import React, {PropTypes} from "react";
import {Link} from "react-router";
import FormEntities from "../../EntityForm/FormEntities";

export default class EntityTable extends React.Component {
    filterTableValues(val) {
        const filter = {
            _id: false,
            __v: true
        };

        return filter[val];
    }


    getTableHeader() {
        const entityObject = FormEntities.getEntityObject(this.props.apipath);
        return (
            <thead>
            <tr>
                <th/>
                {Object.keys(entityObject).map(key =>
                    <th key={entityObject[key].value}>{entityObject[key].value}</th>)}
            </tr>
            </thead>
        );
    }

    getTableRow(entity) {
        return (
            <tr key={entity._id}>
                {Object.keys(entity).map(key => this.getTableContent(key, entity[key], entity))}
            </tr>
        );
    }

    getTableContent(key, value) {
        if (key === '_id') {
            return (
                <td key={value}>
                    <Link to={this.props.apipath + '/' + value}>{value}</Link>
                </td>
            );
        }

        if (!this.filterTableValues(key)) {
            return <td key={key + "_" + value}>{value}</td>;
        }
    }

    // TODO make date formatting less hackish -- look at input type?
    formatDate(timestamp) {
        if (!timestamp) {
            return;
        }

        const stamp = timestamp.split("T")[0];
        const split = stamp.split("-");
        return `${split[2]}.${split[1]}.${split[0]}`;
    }

    formatEntities(entities) {
        const entityObject = FormEntities.getEntityObject(this.props.apipath);
        const result = [];

        entities.map((entity, index) => {
            result[index] = {_id: entity._id};

            Object.keys(entityObject).map(key => {
                if (entityObject[key].type === "date") {
                    result[index][key] = this.formatDate(entity[key]);
                } else if (entityObject[key].identifiers) {
                    result[index][key] = "";
                    entityObject[key].identifiers.map(identifier => {
                        if (entity[key]) {
                            result[index][key] += entity[key][identifier] + " ";
                        }
                    });
                } else {
                    result[index][key] = entity[key];
                }
            });
        });

        return result;
    }


    getTableContents() {
        const formattedEntities = this.formatEntities(this.props.entities);
        return <tbody>{formattedEntities.map(entity => this.getTableRow(entity))}</tbody>;
    }

    render() {
        return (
            <div className="carEvaluationInfoContain">
                <div className="containerHeading">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xs-6">
                                {this.props.title}
                            </div>
                            <div className="col-xs-6 text-right">
                                <Link className="btn btn-primary" to={this.props.apipath + '/new'}>Opprett ny</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="carEvaluationInfo">
                    <table className="table">
                        {this.getTableHeader()}
                        {this.getTableContents()}
                    </table>
                </div>
            </div>
        );
    }
}

EntityTable.propTypes = {
    entities: PropTypes.array.isRequired
};

