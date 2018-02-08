## create the .conf file and place it into the directory apache will search for
sudo ln -s /var/www/git/More/clientside-module-manager/test/env/_dev/server/apache.conf /etc/apache2/sites-available/clientside-module-manager.conf &&
sudo ln -s /etc/apache2/sites-available/clientside-module-manager.conf /etc/apache2/sites-enabled/clientside-module-manager.conf
sudo service apache2 restart
