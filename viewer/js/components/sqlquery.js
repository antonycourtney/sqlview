/** @jsx React.DOM */
'use strict';

/** @ignore */
var React = require("react");

/**
 * @class
 *
 * React component to format a SQL query
 */
 var SqlQuery = React.createClass(
 {
    /*
     * render the SQL query in a <pre> block
     */
    render: function() {
        var sql = this.props.query;

        return <div className="sql-query"><pre>{sql}</pre></div>;
    }
 });

 module.exports = SqlQuery;