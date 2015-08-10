---
title: No Excuses Part IV: System testing Drupal with a BDD tool (Behat)
tags:
- Ansible
- php
- Pantheon
- CI
categories:
    - devops
    - CI
    - configuration management
description: Finally, we will set up some tests. We are going to add Behat for system testing and test our build with each commit on a CI server.
---

**NOTE** This post is a continuation of [No Excuses Part I](http://craychee.io/blog/2015/05/20/no-excuse-config-management-Drupal/), [No Excuses Part II](http://craychee.io/blog/2015/07/29/no-excuses-Drupal-config/), and [No Excuses Part III](http://craychee.io/blog/2015/08/01/no-excuses-part3-composer/).

Continuous Integration has become synonmous with testing and automation. In order to merge and push code together on a tight iteration, assurances and checkpoints must be built into the system.

But there are other reasons to test. Among them, defining 'done' with a client and translating the definition of done into code so that we can know when a feature is complete. It adds focus to the process, documentation to the project, and regression testing to the project's lifecycle. Making the definition of done executable means you can ask "is it done?" and "has it stayed done?".

[Behat](http://behat.readthedocs.org/en/v3.0/), a [Behavior Driven Development](http://dannorth.net/whats-in-a-story/) tool, supports this goal.

Today we are going to set Behat up, add a test, and run that test with an automated CI server with every push to github.

Hang onto your butts, this one is going to be an awesomely wild adventure.

###Step One: Install and Configure Behat (the Drupal Extension)

With Composer already installed (thanks, Ansible), and a composer.json already defined in our project root (see [here](https://getcomposer.org/doc/01-basic-usage.md#composer-json-project-setup) if you skipped No Excuses Part III), we only need to add Behat as a dependency.

Update your `composer.json` so that it includes:
~~~json
[...]
  "require": {
  [...]
      "drush/drush": "7.*",
      "drupal/drupal-extension": "~3.0"
   },
   "config": {
      "bin-dir": "bin/"
   }
[...]
~~~
From inside your running vagrant box (`vagrant up` if you shut it down, and `vagrant ssh` if you are no longer logged in), run `composer update`. The Drupal Behat Extension and its dependencies will be downloaded. We will get to why we added drush in a bit.

Now we need to add a [configuration file](http://behat.readthedocs.org/en/v3.0/guides/6.profiles.html) for Behat. This is what ours will look like:
~~~yml
default:
  suites:
    default:
      contexts:
      - FeatureContext
      - Drupal\DrupalExtension\Context\DrupalContext
      - Drupal\DrupalExtension\Context\RawDrupalContext
      - Drupal\DrupalExtension\Context\MinkContext
      - Drupal\DrupalExtension\Context\MessageContext
      - Drupal\DrupalExtension\Context\DrushContext
  extensions:
    Behat\MinkExtension:
      goutte: ~
      selenium2:
        wd_host: "http://127.0.0.1:8643/wd/hub"
      base_url: http://localhost
    Drupal\DrupalExtension:
      blackbox: ~
      api_driver: 'drupal'
      drupal:
        drupal_root: 'www'
~~~
Add these contents into a file called `behat.yml` and save it in your project root.

We just installed the Drupal Extension for Behat. You can and should read more about the extension [here](http://behat-drupal-extension.readthedocs.org/en/latest/index.html). But "I haven't read the docs yet" is an excuse that hasn't held you up before so why start now? 

Now run `bin/behat --init` inside your vagrant box. If successful, you should see:
~~~
vagrant@no-excuses:/vagrant$ bin/behat --init
+d features - place your *.feature files here
+d features/bootstrap - place your context classes here
+f features/bootstrap/FeatureContext.php - place your definitions, transformations and hooks here
~~~
These are directories and files that Behat has set up for you. Run `bin/behat -dl` and you can see all the predefined step definitions that we can use to start writing tests.

###Step Two: Write our first test.

Let's write a test then.

Inside the `features` directory that Behat created for you, make a test file called `installation.feature`. We are going to add a test that verifies a.) the site is up, and b.) that a user can login.
Put this into your newly created file, add this:
~~~
@api
Feature: Installation Verification
  As a developer,
  I want to know that my project has installed,
  So that I can smoke test craychee's work.

  Scenario: Verify that the site and its variables are installed.
    Given I am on homepage
    Then I should see the text "Welcome to no-excuses"

  Scenario: Verify that user 1 can log into the site.
    Given I am not logged in
    When I visit "user/login"
    And I fill in "name" with "admin"
    And I fill in "pass" with "admin"
    And I press "Log in"
    Then I should see the link "Log out"
    And I should see the link "Add content"
~~~
Note that the text "Welcome to no-excuses" is the text that I am expecting since "no-excuses" is the name of my example project. This text will be different if you have named you project something other than "no-excuses".

This test is a great start because it allows us to verify that our site is built properly and we can log into it as expected. This is especially important if we are testing our build without access to a browser GUI, such as on a CI Server.

###Step Three: Run that test on a CI Server

**Prerequisites setup**  
You need to have a [GitHub](https://github.com/) account.  
You need to make [your project a repository](https://help.github.com/articles/create-a-repo/) on your GitHub account.  
Sign up for a free account on [circleCI](https://circleci.com/).  

Great. Now we are going to add some files to explain to circleCI how to build our Drupal project in the same way that we are building our Drupal project locally. I go through a bit more explaination about what I am doing in the [previous blog post](http://craychee.io/blog/2015/04/11/circleci/). For now, you are going to need to just trust me. Yikes.

First, navigate to your `cnf` directory and create a file called `circle.conf`. Add these contents:
~~~conf
<VirtualHost *:80>
    UseCanonicalName Off
    DocumentRoot %HOME%/%PROJECT_DIR%
    ServerName %SERVER%

  <Directory %HOME%/*>
    Options FollowSymLinks
    AllowOverride None
    RewriteEngine On
    RewriteBase /
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule %HOME%/%PROJECT_DIR%/(.*)$ index.php/?q=$1 [L,QSA]
    Order allow,deny
    Allow from all
  </Directory>

  <Directory />
    Options FollowSymLinks
    AllowOverride None
  </Directory>
</VirtualHost>
~~~
This is the webserver configuration for our project, so Apache2 knows where Drupal is.

While still inside `cnf`, create a file called `circle.settings.php`. Add these contents:
~~~php
<?php
$db_url='mysql://ubuntu:@localhost/circle_test';
$databases=array('default' => array(
    'default' => array(
        'database' => 'circle_test',
        'username' => 'ubuntu',
        'password' => '',
        'driver' => 'mysql',
        'host' => '127.0.0.1',
    ),
),);
$drupal_hash_salt='161302b5bf927369e7c370212318c8f1837b03bbecb94eadb9eeed17a7875d1e';
~~~
Remember how we set up the build to just copy in the `settings.php` into Drupal before running site install because the connection information would be different per environment? 

Now return to the project root. Create a file called `circle.yml` and add these contents:
~~~yml
machine:
  php:
    version: 5.5.21

dependencies:
  pre:
    - cp $HOME/$CIRCLE_PROJECT_REPONAME/cnf/circle.conf /etc/apache2/sites-available/default
    - sudo sed -e "s?%HOME%?$(pwd)?g" --in-place /etc/apache2/sites-available/default
    - sudo sed -e "s?%PROJECT_DIR%?www?g" --in-place /etc/apache2/sites-available/default
    - echo "sendmail_path=/bin/true" >> ~/.phpenv/versions/$(phpenv version-name)/etc/php.ini
    - sudo a2enmod rewrite
    - sudo service apache2 restart
    - cp cnf/circle.settings.php cnf/settings.php
  override:
    - composer install --prefer-dist
  post:
    - sudo chown -R $(whoami):www-data www
    - build/install.sh

test:
  override:
      - bin/behat
~~~
These are instructions for circleCI to build our project and, after configuring Apache2, they are identical from our local build: run composer install and then `build/install.sh` to build the project, then run `bin/behat` to verify everything is working as expected.

Since circleCI doesn't have Drush installed and our version of Drush, installed with `apt-get`, is outdated anyway, we added Drush to the project with composer instead. Now we can tell our build to use that version of Drush instead when building our project.

Open your `build/install.sh` for editing. Where we are setting the `drush` variable (line 6), change it instead to:
~~~sh
drush="$base/bin/drush $drush_flags -y -r $base/www"
~~~

Great. Now circleCI will be able to use the same version of Drush that we are.

Make sure all your files are added and pushed to GitHub. (If you are new to GitHub, [this](https://help.github.com/articles/adding-an-existing-project-to-github-using-the-command-line/) should get you started.) Go to [add projects](https://circleci.com/add-projects), find your project, and click "Build Project".

Now sit back and watch your project build and test itself.

**Want to make sure you followed all of my instructions?**
You can view/fork my no-excuses-example [here](https://github.com/craychee/no-excuses-Drupal/tree/0.4.0).

####Great ...Now what?
You are going to need to catch yourself up on writing tests for Drupal with Behat. I recommend [Jack Franks talk](https://www.youtube.com/watch?v=i6-940AnZxc).

When should you write tests? Early and often.

**Coming soon:** No Excuses Part V: Automated Deployment
