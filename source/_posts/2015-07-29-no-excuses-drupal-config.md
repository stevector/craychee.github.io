---
title: No Excuses Part II: Making your Drupal Build explicit and executable
tags:
- Ansible
- php
- Pantheon
- CI
categories:
    - devops
    - CI
    - configuration management

---

**NOTE** This post is a continuation of [No Excuses Part I](http://craychee.io/blog/2015/05/20/no-excuse-config-management-drupal/).

SSH into your newly built machine by running `vagrant ssh`. Then navigate to `/vagrant/www` and run `drush si --db-url=mysql://default:default@localhost/default -y` (substituting whatever you set the user/password/database config to).

That was fun. Let's not force ourselves to remember to do that all the time though.

In order for this to be executable over and over in different environments and able to accommodate the build as it gets more complicated, we need to do the following:

1. Set up a `settings.php` for a local build (and discuss a good place to put this).
2. Create a bash script of drush that can be executed outside of the Drupal root.
3. Add this script to the `Vagrantfile` so that it runs on the build.

###Step 1. Get your settings sorted.
One of the benefits of working a known state is that connecting to the database will be the same for everyone. We can actually share a local `settings.php` without anyone else needing to think about it.

Here is a `settings.php` that will connect with the environment we provisioned with ansible:
~~~php
<?php
$db_url='mysql://default:default@localhost/default';
$databases=array('default' => array(
    'default' => array(
        'database' => 'default',
        'username' => 'default',
        'password' => 'default',
        'driver' => 'mysql',
        'host' => 'localhost',
    ),
),);
$drupal_hash_salt='161302b5bf927369e7c370212318c8f1837b03bbecb94eadb9eeed17a7875d1e';
~~~

This is going to work great locally but let's also think through the different environments that we are going to be building Drupal in. We know that we need at least **test environment** (like [travisCI](https://travis-ci.com/) or [circleCI](https://circleci.com/about) to test our deployment strategy and run our test suite) and a **production environment**. There are probably at least two more enivonments in between (**development**, for a stakeholders to view progress and **staging** for content entry or final approval). We aren't going to talk about those environments today but we will keep them in mind for how we set up our build script.

Let's create a new directory inside the project root called `cnf` to manage all such environment-specific configuration as we create them. Move the `settings.php` we just created into the `cnf` directory. We will rename it later but for now, let's move on to creating a script that will add this `settings.php` to our project and then bootstrap Drupal.

###Step 2. Create a bash script.

Create a file called `install.sh`. Open it and add a shebang and `set -e` (to exit on an error) at the top.
~~~sh
#!/bin/bash

set -e
~~~
Let's not add this to the project root but a directory of its own, like we did with settings. Create a directory called `build` and move `install.sh` there.

Remember that we ultimately want a site install to happen when we run our script. We started by manually running `drush si --db-url=mysql://default:default@localhost/default -y`. We created a settings file but we need to get it into the `sites/default/` directory of our Drupal and then pipe drush commands to the project.

In order to do this, we need to tell bash where we are, where the project is relative to where we are, and what to do with our drush commands. That looks like this:
~~~sh
#!/bin/bash

set -e

path=$(dirname "$0")
base=$(cd $path/.. && pwd)
drush="drush $drush_flags -y -r $base/www"
~~~

Now when you run `install.sh`, `$path` is assigned the value of the location of the path of the bash script relative to where you ran it from. `$base` then is one directory down from there, or the `install.sh` parent, which is the project root. Finally, we are telling bash that when we use `$drush`, all arguments that follow are `$drush flags` and we always pass `-y` flag after those arguments and execute those commands from inside our project (`$base`)/www directory (where we keep our Drupal root).

Now that we taught bash those variables, we can do what we need to do: copy our `settings.php` into Drupal and execute a drush command.
~~~sh
#!/bin/bash

set -e

path=$(dirname "$0")
base=$(cd $path/.. && pwd)
drush="drush $drush_flags -y -r $base/www"

chmod -R +w $base/www/sites/default
chmod -R +w $base/cnf

echo "Symlink settings.php into our Drupal."
ln -sf $base/cnf/settings.php $base/www/sites/default/
echo "Installing Drupal like a boss."
$drush si --site-name=no-excuses --account-pass=admin
~~~

This is what we did: made the source and the destination of our settings config writeable (Drupal has an annoying habit of setting permissions for you), symlinked `settings.php` into where it belongs, and then ran `drush si` with a few variables passed through to make our lives easier.

At this point you should be able run this script again and again and to navigate to `192.168.33.99` and log in with admin/admin without issue.

###Step 3. Make this script run when Vagrant builds.

Our goal here is to have the drupal build when we run `vagrant up` so that when cloning the project, assuming the developer has met the system requirements (e.g. VirtualBox, Ansible, vagrant), this is all that they need to run to get start developing where you left off. Everyone building the project the same way, over and over again, speeds up development and reduces human error.

We have one script that we need to run: `install.sh`. Adding it to our Vagrantfile looks like this:
~~~sh
  config.vm.provision :shell, inline: <<SCRIPT
  su vagrant -c 'cd /vagrant && build/install.sh;'
SCRIPT
~~~

Done.

Now one problem that isn't a problem yet but will be is that the `settings.php` that we are symlinking into Drupal on our build will be different based on the environment. We want the same build script to run no matter what.

There are a number of ways to handle environment-specific config. This is how we are going to do it:

1. Rename the `settings.php` inside `cnf` to `local.settings.php`.
2. Edit your `.gitignore` and add `settings.php`. (While you are at it, make sure `.vagrant` is in the .gitignore too.)
3. Add this to our Vagrantfile config:
~~~sh
  config.vm.provision :shell, inline: <<SCRIPT
  if [[ ! -f /vagrant/cnf/settings.php ]]; then
  cp /vagrant/cnf/local.settings.php /vagrant/cnf/settings.php
  fi
  su vagrant -c 'cd /vagrant && build/install.sh;'
SCRIPT
~~~

Great. Now, when vagrant provisions, it will check if there is a `settings.php` and copy the local settings if there isn't.

Repeatable, maintainable, executable Drupal build: check.

**Want to make sure you followed all of my instructions**: You can view/fork my no-excuses-example [here](https://github.com/craychee/no-excuses-drupal/tree/0.2.0). I feel confident that you figured it out.

####Great ...Now what?
You will presumably do other things with Drupal besides run install. Your script might start to look like:
~~~sh
#!/bin/bash

set -e

path=$(dirname "$0")
base=$(cd $path/.. && pwd)
drush="drush $drush_flags -y -r $base/www"

chmod -R +w $base/www/sites/default
chmod -R +w $base/cnf

echo "Symlink settings.php into our Drupal."
ln -sf $base/cnf/settings.php $base/www/sites/default/
echo "Installing Drupal like a boss."
$drush si --site-name=no-excuses --account-pass=admin
echo "Install high level module containing all project dependencies."
$drush en my_module_to_rule_all_modules
$drush fra
$drush updb
$drush cc all
~~~

But now that we have our environemt and our project locked down in a known state, we can finally add tests. BUT before we do that, we are going to take a quick detour and better manage our Drupal.

Coming soon: **No Excuses Part III: Building Drupal with Composer**
