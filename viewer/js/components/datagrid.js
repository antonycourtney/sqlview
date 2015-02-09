/** @jsx React.DOM */
'use strict';

/** @ignore */
var React = require("react");
var $ = require('jquery');
window.jQuery = $;
var SlickGrid = require("slickgrid/grid");


// HACK!  TODO: use real font metrics to measure this!
function textCellWidth(s) {
  return 8 + ( 8 * s.length );  // TODO: measure!
}


// scan table data to make best effort at initial column widths
function getInitialColWidths( colNames, data ) {
  // let's approximate the column width:
  var MINCOLWIDTH = 80;
  var MAXCOLWIDTH = 300;
  var colWidths = colNames.map(textCellWidth);
  console.log("initial colWidths: ", colWidths);
  var nRows = data.length;
  for ( var i = 0; i < nRows; i++ ) {
    var row = data[i];
    for ( var j = 0; j < row.length; j++ ) {
      var cellVal = row[ j ];
      var cellWidth = MINCOLWIDTH;
      if( cellVal ) {
        cellWidth = textCellWidth(cellVal.toString());
      }
      colWidths[ j ] = Math.min( MAXCOLWIDTH,
          Math.max( colWidths[ j ] || MINCOLWIDTH, cellWidth ) );
    }
  }
  console.log("final colWidths: ", colWidths );
  return colWidths;
}

/**
 * construct a column list in SlickGrid format from column names
 */
function mkGridColumns(columnNames,columnWidths) {
    var gridWidth = 0;
    var GRIDWIDTHPAD = 16;    
    var gridCols = [];
    for (var i = 0; i < columnNames.length; i++) {
        var colWidth = columnWidths[i];
        if( i==columnNames.length - 1 ) {
          // pad out last column to allow for dynamic scrollbar
          colWidth += GRIDWIDTHPAD;
        }
        var col = { id: i, name: columnNames[i], field: i, width: colWidth };
        gridCols.push(col);
        gridWidth += colWidth;
    }

  console.log("total gridWidth: ", gridWidth);
  var columnInfo = { gridCols: gridCols, contentColWidths: columnWidths, gridWidth: gridWidth };

  return columnInfo;
}

/**
 * @class
 *
 * React component to render a query result in a SlickGrid
 */
 var DataGrid = React.createClass({
    render: function() {
        return <div className="gridHolder">Grid!</div>;
    },
    componentDidMount: function() {
        var columnWidths = getInitialColWidths(this.props.columnNames,this.props.data);
        var gridColumnInfo = mkGridColumns(this.props.columnNames,columnWidths);
        var container = this.getDOMNode();
        console.log("componenentDidMount: creating grid with ", gridColumnInfo, this.props.data, this.props.options);
        var grid = new Slick.Grid(container, this.props.data, gridColumnInfo.gridCols, this.props.options);
        // $(container).css( 'width', gridColumnInfo.gridWidth+'px' );
    },
    shouldComponentUpdate: function(props) {
        return false;
    }

 });

 module.exports = DataGrid;