# Raspberry Pi
The Raspberry Pi will act as a:
- database
- MQTT broker

# Hardware
- [Raspberry Pi 3 B+](https://www.raspberrypi.org/products/raspberry-pi-3-model-b/)
- (USB or SD card) flash drive with at least 4 GB of storage
- Ethernet network cable
- USB (phone) charger (max 5 V, min 2 A)

# Setup the Raspberry Pi 
First format your flash drive to FAT32. This will erase any data on it. While it formats download [Raspbian Lite](https://downloads.raspberrypi.org/raspbian_lite_latest).

When the format is done, burn the ISO image inside the Raspbian archive to the flash drive (a guide can be found [here](https://www.raspberrypi.org/documentation/installation/installing-images/README.md)).

After the burn, go to `boot/` and create a file called `ssh` (no extension) to enable SSH access.

Now we can boot up the Raspberry Pi. Insert the flash drive, network cable and finally the USB charger. When the green LED stops blinking the Pi is ready.

Now we will install everything on the Pi. This is automated with a [setup script](setup.sh).

Find the IP address of the Pi (usually `192.168.1.X`).

SSH into the Pi with the command
```bash
ssh pi@192.168.1.X
```
and enter the default password `raspberry`.

Go to the home directory and download the setup script
```bash
cd ~
wget https://raw.githubusercontent.com/JohanWinther/home-automation/master/raspberry-pi/setup.sh
chmod +x setup.sh
sudo ./setup.sh
```

The script will open the raspbian configuration program. Here you need to change the:
- default credentials
- timezone

When you're done select "Finish" and the script will install the required software packages, setup services and start any software. For more detail look at the [setup script](setup.sh).

When the script is done the setup of the Raspberry Pi is finished.

# Functionality
Here are some of the functionalities of the Raspberry Pi.
## Database
The Raspberry Pi will work as a database for any telemetry data that should be saved. This is done with
[SQLite3](https://www.sqlite.org/index.html) which will be accessed through a Node-powered REST service.

## MQTT broker
The Pi will act as a message broker with [Mosquitto](https://mosquitto.org/), which is a lightweight and open source MQTT broker.

## Central Hub Web App (future)
The Pi might host a web app which will be accessible on the local network to control the home automation system. This will remove the need to download an app on the device. Eventually this might be accessible from outside the LAN (with authentication).