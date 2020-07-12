# RPI Garage Door

## Install

```
git clone https://github.com/Roaders/rpi-garage-door.git
cd rpi-garage-door
npm install
npm run build
```

### Create Users

```
npm run createUser
```

### Verify User

```
npm run checkUser
```

### Generate Secret for Jwt

```
npm run generateSecret
```

### Run server (not as a service)

```
npm run start-prod
```

## Running as a service

### Get Status

```bash
sudo systemctl status garage-door
```

### Start and stop

```bash
sudo systemctl stop garage-door
```
```bash
sudo systemctl start garage-door
```

### Setup

Create `/etc/systemd/system/garage-door.service`:

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

and enable the service:

```bash
sudo systemctl enable garage-door.service
```

## Secure Certificate

Install certbot:

```bash
sudo apt-get install certbot
```

create certificate:

```bash
sudo certbot certonly --standalone
```
(port 80 needs to be forwarded to your pi)
follow instructions

If it works we get the following message:

```
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/MYDOMAIN/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/MYDOMAIN/privkey.pem
   Your cert will expire on 2020-10-10. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot
   again. To non-interactively renew *all* of your certificates, run
   "certbot renew"
```

copy `/etc/letsencrypt/live/MYDOMAIN/fullchain.pem` and `/etc/letsencrypt/live/MYDOMAIN/privkey.pem` into `.env` file in root of web server:

```
keyPath=/etc/letsencrypt/live/MYDOMAIN/privkey.pem
certificatePath=/etc/letsencrypt/live/MYDOMAIN/fullchain.pem
```

make cert files readable:

```bash
sudo chmod -R a+r /etc/letsencrypt/archive/MY_DOMAIN
```

edit deploy hook:

```bash
sudo nano /etc/letsencrypt/renewal-hooks/deploy/restart-garage-door.sh
```
and add the restart command:
```
systemctl restart garage-door
```

## Renew Certificates:

(this should happen automatically)

```bash
sudo certbot renew
```

dry run

```bash
sudo certbot renew --dry-run
```

force (to test server restart)

```bash
 sudo certbot renew --force-renewal
```
this will only work a limited number of times a day due to rate limiting. Use dry run first.
