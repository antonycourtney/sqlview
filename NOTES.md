# Implementation Notes:

Using curl as a client:

$ curl -X POST -d @bar.txt http://127.0.0.1:5000/runsql

bar.txt is a text file with URL-encoded form parameters:

$ cat bar.txt
query=somequery

Seems to work.

