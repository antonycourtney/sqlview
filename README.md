# sqlview -- A simple browser-based viewer for seeing output of SQL queries

sqlview is a tool for running SQL queries on a remote database using an ODBC (or similar) style connection mechanism and displaying the results in a web browser.

I wrote this because I prefer to edit my SQL code in my editor (SublimeText), and I wanted to be able to run the query and see the results from a single keystroke in the editor.

The project is broken in to three components:

* *agent* -- You start this once and leave it running in the background.  It will connect to your database, and run a little Flask-based http server that will accept connections from the local command line client and the browser-based viewer.
* *viewer* -- The collection of HTML and JavaScript that runs in the browser to show queries and results.
* *client* -- A command-line client that opens an http connection to the agent, submits a SQL query to execute, and immediately exits.  Does not return query results to the client, but instead makes submitted query and result available to the web-based viewer. Could probably be implemented entirely with wget or curl.

# Installation and Getting Started

To install the Sublime Text plugin, copy or link RunSqlPlugin.py in to the Sublime Text plugins directory.  For me, this is ~//Library/Application Support/Sublime Text 3/Packages/User.
