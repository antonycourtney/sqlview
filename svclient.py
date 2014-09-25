import httplib
import urllib
import sys
import os

agenthost = "127.0.0.1"
agentport = 5000

def send_query(query):
    params = urllib.urlencode({'query': query});
    headers = {"Content-type": "application/x-www-form-urlencoded","Accept": "text/plain"}
    conn = httplib.HTTPConnection(agenthost,agentport)
    conn.request("POST", "/runsql", params, headers)
    response = conn.getresponse()
    # print response.status, response.reason
    data = response.read()
    # print data
    conn.close()

query = "select count(*) from messages"
if len(sys.argv) > 1:
    filename = sys.argv[1]
    if os.path.exists(filename):
        with open(filename,'r') as f:
            query = f.read()
send_query(query)