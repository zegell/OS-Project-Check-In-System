# OS-Project-Check-In-System

## Overview

Check-In System is a web application built with a separation between its interface and data processing core. The frontend is developed using Angular, a web application to provide admin a dynamic dashboard for managing users' record. The users uses a mobile application to check in their current location. The data is sent using PHP, which works as the backend api for both web application and mobile application, and it's communicated using a tunneling service from zrok. Then, data are sent to the Apache Linux server and stored inside the MariaDB relational database, which handles constraints.

## Technology Stack
- Frontend: HTML, CSS, JavaScript, TypeScript
- Mobile Application Plugin: Cordova
- Web Application: Angular, Bootstrap
- Backend: PHP
- Database: MariaDB, phpMyAdmin
- Network: zrok

## [Web Application](https://zegell.github.io/OS-Project-Web/)

[Web application](https://zegell.github.io/OS-Project-Web/) is built using Angular 

## Project Structure

- `check-in-system-api` contains the php files for the backend
- `check-in-system-mobile` contains the source code for the mobile application
- `check_in_system` contains the source code for the web application
- `check_in_system_db` contains schema for the database

## How It Works

The server runs in the Arch Linux environment, the chosen distro for the project

### Required Packages

Install the following packages using the following command

1. **MariaDB** for database
    - `sudo pacman -s mariadb`

2. **Apache** for the web server,
    - `sudo pacman -s apache`

3. **PHP** with either **php-apache**, **mod_fcgid + php-cgi**, or **php-fpm**, the server will be using php-fpm
    - `sudo pacman -s php php-apache`
    - `sudo pacman -s php php-cgi` and `yay -s mod_fcgid`
    - `sudo pacman -s php php-fpm`

4. **zrok2**
    - `yay -s zrok2`

5. **phpMyAdmin**
    - `sudo pacman -s phpmyadmin`

### Setting Up MariaDB

These are the commands required to give yourself the privileges needed:

- `sudo mariadb -u root -p`
- `GRANT ALL PRIVILEGES ON *.* TO '#YOURNAME'@'localhost' WITH GRANT OPTION;`
- `FLUSH PRIVILEGES;`
- `EXIT;`

### Setting Up Apache, phpMyAdmin, PHP, and php-fpm

These are the commands needed to setup the web server

*[ `nvim` is the command to call terminal text editor, yours may be `vi`,`vim`,`nano`, etc ]*

- `sudo nvim /etc/php/php.ini` and enable the following:
    - `extension=iconv`
    - `extension=pdo_mysql`
- `sudo nvim /etc/httpd/conf/extra/phpmyadmin.conf` and insert the following:

>Alias /phpmyadmin "/usr/share/webapps/phpMyAdmin"
><Directory "/usr/share/webapps/phpMyAdmin">
>   DirectoryIndex index.php
>   AllowOverride All
>   Options FollowSymlinks
>   Require all granted
></Directory>

- `sudo nvim /etc/httpd/conf/extra/php-fpm.conf` and insert the following:

>DirectoryIndex index.php index.html
><FilesMatch \.php$>
>   SetHandler "proxy:unix:/run/php-fpm/php-fpm.sock|fcgi://localhost/"
></FilesMatch>

- `sudo nvim /etc/httpd/conf/httpd.conf` and enable the following:
    - `LoadModule proxy_module modules/mod_proxy.so`
    - `LoadModule proxy_fcgi_module modules/mod_proxy_fcgi.so`
- At the bottom of the file, include:
    - `Include conf/extra/php-fpm.conf`
    - `Include conf/extra/phpmyadmin.conf`

### Setting Up zrok

zrok is a tunneling tool to bridge between the server and the internet

- Go to `https://myzrok.io/` and sign up for a free account
- Go to `https://api-v2.zrok.io/` and click on the green question mark icon on the top right
- Obtain the token and activate the operating system shell using `zrok2 enable [TOKEN]`
- `zrok2 create name -n public [DOMAIN]` to reserve a name 
- `zrok2 share public localhost:80 -n public:[DOMAIN]` to expose the local port using the domain

### Starting the server

- `sudo systemctl start mariadb httpd php-fpm`

## Mobile Application Guide

- Downloading the app from the repository releases tab
- App will show the log in page first when opened, register by clicking the `Register` hyperlink
- Register the account, and user will be redirected,
- Allow the location in the app permission, and click on the new check-in to log the location
- Click on any of the log to view location

