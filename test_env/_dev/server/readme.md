Meta.conf contains file for apache server. A symlink should be created into sites-availible. A symlink should then be created from sites-availible to sites-enabled:
- `sudo ln -s /var/www/git/More/clientside-module-manager/test_env/_dev/server/CMM.conf /etc/apache2/sites-available/CMM.conf`

- `sudo ln -s /etc/apache2/sites-available/CMM.conf /etc/apache2/sites-enabled/CMM.conf`
- `sudo service apache2 restart`

Symlink repo->avail->enabled instead of repo->enabled to keep logic as expected for usual setups.


This config defines the server setup for the public server (PHP);
