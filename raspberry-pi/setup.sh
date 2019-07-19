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

