---
title: No Excuses: Drupal-optomized Environment Config with (Ph)Ansible
subtitle: with an assist from Phansible
tags:
- Ansible
- php
- Pantheon
categories:
    - devops
    - configuration management

---

Ansible has obliterated any stale scraps of lame excuses you might still cling to when it comes to putting off making your environment configuration explicit and version controlled.

*No time to learn a new language.*  
*We do not have any resources to manage it.*  
*The learning curve is too steep.*  

While these excuses might have (barely) held when the configuration options were Chef, Puppet, and Salt, [Ansible](http://www.ansible.com/home) is so breathtakingly easy (it is just yml), you are embarassing yourself if you wait any longer.

So don't.

With [Phansible](http://phansible.com/), a point-and-click Ansible configuration maker for php envionments, you can get going even faster with more time to shame others who are dragging their feet.

## Local environment config in 3 Easy Steps

**NOTE** This particular example is tuned for a [Pantheon](https://pantheon.io/) environment. Of course, you should always tune your local environment as much as possible to your target production environment. Pantheon's [architecture](https://pantheon.io/platform/our-architecture) is opinionated toward performance. My preference is for highly opinionated software and infastructure, so Pantheon is my Drupal hosting platform choice. I will walk through tuning a `mod_php`/`Apache` environment at some later point.

###Step 1. Point and click config

Go over to [Phansible](http://phansible.com/). There are 6 configuration sections.

* **Vagrant**  
Accept all of the [vagrant](http://phansible.com/#section-vagrant) defaults. We can edit manually later (see "optional" configs below).

* **Webserver**  
Accept all of the [webserver](http://phansible.com/#section-webserver) defaults. (The webserver defaults are `nginx` and `php5-fpm`, which happens to be Phansible's architecture too.)

* **Php Settings**
Add the following configuration options:

    Php version: 5.6  
    Composer: enabled  
    Xdebug: enabled  
    php packages:  
    * `php5-gd`
    * `php5-cli`
    * `php5-curl`
    * `php5-mcrypt`
    * `php5-mysql`
    * `php5-xdebug`

* **Database**  
Install MariaDB. Set a **root password** that you will remember (this is just a local enviroment). Create a default database and username/password for your local Drupal project. (I, for example, always use `default` as the database name, username, and password.)

* **System packages**  
We don't have a lot of options here. Add `git` and `vim`.

* **Timezone**  
Set the timezone to wherever you are.

###2. Press the big `Generate` button.

###3. Open up the zip package and add additional packages.
Open `ansible/vars/common.yml`.  
To the `php_packages` array, add `php5-dev`.  
To the `sys_packages` array, add:  

* `sendmail`
* `drush`
* `unzip`
* `zip`
* `g++`
* `libssl-dev`
* `apache2-utils`

At this point, you can run `vagrant up` and you have a provisioned local vagrant environment that you can drop your Drupal in.

### OPTIONAL: make it your own.

This point-and-click system config is only going to get you started. It will, I hope, carve enough of a path forward that you will be compelled to make more of your system requirements explicit and expose more of your tunables. You are a developer.

#### Create a pre-provisioned box, host on Atlas

I have been developing using vagrant for three years now and have developed some preferences. You can see my `Vagrantfile` [here](https://github.com/craychee/drupal-fleet-yard/blob/master/Vagrantfile). The biggest difference is that I compile, box, and version my system requirements at the start of each project, host that pre-provisioned box on [Atlas](https://atlas.hashicorp.com/) and just pull that box down on a project, such as [drupal-adonis](https://github.com/craychee/drupal-adonis/blob/master/Vagrantfile#L7).

The **pros** about this approach is that I have faster up time without needing to provision with every build of the virtual machine. The **con** is that I am not tying the project-specific system configuration directly to the project's repository history nor any other tunables that are needed along the way.

#### Add tests
I have found it useful to babysit my own work by not only ensuring that my primary playbook compiles without failures but that it has provisioned what it is saying it provisioned. [Here](https://github.com/craychee/drupal-fleet-yard/blob/master/.travis.yml) is my Travis yml.
