/** @jsx React.DOM */
'use strict';

/** @ignore */
var React = require("react");
var $ = require('jquery');
window.jQuery = $;
var SlickGrid = require("slickgrid/grid");

// scan table data to make best effort at initial column widths
function getInitialColWidths( data ) {
  // let's approximate the column width:
  var MINCOLWIDTH = 80;
  var MAXCOLWIDTH = 300;
  var colWidths = [];
  var nRows = data.length;
  for ( var i = 0; i < nRows; i++ ) {
    var row = data[i];
    for ( var j = 0; j < row.length; j++ ) {
      var cellVal = row[ j ];
      var cellWidth = MINCOLWIDTH;
      if( cellVal ) {
        cellWidth = 8 + ( 6 * cellVal.toString().length );  // TODO: measure!
      }
      colWidths[ j ] = Math.min( MAXCOLWIDTH,
          Math.max( colWidths[ j ] || MINCOLWIDTH, cellWidth ) );
    }
  }
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
        var columnWidths = getInitialColWidths(this.props.data);
        var gridColumnInfo = mkGridColumns(this.props.columnNames,columnWidths);
        var container = this.getDOMNode();
        var grid = new Slick.Grid(container, this.props.data, gridColumnInfo.gridCols, this.props.options);

        $(container).css( 'width', gridColumnInfo.gridWidth+'px' );
    },
    shouldComponentUpdate: function(props) {
        return false;
    }

 });

 module.exports = DataGrid;