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

console.log("Hello, world!");

var historyUrl = "/getHistory";

var gridOptions = {
    enableCellNavigation: true,
    enableColumnReorder: false
};        

var hp = Q($.ajax({
    url: historyUrl,
    type: "GET"
}));

hp.then(function (data) {
    console.log("Got history: ", data);
    if (data.history.length > 0 ) {
        var entry = data.history[0];
        var columnNames = entry.result.columnNames;
        var gridData = entry.result.data;        
        React.renderComponent(
            <div>
                <SqlQuery query={entry.query} />
                <DataGrid columnNames={columnNames} data={gridData} options={gridOptions} />
            </div>,
            document.getElementById("content")
        );
    }
}).catch(function (e) {
    console.error("caught unhandled promise exception: ", e.stack, e);
});
