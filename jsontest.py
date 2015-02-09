#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask import Flask, jsonify
from flask.json import JSONEncoder
import datetime

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

@app.route('/default')
def default_jsonencoder():
    now = datetime.date.today()
    return jsonify({'today': now})


if __name__ == '__main__':
    app.run(debug=True)