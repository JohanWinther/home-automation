#!/bin/bash

# This file should be run as: sudo bash setup.sh


read -p "Press enter to start the setup..."
ip_address="$(hostname -I | cut -d ' ' -f 1)"
echo "(Ethernet eth0) IP address detected as: $ip_address"

### Security
echo "Securing the Pi..."

# Make sudo require password
echo "pi ALL=(ALL) PASSWD: ALL" > /etc/sudoers.d/010_pi-nopasswd

# Only allow ssh from inside LAN
network_ip=$(echo "$ip_address" | cut -d '.' -f 1-3)    # 192.168.1
network_ip=$network_ip.                                 # 192.168.1.
echo "sshd : $network_ip" >> /etc/hosts.allow
uniq /etc/hosts.allow > /etc/hosts.allow

# Regurarly update ssh
echo "apt install openssh-server" > /etc/cron.daily/openssh-update

echo "Finished securing the Pi!"

### Node.js
echo "Installing Node.js..."
cd ~
wget https://nodejs.org/dist/v10.16.0/node-v10.16.0-linux-armv7l.tar.xz
tar -xf node-v10.16.0-linux-armv7l.tar.xz
cd node-v10.16.0-linux-armv7l/
cp -R * /usr/local/
cd ../
rm -rf node-v10.16.0-linux-armv7l
node -v
npm -v
echo "Installed Node.js!"

### Database
echo "Installing SQLite3..."
apt --yes install sqlite3
echo "Installed SQLite3!"

### MQTT
echo "Installing MQTT broker..."
apt --yes install mosquitto
echo "Adding websocket listener on port 9001"
echo "listener 1883
protocol mqtt

listener 9001
protocol websockets" | sudo tee /etc/mosquitto/conf.d/local.conf
systemctl enable mosquitto
echo "Installed MQTT broker and enabled the mosquitto service!"

### Create folders for all services
cd /home/pi/
mkdir db
mkdir mqtt-db
mkdir db-rest-api
mkdir dashboard
chown pi:pi -R *

### Setup mqtt-db
cd mqtt-db
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/mqtt-db/index.js -O index.js
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/mqtt-db/mqtt-db.service -O mqtt-db.service
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/mqtt-db/default.publishers.js -O default.publishers.js
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/mqtt-db/package.json -O package.json
npm install
cp mqtt-db.service /etc/systemd/system
chown pi:pi -R *
systemctl enable mqtt-db.service
systemctl start mqtt-db.service

### Setup db-rest-api
cd /home/pi/db-rest-api
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/db-rest-api/index.js -O index.js
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/db-rest-api/db-rest-api.service -O db-rest-api.service
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/db-rest-api/package.json -O package.json
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/db-rest-api/package-lock.json -O package-lock.json
npm ci
cp db-rest-api.service /etc/systemd/system
chown pi:pi -R *
systemctl enable db-rest-api.service
systemctl start db-rest-api.service

### Setup dashboard
cd /home/pi/dashboard
mkdir src
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/dashboard/index.js -O index.js
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/dashboard/dashboard.service -O dashboard.service
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/dashboard/package.json -O package.json
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/dashboard/package-lock.json -O package-lock.json
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/dashboard/src/favicon.ico -O src/favicon.ico
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/dashboard/src/index.html -O src/index.html
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/dashboard/src/main.js -O src/main.js
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/dashboard/src/paho-mqtt-min.js -O src/paho-mqtt-min.js
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/dashboard/src/pi-hole.svg -O src/pi-hole.svg
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/dashboard/src/styles.css -O src/styles.css
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/dashboard/src/thermometer.html -O src/thermometer.html
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/dashboard/src/thermometer.js -O src/thermometer.js
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/dashboard/src/thermometer.svg -O src/thermometer.svg
npm ci
cp dashboard.service /etc/systemd/system
chown pi:pi -R *
systemctl enable dashboard.service
systemctl start dashboard.service
