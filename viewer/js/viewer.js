/** @jsx React.DOM */
/*
 * sqlview browser-based viewer
 */
'use strict';

var _ = require('lodash');
var Q = require('q');
var $ = require('jquery');
var React = require('react');
var SqlQuery = require('./components/sqlquery.js');
var DataGrid = require('./components/datagrid.js');

var gridOptions = {
    enableCellNavigation: true,
    enableColumnReorder: false
};        

var QueryLogViewer = React.createClass(
 {
    getInitialState: function() {
        return {
            queryLog: []
        };
    },
    
    render: function() {
        var rows = [];
        var queryLog = this.state.queryLog;
        for (var i = 0; i < queryLog.length; i++) {
            var entry = queryLog[i];
            var columnNames = entry.result.columnNames;
            var gridData = entry.result.data;        
            rows.push(
                <tr key={i} className="query-log-row">
                    <td className="history-index">{"[" + i + "]: "}</td>
                    <td className="query-log-entry">
                        <SqlQuery query={entry.query} />
                        <DataGrid columnNames={columnNames} data={gridData} options={gridOptions} />
                    </td>
                </tr>
            );
        }
        return (
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
            );
        return <div className="sql-query"><pre>{sql}</pre></div>;
    }
 });

var logViewer = React.renderComponent( 
    <QueryLogViewer />,
    document.getElementById("content")
);

var historyUrl = "/getHistory";
var hp = Q($.ajax({
    url: historyUrl,
    type: "GET"
}));

hp.then(function (data) {
    console.log("Got history: ", data);
    console.log("logViewer: ", logViewer );
    logViewer.setState({ queryLog: data.history } );
    console.log("Set state on log viewer...");    
}).catch(function (e) {
    console.error("caught unhandled promise exception: ", e.stack, e);
});


