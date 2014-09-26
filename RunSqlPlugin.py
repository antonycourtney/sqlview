#
# plugin for Sublime Text 3
#
import sublime, sublime_plugin
import http
import urllib
import sys
import os

agenthost = "127.0.0.1"
agentport = 5000

def send_query(source,query):
    params = urllib.parse.urlencode({'source': source, 'query': query});
    headers = {"Content-type": "application/x-www-form-urlencoded","Accept": "text/plain"}
    conn = http.client.HTTPConnection(agenthost,agentport)
    conn.request("POST", "/runsql", params, headers)
    response = conn.getresponse()
    # print response.status, response.reason
    data = response.read()
    # print data
    conn.close()

class RunSqlCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        try:
            # need this in a try/catch because Sublime seems to choke on unnamed buffers
            filename = self.view.file_name()
            if filename!=None:
                print("file name: ", os.path.basename(filename))
        except:
            filename="(unnamed buffer)"
        selectedText = ""
        for r in self.view.sel():
            selectedText += self.view.substr(r)
        # print("selected Text: ", selectedText)
        if len(selectedText)==0:
            print("No text selected, running on entire buffer")
            r = sublime.Region(0,self.view.size())
            contents = self.view.substr(r)
            # print("File contents:\n",contents)
            queryText = contents
            source = filename
        else:
            queryText = selectedText
            source = "selected text from " + filename
        send_query(queryText)
        # self.view.insert(edit, 0, "Hello, World!")
