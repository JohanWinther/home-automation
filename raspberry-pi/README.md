# Raspberry Pi
The Raspberry Pi is the central brain of the home automation system.

# Functionality
Here are some of the functionalities of the Raspberry Pi.
## Database
The Raspberry Pi will work as a [SQLite3](https://www.sqlite.org/index.html) database for any telemetry data that should be saved.

A [node app](mqtt-db/mqtt-db.service) listens to MQTT messages and saves them to a predefined database file.
The data is accessed through a [Node-powered REST API](db-rest-api/README.md).

## MQTT broker
The Pi will act as a message broker with [Mosquitto](https://mosquitto.org/), which is a lightweight and open source MQTT broker.

## Central Dashboard Web App
The Pi hosts a web app which will be accessible on the local network to control the home automation system.

# Hardware
- [Raspberry Pi 3 B+](https://www.raspberrypi.org/products/raspberry-pi-3-model-b/)
- (USB or SD card) flash drive with at least 4 GB of storage
- Ethernet network cable
- USB (phone) charger (max 5 V, min 2 A)

# Setup the Raspberry Pi 
First format your flash drive to FAT32. This will erase any data on it. While it formats download [Raspbian Lite](https://downloads.raspberrypi.org/raspbian_lite_latest) and unzip the ISO image.

When the format is done, burn the ISO image inside the Raspbian archive to the flash drive (a guide can be found [here](https://www.raspberrypi.org/documentation/installation/installing-images/README.md)).
Burning can be done with [balenaEtcher](https://www.balena.io/etcher/) which is available as a portable app.

After the burn, go to `boot/` and create a file called `ssh` (no extension) to enable SSH access.

Now we can boot up the Raspberry Pi. Insert the flash drive, network cable and finally the USB charger. When the green LED stops blinking the Pi is ready.

Now we will install everything on the Pi. This is automated with a [setup script](setup.sh).

Find the IP address of the Pi (usually `192.168.1.X`).

SSH into the Pi with the command
```bash
ssh pi@192.168.1.X
```
and enter the default password `raspberry`.

Now you need to configure the Pi with the raspbian configuration program
```bash
raspi-config
```
Here you need to setup:
- Default password (1)
- Wi-Fi credentials (2.N2)
- boot into text console with autologin (3.B2)
- Timezone (4.I2)
- Wi-Fi country (4.I4)

When you're done select "Finish" which will reboot the Pi (and kick you out from SSH). 

SSH into the Pi again when it has rebooted with the Wi-Fi IP address this time (and your new password).

Go to the home directory and download the setup script
```bash
cd ~
wget -O setup.sh https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/setup.sh
chmod +x setup.sh
sudo ./setup.sh

```
The script will install the required software packages, setup services and start any software. For more detail look at the [setup script](setup.sh).

When the script is done the setup of the Raspberry Pi is finished.

What remains now is to copy the file
```
cp ~/mqtt-db/default.publishers.js ~/mqtt-db/publishers.js
```
and fill in the publishers you want to be saved in the database.
