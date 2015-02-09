# sqlview -- A simple browser-based viewer for seeing output of SQL queries

sqlview is a tool for running SQL queries on a remote database using an ODBC (or similar) style connection mechanism and displaying the results in a web browser.

I wrote this because I prefer to edit my SQL code in my editor (SublimeText), and I wanted to be able to run the query and see the results from a single keystroke in the editor.

The project is broken in to three components:

* *agent* -- You start this once and leave it running in the background.  It will connect to your database, and run a little Flask-based http server that will accept connections from the local command line client and the browser-based viewer.
* *viewer* -- The collection of HTML and JavaScript that runs in the browser to show queries and results.
* *client* -- A command-line client that opens an http connection to the agent, submits a SQL query to execute, and immediately exits.  Does not return query results to the client, but instead makes submitted query and result available to the web-based viewer. Could probably be implemented entirely with wget or curl.

# Installation and Getting Started

These are quick-start instructions for using sqlview with the Analytics Inbox (ai) Project



### Clone This Repository

    $ git clone https://github.com/antonycourtney/sqlview.git

### Build the JavaScript Viewer

Install npm dependencies, run gulp:

    $ cd sqlview/viewer
    $ npm install
    $ gulp

And pop back up to the sqlview directory:

    $ cd ..


### Source the Glen Mistro env vars

You need this to connect to Redshift.  Skip if you already do this in your `.profile` or equivalent.

  $ . ~/glenmistro/env_vars.sh

### Run the agent

  $ python svagent.py

### Connect to the viewer from a web browser:

In your web browser open the URL http://localhost:5000/viewer/viewer.html

### Run an ai query:

In the `ai/analytics_db` dir, hack `tq.sh` to have the path to your `sqlview` directory, and then run:

  $ ./tq.sh -u 1 allCorrespondents

If all went well, you should see the query and a grid with the query result in your browser window.

( And yes, I should fix the absolute path in that shell script...)

### Optional : Install Sublime Text Plugin

( I would skip this for now...this is from when I was writing queries directly in a file with just SQL, before setting up inbox_queries.js ).

To install the Sublime Text plugin, copy or link RunSqlPlugin.py in to the Sublime Text plugins directory.  For me, this is ~//Library/Application Support/Sublime Text 3/Packages/User.