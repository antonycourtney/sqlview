#
# sqlview background agent (based on Flask)
#
from flask import Flask
from flask import request
from flask import jsonify
import flask
import psycopg2
import getpass
import os

app = Flask(__name__)

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

print "Connecting to db..."
dbconn = psycopg2.connect(host="my-redshift.ch3bwpy21rao.us-west-2.redshift.amazonaws.com",
                        database="mydb",port="5439",user="awsuser",password=awspassword)
cursor = dbconn.cursor()

# log of queries and results
queryLog = []

def runQuery(query):
    print "Executing query: ", query
    entry = {'query': query, 'result': []}
    cursor.execute(query)
    desc = cursor.description
    print "description: ", desc
    cnames = map(lambda d: d.name, desc)
    print "column names: ", cnames
    rows = cursor.fetchall()
    print "===> ", rows
    entry['result'] = { 'columnNames': cnames, 'data': rows }
    queryLog.append(entry)

@app.route("/runsql",methods=['POST'])
def runsql():
    print "got query request"
    print "request form data: ", request.form
    sql = request.form['query']
    print "got query: ", sql
    runQuery(sql)
    return "OK"

@app.route("/getHistory")
def getHistory():
    return jsonify(history=queryLog)

@app.route('/viewer/<path:filename>')
def send_public(filename):
    ret=flask.send_from_directory('viewer', filename)
    return ret

@app.route("/")
def hello():
    return "Hello World!"

if __name__ == "__main__":
    app.run(debug=True)
