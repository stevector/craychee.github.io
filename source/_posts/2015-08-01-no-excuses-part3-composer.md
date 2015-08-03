---
title: No Excuses Part III: Build Drupal with Composer
tags:
- Ansible
- php
- Pantheon
- CI
categories:
    - devops
    - CI
    - configuration management
description: Excuses are up; time to build your Drupal with Composer.
---

**NOTE** This post is a continuation of [No Excuses Part I](http://craychee.io/blog/2015/05/20/no-excuse-config-management-Drupal/) and [No Excuses Part II](http://craychee.io/blog/2015/07/29/no-excuses-Drupal-config/).

There is no getting around using composer. If you are going to continue to develop modern php applications (including with Drupal). composer is *the* dependency manager for PHP.  We will be using composer to install `behat` in the next part so there is no getting around composer.

Might as well stop with the excuses and start managing your project's dependencies (which includes Drupal itself) with composer.

### Step One: Generate Your composer
Ensure that you are inside your virtual machine (`vagrant ssh`) and navigate to the project root (`/vagrant`). Run `composer init` to walk through the creation of our first composer project.

Let's do this.

**Package name:** the convention here is `organization/project_name` (like on github). My project will be `craychee/no-excuses`.  
**Description:** Help yourself and others who look at your project by explaining what it is. My project can be described as `The companion example repository for the No Excuses blog series on http://craychee.io.`  
**Author:** Take proper credit/responsibility for your work. The format is strictly enforced here. This is what my byline looks like: `Michelle Krejci <michelle@craychee.io>`.
**Minimum Stability:** Our minimal stability is the only stability we have: `dev`.  
**Package Type:** `project`  
**License:** Your project is propietary unless you specify otherwise. I will choose `GPL-2.0`.  

You will now be asked if you would you like to define your dependencies interactively. We have another step that we need to take care of first so answer no to the questions about dependencies and then confirm its gneration.

You can read more about composer's scheme [here](https://getcomposer.org/doc/04-schema.md).


### Step Two: Make Drupal a Dependency

We need to use the Drupal-composer [packagist](https://packagist.org/) repository. This wonderful project mirrors all of Drupal.org's projects for composer, which we will need since we want projects from Drupal.org installed via composer.

Add this to the `composer.json`:
~~~json
"repositories": [
    {
        "type": "composer",
        "url": "http://packagist.Drupal-composer.org/"
    }
],
~~~

If you aren't hosting with [Pantheon](https://pantheon.io/) or don't otherwise prefer [drops-7](https://github.com/pantheon-systems/drops-7), you can now just add Drupal as a requirement with:
~~~json
"require": {
        "Drupal/Drupal": "7.38"
        }
~~~

**A note on versioning:**  
The versioning works here the same as it does on Drupal.org.

If you host with Pantheon or otherwise just prefer drops-7, you have just a bit more work. Inside the `repository` array, under where we have added the packagist.Drupal-composer.org repository, add:
~~~json
{
"repositories": [
    [...]
{
    "type": "package",
    "package": {
        "name": "pantheon-systems/drops-7",
        "type": "Drupal-core",
         "version": "7.38",
         "source": {
         "url": "https://github.com/pantheon-systems/drops-7.git",
         "type": "git",
         "reference": "master"
         },
         "replace": {
             "Drupal/Drupal": "self.version",
             "Drupal/field": "self.version",
             "Drupal/file": "self.version",
             "Drupal/system": "self.version",
             "Drupal/path": "self.version"
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

We just told composer that we want to use `pantheon-systems`'s repository. Any repository that depends on `Drupal/Drupal` or modules that Drupal core contains should be replaced by `pantheon-systems`, which is more than capable of fufilling all of your Drupal needs. For example, `Drupal/pathauto` (a mirror of https://www.Drupal.org/project/pathauto), depends on `Drupal/path`, which is part of core. The Drupal composer project expects that Drupal core is `Drupal/Drupal`, so here we are saying that `pantheon-systems/drops-7` can satisfy that requirement instead.

**Note** that I only listed a few Drupal core modules here (`field`, `file`, `system`, `path`). I did this only for brevity. You can either list all of Drupal's core modules so that you don't need to add additional dependencies or you can list them all, as this [example repository](https://github.com/pantheon-systems/example-Drupal7-travis-composer/blob/master/composer.json) does, or you can take it on a case by case basis.

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
            "url": "http://packagist.Drupal-composer.org/"
        }
    ],
    "require": {
        "Drupal/Drupal": "7.38"
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
            "url": "http://packagist.Drupal-composer.org/"
        },
        {
            "type": "package",
            "package": {
                "name": "pantheon-systems/drops-7",
                "type": "Drupal-core",
                "version": "7.38",
                "source": {
                    "url": "https://github.com/pantheon-systems/drops-7.git",
                    "type": "git",
                    "reference": "master"
                },
                "replace": {
                    "Drupal/Drupal": "self.version",
                    "Drupal/field": "self.version",
                    "Drupal/file": "self.version",
                    "Drupal/system": "self.version",
                    "Drupal/path": "self.version"
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

From inside your virtual machine, run `composer install`. Drupal will be installed inside `vendor`.

### Step Four: Add a Drupal module to the dependencies.

Add this to your `composer.json`:
~~~json
"require": {
[...]
        "Drupal/features": "~7.2",
        }
~~~
And run `composer update` to install.

### Step Five: Make the Drupal root that Drupal expects.

We now have our Drupal root inside `vendor/Drupal/Drupal` (or `vendor/pantheon-systems/Drupal`) and our first Drupal contrib module inside `vendor/Drupal/features`.

Brilliant. Now how to we make a Drupal root?

You have a number of options. Greg Anderson describes his method of using Drupal installers [here](). In this method, Drupal doesn't hit `vendor`. Drupal is assembled with composer. This method is similar to the method described on [Drupal.org](https://www.Drupal.org/node/2471553).

For reasons that are beyond the scope of this blog series, I prefer to let composer do its thing (install inside `vendor`) and I then assemble Drupal root using a symphony2 library. There is safety in numbers, so if you prefer to follow the installer path method, I won't be disappointed in you.

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

Check the contents of your newly created `www` to ensure that you have your Drupal root. Or better still, visit `http://192.168.33.99/`, log in, and ensure that `features` is available for you to enable now.

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
You can view/fork my no-excuses-example [here](https://github.com/craychee/no-excuses-Drupal/tree/0.3.0).

####Great ...Now what?
You will be adding **contrib** modules side `composer.json` (and running `composer update`) or you can use `composer require [...]`. As for the rest, if you are using my method of assembling Drupal root, you will add custom modules inside a **modules** directory inside the project root and custom themes inside **themes** directory. You will only be commiting your own work and configuration along with your composer.json.

**Coming soon:** No Excuses Part IV: Time to test.
