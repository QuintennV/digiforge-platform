# Placeholder file for whatever your "main" file will be.
# This can be any coding language/set up you want it to be.

# If and when you change this file(name), adjust your (and ONLY your) corresponding Dockerfile accordingly
# I (Quinten) can help in writing the Dockerfile for your setup if you need me to.


# This folder (the UI for the project) is the only public facing container. Whatever is made here will be displayed
# on the VM at http://20.77.58.26:8080/. After any push to the GitHub, the changes should also instantly be visible
# on that website.

from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello World from the VM!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port = 8080)
