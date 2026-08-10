import os
import time
import json
import threading
import serial
import requests
from dotenv import load_dotenv

# Carica le variabili dal file .env
load_dotenv()

SERIAL_PORT = os.getenv("SERIAL_PORT", "COM3")
SERIAL_BAUD = int(os.getenv("SERIAL_BAUD", 9600))
COWRIE_LOG_PATH = os.getenv("COWRIE_LOG_PATH", "../docker/cowrie-logs/cowrie.json")
WEB_LOG_PATH = os.getenv("WEB_LOG_PATH", "../docker/web-logs/web_honeypot.json")
API_ENDPOINT = os.getenv("API_ENDPOINT", "http://localhost:3000/api/ingest")
API_KEY = os.getenv("API_KEY", "")

headers = {
    "Content-Type": "application/json",
    "X-API-KEY": API_KEY
}

def send_payload(payload):
    """Invia l'evento formattato verso l'endpoint API del tuo sito web."""
    try:
        response = requests.post(API_ENDPOINT, json=payload, headers=headers, timeout=5)
        if response.status_code == 200:
            print(f"[+] Evento inviato con successo: {payload.get('event')}")
        else:
            print(f"[-] Errore API [{response.status_code}]: {response.text}")
    except Exception as e:
        print(f"[!] Impossibile connettersi all'API backend: {e}")

# --- Worker 1: Monitoraggio Seriale Elegoo UNO R3 ---
def monitor_serial():
    print(f"[*] Avvio ascolto sulla porta seriale {SERIAL_PORT}...")
    try:
        ser = serial.Serial(SERIAL_PORT, SERIAL_BAUD, timeout=1)
        time.sleep(2)  # Tempo di reset della scheda Arduino
        while True:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if line.startswith("{") and line.endswith("}"):
                    try:
                        raw_data = json.loads(line)
                        payload = {
                            "source": "ELEGOO_UNO_R3_IOT",
                            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                            "event": raw_data.get("event", "UNKNOWN_IOT_EVENT"),
                            "details": raw_data.get("data", ""),
                            "success": raw_data.get("success", False)
                        }
                        send_payload(payload)
                    except json.JSONDecodeError:
                        pass
            time.sleep(0.1)
    except Exception as e:
        print(f"[!] Errore connessione Seriale ({SERIAL_PORT}): {e}")

# --- Worker 2: Monitoraggio File di Log (Tail -f su JSON) ---
def watch_file_log(file_path, source_label, parser_func):
    print(f"[*] Avvio tail del file: {file_path}")
    while not os.path.exists(file_path):
        time.sleep(2)

    with open(file_path, "r") as f:
        # Spostati alla fine del file per catturare solo i NUOVI eventi
        f.seek(0, os.SEEK_END)
        while True:
            line = f.readline()
            if not line:
                time.sleep(0.5)
                continue
            try:
                raw_json = json.loads(line.strip())
                payload = parser_func(raw_json, source_label)
                if payload:
                    send_payload(payload)
            except json.JSONDecodeError:
                pass

def parse_cowrie_log(raw_json, source):
    event_id = raw_json.get("eventid", "")
    # Filtriamo solo eventi di interesse (es. tentativi di login o comandi eseguiti)
    if "login" in event_id or "command" in event_id:
        return {
            "source": source,
            "timestamp": raw_json.get("timestamp"),
            "src_ip": raw_json.get("src_ip", "0.0.0.0"),
            "event": event_id.upper(),
            "details": {
                "username": raw_json.get("username"),
                "password": raw_json.get("password"),
                "input": raw_json.get("input")
            }
        }
    return None

def parse_web_log(raw_json, source):
    return {
        "source": source,
        "timestamp": raw_json.get("timestamp"),
        "src_ip": raw_json.get("src_ip", "0.0.0.0"),
        "event": raw_json.get("event"),
        "user_agent": raw_json.get("user_agent"),
        "details": raw_json.get("details")
    }

if __name__ == "__main__":
    print("==================================================")
    print("   Zylox HoneyNet Forwarder Agent - Avvio   ")
    print("==================================================")

    # Avvio dei thread per la gestione simultanea di Docker e Hardware
    t_serial = threading.Thread(target=monitor_serial, daemon=True)
    t_cowrie = threading.Thread(target=watch_file_log, args=(COWRIE_LOG_PATH, "DOCKER_COWRIE_SSH", parse_cowrie_log), daemon=True)
    t_web = threading.Thread(target=watch_file_log, args=(WEB_LOG_PATH, "DOCKER_WEB_TRAP", parse_web_log), daemon=True)

    t_serial.start()
    t_cowrie.start()
    t_web.start()

    # Mantieni attivo il processo principale
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[*] Arresto Forwarder.")