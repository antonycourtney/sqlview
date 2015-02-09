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
# A custom JSONEncoder to encode date and datetime values reasonably:
#
class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        try:
            if isinstance(obj, datetime.datetime):
                ret = obj.strftime("%c")
                return ret
            elif isinstance(obj, datetime.date):
                ret = obj.strftime("%d %b %Y")
                return ret
            elif isinstance(obj, datetime.timedelta):
                ts = obj.total_seconds()
                print "Got total seconds: ", ts
                ret = str(ts)
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

class DbParams:
    REDSHIFT_PASSFILE = "~/.awspass"
    def __init__(self):
        self.redshiftParams = None

    #
    # Redshift Parameters
    # Figure out the default userid / password for AWS Redshift
    #
    def getRedshiftParameters(self):

        if self.redshiftParams != None:
            return self.redshiftParams

        # Initialize the hash
        self.redshiftParams = {
            'username' : None,
            'password' : None,
            'redshiftInstance' : None,
            'redshiftPort' : '5439',
            'redshiftDB' : None
            }

        passpath = os.path.expanduser(self.REDSHIFT_PASSFILE)
        if ('AWS_REDSHIFT_USER' in os.environ) and ('AWS_REDSHIFT_PWD' in os.environ):
            print "Read AWS Redshift parameters from environment vars"
            self.redshiftParams['username']         = os.environ['AWS_REDSHIFT_USER']
            self.redshiftParams['password']         = os.environ['AWS_REDSHIFT_PWD']
            self.redshiftParams['redshiftInstance'] = os.environ['AWS_REDSHIFT_INSTANCE']
            self.redshiftParams['redshiftPort']     = os.environ['AWS_REDSHIFT_PORT']
            self.redshiftParams['redshiftDB']       = os.environ['AWS_REDSHIFT_DB']
        elif os.path.exists(passpath):
            with open(passpath,'r') as f:
                line = f.readline()
                password = line.strip()
                print "Read AWS Redshift parameters from: [", self.REDSHIFT_PASSFILE, "]"
                self.redshiftParams['username']         = "awsuser"
                self.redshiftParams['password']         = password
                self.redshiftParams['redshiftInstance'] = None
                self.redshiftParams['redshiftPort']     = '5439'
                self.redshiftParams['redshiftDB']       = 'mydb'
        else:
            print "No .awspass and no AWS_REDSHIFT_USER env var. Perhaps need ../env_vars.sh?"

        print "Redshift parameters: username [", self.redshiftParams['username'], "] instance [", self.redshiftParams['redshiftInstance'], "]"
        return self.redshiftParams


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

# awspassword=getPass()
dbParams = DbParams()

dbConn = None

# log of queries and results
queryLog = []

def runQuery(source,query):
    global dbConn
    if dbConn==None:
        print "Connecting to database:"
        redshiftParams  = dbParams.getRedshiftParameters()
        print "got redshift params: ", redshiftParams
        # dbConn = psycopg2.connect(host="my-redshift.ch3bwpy21rao.us-west-2.redshift.amazonaws.com",
        #                             database="mydb",port="5439",user="awsuser",password=awspassword)
        dbConn = psycopg2.connect(host=redshiftParams['redshiftInstance'],
                                database=redshiftParams['redshiftDB'],
                                port=redshiftParams['redshiftPort'],
                                user=redshiftParams['username'],
                                password=redshiftParams['password'])
        print "Connected."
    cursor = dbConn.cursor()
    print "Executing query: ", query
    entry = { 'source': source, 'query': query, 'result': []}
    try:
        wrappedQuery = "select * from ( " + query + " ) limit 5000"
        cursor.execute(wrappedQuery)
        desc = cursor.description
        print "description: ", desc
        cnames = []
        if desc != None:
            cnames = map(lambda d: d.name, desc)
        # print "column names: ", cnames
        try:
            rows = cursor.fetchall()
        except psycopg2.ProgrammingError:
            rows = []
        print "===> ", rows
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
    source = request.form.get('source','')
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
