---
title: No Excuses Part III: Build drupal with Composer
tags:
- Ansible
- php
- Pantheon
- CI
categories:
    - devops
    - CI
    - configuration management
description: Excuses are up; time to build your drupal with Composer.
---

**NOTE** This post is a continuation of [No Excuses Part I](http://craychee.io/blog/2015/05/20/no-excuse-config-management-drupal/) and [No Excuses Part II](http://craychee.io/blog/2015/07/29/no-excuses-drupal-config/).

There is no getting around using composer. If you are going to continue to develop modern php applications (including with drupal) composer is *the* dependency manager for PHP.  We will be using composer to install `behat` in the next part so although you could skip this part and get right to testing, you can't completely avoid it.

Might as well stop with the excuses and start managing your project's dependencies (which includes drupal itself) with composer.

### Step One: Generate Your composer
Ensure that you are inside your virtual machine (`vagrant ssh`) and navigate to the project root (`/vagrant`, **not** `~/vagrant`). Run `composer init` to walk through the creation of our first composer project.

Let's do this.

**Package name:** the convention here is `organization/project_name` (like on github). My project will be `craychee/no-excuses`.  
**Description:** Help yourself and others who look at your project by explaining what it is. My project can be described as `The companion example repository for the No Excuses blog series on http://craychee.io.`  
**Author:** Take proper credit/responsibility for your work. The format is strictly enforced here. This is what my byline looks like: `Michelle Krejci <michelle@craychee.io>`.  
**Minimum Stability:** Our minimal stability is the only stability we have: `dev`.  
**Package Type:** `project`  
**License:** Your project is proprietary unless you specify otherwise. I will choose `GPL-2.0`.  

You will now be asked if you would you like to define your dependencies interactively. We have another step that we need to take care of first so answer "no" to the questions about dependencies and then confirm its generation.

You can read more about composer's scheme [here](https://getcomposer.org/doc/04-schema.md).


### Step Two: Make drupal a Dependency

We need to use the drupal-composer [packagist](https://packagist.org/) repository. This wonderful project mirrors all of drupal.org's projects for composer, which we will need since we want projects from drupal.org installed via composer.

Add this to the `composer.json`:
~~~json
"repositories": [
    {
        "type": "composer",
        "url": "http://packagist.drupal-composer.org/"
    }
],
~~~

If you aren't hosting with [Pantheon](https://pantheon.io/) or don't otherwise prefer [drops-7](https://github.com/pantheon-systems/drops-7), you can now just add drupal as a requirement with:
~~~json
"require": {
        "drupal/drupal": "7.38"
        }
~~~

**A note on versioning:**  
The versioning works here the same as it does on drupal.org.

If you host with Pantheon or otherwise just prefer drops-7, you have just a bit more work. Inside the `repository` array, under where we have added the packagist.drupal-composer.org repository, add:
~~~json
{
"repositories": [
    [...]
{
    "type": "package",
    "package": {
        "name": "pantheon-systems/drops-7",
        "type": "drupal-core",
         "version": "7.38",
         "source": {
         "url": "https://github.com/pantheon-systems/drops-7.git",
         "type": "git",
         "reference": "master"
         },
         "replace": {
             "drupal/drupal": "self.version",
             "drupal/field": "self.version",
             "drupal/file": "self.version",
             "drupal/system": "self.version",
             "drupal/path": "self.version"
         }
    }
}
],
~~~

Then under `require` we will add:
~~~json
"require": {
        "pantheon-systems/drops-7": "7.38",
        }
~~~

We just told composer that we want to use `pantheon-systems`'s repository. Any repository that depends on `drupal/drupal` or modules that drupal core contains should be replaced by `pantheon-systems`, which is more than capable of fulfilling all of your drupal needs. For example, `drupal/pathauto` (a mirror of https://www.drupal.org/project/pathauto), depends on `drupal/path`, which is part of core. The drupal composer project expects that drupal core is `drupal/drupal`, so here we are saying that `pantheon-systems/drops-7` can satisfy that requirement instead.

**Note** that I only listed a few drupal core modules here (`field`, `file`, `system`, `path`). I did this only for brevity. You can either list all of drupal's core modules so that you don't need to add additional dependencies or you can list them all, as this [example repository](https://github.com/pantheon-systems/example-drupal7-travis-composer/blob/master/composer.json) does, or you can take it on a case by case basis.

Now your `composer.json` should look either something like this:
~~~json
{
    "name": "craychee/no-excuses",
    "description": "The companion example repository for the No Excuses blog series on http://craychee.io.",
    "type": "project",
    "license": "GPL-2.0",
    "authors": [
        {
            "name": "Michelle Krejci",
            "email": "michelle@craychee.io"
        }
    ],
    "minimum-stability": "dev",
    "repositories": [
        {
            "type": "composer",
            "url": "http://packagist.drupal-composer.org/"
        }
    ],
    "require": {
        "drupal/drupal": "7.38"
    }
}
~~~

Or this:
~~~json
{
    [...]
    "repositories": [
        {
            "type": "composer",
            "url": "http://packagist.drupal-composer.org/"
        },
        {
            "type": "package",
            "package": {
                "name": "pantheon-systems/drops-7",
                "type": "drupal-core",
                "version": "7.38",
                "source": {
                    "url": "https://github.com/pantheon-systems/drops-7.git",
                    "type": "git",
                    "reference": "master"
                },
                "replace": {
                    "drupal/drupal": "self.version",
                    "drupal/field": "self.version",
                    "drupal/file": "self.version",
                    "drupal/system": "self.version",
                    "drupal/path": "self.version"
                }
            }
        }
    ],
    "require": {
        "pantheon-systems/drops-7": "7.38"
    },
}
~~~

### Step Three: Install

From inside your virtual machine, run `composer install`. drupal will be installed inside `vendor`.

This might take a while initially. You can run and get a cup of coffee OR you can head over to [http://drupal-composer.org/](http://drupal-composer.org/) and make a donation. The packagist account that we are using is supported by donations.

### Step Four: Add a drupal module to the dependencies.

Add this to your `composer.json`:
~~~json
"require": {
[...]
        "drupal/features": "~7.2",
        }
~~~
And run `composer update` to install.

### Step Five: Make the drupal root that drupal expects.

We now have our drupal root inside `vendor/drupal/drupal` (or `vendor/pantheon-systems/drupal`) and our first drupal contrib module inside `vendor/drupal/features`.

Brilliant. Now how do we make a drupal root?

You have a number of options. Greg Anderson describes his method of using drupal installers [here](https://pantheon.io/blog/example-repository-build-drupal-composer-travis). In this method, drupal doesn't hit `vendor`. drupal is assembled with composer. This method is similar to the method described on [drupal.org](https://www.drupal.org/node/2471553).

For reasons that are beyond the scope of this blog series, I prefer to let composer do its thing (install inside `vendor`) and I then assemble drupal root using a symphony2 library. There is safety in numbers, so if you prefer to follow the installer path method, I won't be disappointed in you.

If you do want to stick with me here, we are going to require said library:
~~~json
"require": {
[...]
        "craychee/rootcanal": "dev-master",
        }
~~~

And now under the `require` section, add:
~~~json
    "config": {
        "bin-dir": "bin"
    },
    "scripts": {
        "post-install-cmd": [
            "bin/rootcanal"
        ],
        "post-update-cmd": [
            "bin/rootcanal"
        ]
    }
~~~

Make sure that you have completely removed `www` from the project. We are going to put the creation of that root under composer's control.

Now run `composer update`.

Check the contents of your newly created `www` to ensure that you have your drupal root. Or better still, visit `http://192.168.33.99/`, log in, and ensure that `features` is available for you to enable now.

One more thing, add this to the bottom of your `local.settings.php`:
~~~php
require_once DRUPAL_ROOT . '/sites/default/vendor/autoload.php';
~~~

### Step Six: Add this to our vagrant provision

Open your `Vagrantfile` and insert a `composer install` before your build:
~~~sh
  config.vm.provision :shell, inline: <<SCRIPT
  if [[ ! -f /vagrant/cnf/settings.php ]]; then
  cp /vagrant/cnf/local.settings.php /vagrant/cnf/settings.php
  fi
  su vagrant -c 'cd /vagrant && composer install && build/install.sh;'
SCRIPT
~~~

Perfect. Our project dependencies will be added with `vagrant up`.

Now all of our dependencies are being managed and assembled with composer, we have no need for `vendor` or `www` part of the project. Commit `composer.json` and `composer.lock` to the repository and open `.gitignore` and add `vendor`, `www`, and `bin`. 

**Want to make sure you followed all of my instructions?**
You can view/fork my no-excuses-example [here](https://github.com/craychee/no-excuses-drupal/tree/0.3.0).

**Did you get an error?**
Occasionally I get an error that looks like `Failed to remove file "/vagrant/www/sites/default/vendor"`. I admit that I do not have a graceful way to resolve this. When I get this, from my host machine (i.e., not inside the vagrant box) I just blow away the `www` directory as a sudo user: `sudo rm -Rf www`. I will send one lemon-flavored toothpick to anyone who can resolve this for me on a more sustained basis.

####Great ...Now what?
You will be adding **contrib** modules side `composer.json` (and running `composer update`) or you can use `composer require [...]`. As for the rest, if you are using my method of assembling drupal root, you will add custom modules inside a **modules** directory inside the project root and custom themes inside **themes** directory. You will only be commiting your own work and configuration along with your composer.json.

Up Next: **[No Excuses Part IV: Time to test](http://craychee.io/blog/2015/08/04/no-excuses-part4-testing/)**
