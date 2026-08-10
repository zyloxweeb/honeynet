from flask import Flask, request, render_template_string
import json
import os
from datetime import datetime

app = Flask(__name__)

# Assicura che la cartella dei log esista
os.makedirs('/app/logs', exist_ok=True)

LOGIN_TEMPLATE = """
<!DOCTYPE html>
<html>
<head><title>Admin Panel Login</title></head>
<body style="font-family:sans-serif; text-align:center; padding-top:50px;">
    <h2>Router & Gateway Administration</h2>
    <form method="POST" action="/login">
        <input type="text" name="username" placeholder="Username" required><br><br>
        <input type="password" name="password" placeholder="Password" required><br><br>
        <button type="submit">Login</button>
    </form>
</body>
</html>
"""

def log_event(event_type, details):
    log_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "event": event_type,
        "src_ip": request.remote_addr,
        "user_agent": request.headers.get('User-Agent', 'Unknown'),
        "details": details
    }
    with open('/app/logs/web_honeypot.json', 'a') as f:
        f.write(json.dumps(log_data) + '\n')

@app.route('/', methods=['GET'])
@app.route('/admin', methods=['GET'])
def index():
    log_event("WEB_SCAN_ATTEMPT", {"path": request.path})
    return render_template_string(LOGIN_TEMPLATE)

@app.route('/login', methods=['POST'])
def login():
    user = request.form.get('username')
    pasw = request.form.get('password')
    log_event("WEB_AUTH_ATTEMPT", {"username": user, "password": pasw})
    return "Error 500: Internal Server Error", 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)