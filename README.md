# 🛡️ Zylox Deception Network (IoT & Cloud Honeynet)

Un'infrastruttura multi-layer di **Deception Technology** e telemetria delle minacce in tempo reale. Il sistema combina trappole containerizzate (Cowrie, Web Trap), sensoristica hardware IoT (Elegoo R3) e una Dashboard cloud serverless per il tracciamento degli attacchi.

---

## 📐 Architettura del Sistema

```text
[ Attaccante ] 
      │
      ├──> [ Docker Containers ] ────┐
      │     ├─ Cowrie (SSH Trap)     │
      │     └─ Web Trap (Flask)      │
      │                              ├─> [ Python Forwarder ] ─> [ Vercel Serverless API ] ─> [ Neon Postgres ]
      └──> [ IoT Hardware ] ─────────┘                                    │
            └─ Elegoo R3 (Serial)                                          └─> [ Live Dashboard ]

honeynet-deception-network/
├── dashboard/                 # Frontend Next.js (App Router) & Serverless API
│   ├── app/
│   │   ├── api/
│   │   │   ├── ingest/        # Endpoint POST per la ricezione dei dati dal forwarder
│   │   │   └── threats/       # Endpoint GET per la lettura dei log dal DB
│   │   ├── components/        # Componenti React (AttackTable, ThreatMap)
│   │   ├── layout.js          # Layout principale Next.js
│   │   └── page.js            # Interfaccia utente della Dashboard
│   └── package.json           # Dipendenze Node.js (Next.js, React, Neon)
├── docker/                    # Honeypot containerizzati
│   ├── cowrie-logs/           # Volume per i log di Cowrie
│   ├── web-trap/              # App Flask per simulazione trappola Web
│   └── docker-compose.yml     # Orchestrazione container
├── firmware/                  # Codice per schede Microcontrollore
│   └── iot_honeypot/          # Firmware C++ per Elegoo R3 / Arduino
├── forwarder/                 # Middleware di inoltro
│   ├── forwarder.py           # Daemon Python per lettura log e invio via HTTPS
│   └── requirements.txt       # Dipendenze Python
└── README.md                  # Documentazione del progetto

git clone [https://github.com/tuo-username/honeynet-deception-network.git](https://github.com/tuo-username/honeynet-deception-network.git)
cd honeynet-deception-network

cd docker
docker-compose up -d

cd ../forwarder
python -m venv venv

# Su Linux/macOS:
source venv/bin/activate

# Su Windows (PowerShell):
.\venv\Scripts\activate

pip install -r requirements.txt

