---
title: No Excuses Part I: Drupal-optimized Environment Config with (Ph)Ansible and Vagrant
tags:
- Ansible
- php
- Pantheon
- CI
categories:
    - devops
    - CI
    - configuration management
description: You have run out of excuses for not implementing a Continuous Integration process. I will give you everything you need to automate your system and drupal build, automate tests and automate deployment. We start today with the basics: getting your system into a versioned, distributable, known-state.
---

**UPDATE** [Jeff Geerling](http://jeffgeerling.com/) is offering a coupon for 50% off the recommended price for his recently published book *Ansible for DevOps: Server and configuration management for humans* to reader's of this series who want to learn more about Ansible: [http://leanpub.com/ansible-for-devops/c/zDAUa4QMP1CL)](http://leanpub.com/ansible-for-devops/c/zDAUa4QMP1CL). If I do my job right, that will be everyone.

Building your Drupal project in a known-state is the foundation of your Continuous Integration process.  You want to write and execute tests---and you should!--but your tests won't mean anything if you cannot define and build inside a known-state. Get your system under control first, then we will talk about getting your Drupal application under control.

Ansible has obliterated any stale scraps of lame excuses you might still cling to when it comes to putting off making your environment configuration explicit and version controlled:
> "I don't have time to learn a new language."  
> "We do not have any resources to manage it."  
> "The learning curve is too steep."  

While these excuses may have (barely) held when the configuration options were Chef, Puppet, and Salt, [Ansible](http://www.ansible.com/home) is so breathtakingly easy (it is just yml), you are embarassing yourself if you wait any longer.

So don't.

With [Phansible](http://phansible.com/), a point-and-click Ansible configuration maker for php envionments, you can get going even faster with more time to shame others who are dragging their feet.

## Local environment config in 3 Easy Steps

**NOTE** This particular example is tuned for a [Pantheon](https://pantheon.io/) environment. You should always tune your local environment as much as possible to your target production environment. Pantheon's [architecture](https://pantheon.io/platform/our-architecture) is opinionated toward performance. My preference is for highly opinionated software and infastructure, so Pantheon is my Drupal hosting platform choice. I will walk through tuning a `mod_php`/`Apache` environment at some later point.

###Step 1. Point and click config

Go over to [Phansible](http://phansible.com/). There are 6 configuration sections.

* **Machine Settings**  
    Under the [vagrant](http://phansible.com/#section-vagrant) section, change the **hostname** to something that reflects your project. I will call mine `no-excuses`. Bump your **memory** to `2048`.

* **System packages**  
    We don't have a lot of options here. Add `git` and `vim`. We will manually add a few more that Drupal needs later.

* **Webserver**  
    Under **Document Root**, change it to `/vagrant/www`. Accept all of the other [webserver](http://phansible.com/#section-webserver) defaults. (The webserver defaults are `nginx` and `php5-fpm`, which happens to be Pantheon's architecture too. If you are partial to Apache2 and feel comfortable deviating from my instructions here, you have my blessing. There is not much difference where we are concerned here.)

* **Languages**
    Choose and add the following configuration options:

    Php version: 5.6  
    Composer: enabled  
    Xdebug: enabled  
    php packages: `php5-gd, php5-cli, php5-curl, php5-mcrypt, php5-mysql, php5-xdebug`

* **Database**  
    Install MariaDB. Set a **root password** that you will remember (this is just a local enviroment). Create a default database and username/password for your local Drupal project. (I, for example, always use `default` as the database name, username, and password.)

* **Timezone**  
    Set the timezone to wherever you are / wherever is closest to where you are. I am in Chicago, so I select `America/Chicago`.

    ####Press the big `Generate` button.

    Go find someone to brag to about putting your system configuration into code.

###2. Open up the zip package and add additional packages.
Open `ansible/vars/all.yml`.  
To the `php:packages` array, add `php5-dev`.  
To the `server:packages` array, add:  `[sendmail, drush ,unzip, zip, g++, libssl-dev, apache2-utils]`.  


###3. Test that this can stand up an actual Drupal
Make sure that the following are installed on your computer:

* [virtualBox](https://www.virtualbox.org/wiki/Downloads) >= 4.3.x
* [vagrant](http://downloads.vagrantup.com/) >= 1.6.x
* [ansible](http://docs.ansible.com/ansible/intro_installation.html#installing-the-control-machine) >= 1.8.x

Go download the latest version of Drupal either with drush or from [here](https://www.Drupal.org/project/Drupal). Unzip/Untar (if you downloaded without drush), move it inside your phansible directory and rename it `www` (remember when we set the name of the Document Root?). Your project directory should now contain two directories, **ansible** and **www**, and one file, `Vagrantfile`.

Run `vagrant up`.

When asked for a password, enter your machine's sudo password.

You may get the error `ERROR: The file ansible/inventories/dev is marked as executable, but failed to execute correctly.`. If so, just run `chmod -x ansible/inventories/dev` and start the provisioning process up again by running `vagrant provision`.

Watch as ansible builds your system. Go find another person to high five.

When it finishes, visit `192.168.33.99` on your local. You should have a Drupal there ready to be installed.

**Want to make sure you followed all of my instructions?**
You can view/fork my no-excuses-example [here](https://github.com/craychee/no-excuses-Drupal/tree/0.1.0). I feel confident that you figured it out.

**Did something go wrong?**
You may get an error like:
~~~
==> default: Exporting NFS shared folders...
NFS is reporting that your exports file is invalid. Vagrant does
this check before making any changes to the file. Please correct
the issues below and execute "vagrant reload":
~~~
If so, remove your `exports` file (on a Mac, that would be `sudo rm /etc/exports`) and run `vagrant reload` again.

You should take some time to read through Vagrant's [documentation](http://docs.vagrantup.com/v2/getting-started/) to bring yourself up to speed with the basics.

####So... now what?
Sure you could point and click through the install (remember what database, user, and password you set up for MariaDB, or look at your code config inside `ansible/vars/all.yml`), but now that you have put your system requirements explicit (in code) and executable, don't you want to make your Drupal build executable too?

Of course you do. Read more: **[No Excuses Part II: Making your Drupal Build explicit and executable](/blog/2015/07/29/no-excuses-part2-drupal-config/)**
