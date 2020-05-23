# Sample systemctl config

Create file `/etc/systemd/system/garage-door.service`

```
[Service]
WorkingDirectory=/home/pi/git/rpi-garage-door
ExecStart=npm run start-prod
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=garage-door
User=pi
Group=pi
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target

```

## Commands

### Enable

```bash
sudo systemctl enable garage-door
```

### Start

```bash
sudo systemctl start garage-door
```

### Logs

```bash
journalctl -u garage-door
```

### Status

```bash
systemctl status garage-door
```
