#!/bin/bash

# This file should be run as: sudo bash setup.sh

### Raspbian config
raspi-config
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
systemctl enable mosquitto
echo "Installed MQTT broker and enabled the mosquitto service!"

### Setup sensor database
cd /home/pi/
mkdir db
mkdir mqtt-db
cd mqtt-db
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/mqtt-db/index.js -O index.js
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/mqtt-db/mqtt-db.service -O mqtt-db.service
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/mqtt-db/default.publishers.js -O default.publishers.js
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/mqtt-db/package.json -O package.json
npm install
cp mqtt-db.service /etc/systemd/system
systemctl enable mqtt-db.service
systemctl start mqtt-db.service
