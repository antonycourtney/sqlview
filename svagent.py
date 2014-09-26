#
# sqlview background agent (based on Flask)
#
from flask import Flask
from flask import request
from flask import jsonify
from threading import Timer
import flask
import psycopg2
import getpass
import os
import sys
from flask.json import JSONEncoder
import datetime
import traceback

#
# A custom JSONEncoder to encode date (not datetime) values reasonably:
#
class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        try:
            if isinstance(obj, datetime.date):
                ret = obj.strftime("%d %b %Y")
                return ret
            iterable = iter(obj)
        except TypeError:
            pass
        else:
            return list(iterable)
        return JSONEncoder.default(self, obj)

app = Flask(__name__)
app.json_encoder = CustomJSONEncoder

PASSFILE = "~/.awspass"

def getPass():
    passpath = os.path.expanduser(PASSFILE)
    if os.path.exists(passpath):
        with open(passpath,'r') as f:
            line = f.readline()
            password = line.strip()
            print "read AWS password from ", PASSFILE
    else:
        password = getpass.getpass("AWS password: ")
    return password

awspassword=getPass()

dbConn = None

# log of queries and results
queryLog = []

def runQuery(source,query):
    global dbConn
    print "dbConn: ", dbConn
    if dbConn==None:
        print "Connecting to database:"
        dbConn = psycopg2.connect(host="my-redshift.ch3bwpy21rao.us-west-2.redshift.amazonaws.com",
                                    database="mydb",port="5439",user="awsuser",password=awspassword)
        print "Connected."
    cursor = dbConn.cursor()
    print "Executing query: ", query
    entry = { 'source': source, 'query': query, 'result': []}
    try:
        cursor.execute(query)
        desc = cursor.description
        # print "description: ", desc
        cnames = map(lambda d: d.name, desc)
        # print "column names: ", cnames
        rows = cursor.fetchall()
        # print "===> ", rows
        entry['status'] = True
        entry['result'] = { 'columnNames': cnames, 'data': rows }
    except:
        dbConn = None
        cursor = None
        entry['status'] = False
        exc_type, exc_value, exc_traceback = sys.exc_info()
        lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
        exceptionInfo = ''.join(lines)
        print "caught exception: ", exceptionInfo
        entry['exceptionInfo'] = exceptionInfo
    queryLog.append(entry)

@app.route("/runsql",methods=['POST'])
def runsql():
    print "got query request"
    print "request form data: ", request.form
    sql = request.form['query']
    source = request.form['source']
    print "got query: ", sql
    runQuery(source,sql)
    return "OK"

@app.route("/getHistory/<int:history_id>")
def getHistory(history_id):
    # return all history starting from history_id
    logSuffix=queryLog[history_id:]
    return jsonify(history=logSuffix)

@app.route('/viewer/<path:filename>')
def send_public(filename):
    ret=flask.send_from_directory('viewer', filename)
    return ret

@app.route("/")
def hello():
    return "Hello World!"

if __name__ == "__main__":
    app.run(debug=True)
