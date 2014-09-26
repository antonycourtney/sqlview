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
                        <span className="query-source">{entry.source}:</span>
                        <SqlQuery query={entry.query} />
                        <p>
                        Rows Returned: {gridData.length}
                        </p>
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


/*
 * fetch and update query log
 */
function fetchHistory() {

    var currentLog = logViewer.state.queryLog;

    var historyId = currentLog.length;
    var historyUrl = "/getHistory/" + historyId;
    // console.log("fetching history from ", historyUrl);
    var hp = Q($.ajax({
        url: historyUrl,
        type: "GET"
    }));

    hp.then(function (data) {
        // console.log("Got additional history: ", data);
        if (data.history.length > 0) {
            var newLog = currentLog.concat(data.history);
            console.log("logViewer: ", logViewer );
            logViewer.setState({ queryLog: newLog } );
            console.log("Set state on log viewer...");
            window.scrollTo(0,document.body.scrollHeight);    
        }
    }).catch(function (e) {
        console.error("caught unhandled promise exception: ", e.stack, e);
    });
}

window.setInterval(fetchHistory,1000);