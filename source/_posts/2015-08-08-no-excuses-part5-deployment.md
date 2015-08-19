---
title: No Excuses Part V: Automated Deployment
tags:
- Ansible
- php
- Pantheon
- CI
categories:
    - devops
    - CI
    - configuration management
description: In the last part of our No Excuses series, we are going to automate our deployment.
---

**NOTE** This post is the conclusion of a series that included [No Excuses Part I](http://craychee.io/blog/2015/05/20/no-excuse-config-management-Drupal/), [No Excuses Part II](http://craychee.io/blog/2015/07/29/no-excuses-Drupal-config/), [No Excuses Part III](http://craychee.io/blog/2015/08/01/no-excuses-part3-composer/), and [No Excuses Part IV](http://craychee.io/blog/2015/08/04/no-excuses-part4-testing/).

You're not legit until the only thing that's deploying your code is a CI server.

In this the last part of our series we are going to put all of our work making our build executable and repeatable and testable to its fullest fruition: with automated deployment.

###Step One: Create a Pantheon site.

Head over to [Pantheon](https://pantheon.io/) and create a free account if you don't have one.

Once you have an account, create a site by instantiated a Drupal 7 from scratch. Don't overthink it. We just need the database to be generated. (There must be another way around this but this is the best way that I have found to instantiate a site on Pantheon where what I need is a database instance and a codebase.)

When your new site is set up and you are taken to the dashboard for the new project, make sure that you set `Connection Mode` to "git".

###Step Two: Generate SSH Key

We are going to create an ssh key just for deployment. We will put the private key on circleCI and the public key on Pantheon. Then those two can talk it out.

From the command line, run `ssh-keygen`. Don't save the file into `.ssh`. You can call it whatever you would like. I will call mine `deploy_key`.

**Do not** create a passphrase.

On Pantheon, go to *My Dashboard* >> *Account* >> *SSH Keys* and save your ssh key ending in `.pub`. Over on CircleCI, go to *Settings* >> *Permissions* >> *SSH Permissions* and add your private key (the one that does not end in .pub).

You are all set up for the two to talk to each other. You can delete the ssh keys on your local machine.

###Step Three: Define what should go on production and what shouldn't

Since we are going to deploy (and *only* deploy) the code that belongs on production to Pantheon, we need to separate out code that shouldn't be on production into Composer's `require-dev` section.

For example, I don't need Drush or the Drupal Behat Extension on production so my `composer.json` will look like:
~~~json
[...]
    "require": {
        "pantheon-systems/drops-7": "7.38",
        "craychee/rootcanal": "dev-master",
        "drupal/features": "~7.2"
    },
    "require-dev": {
        "drush/drush": "7.*",
        "drupal/drupal-extension": "~3.0"
    },
[...]
~~~

###Step Four: Add Custom Variables to CircleCi

Over on CircleCI, go to *Settings* >> *Tweaks* >> *Environment variables*.

![CircleCI Environment Variable screenshot](/img/circleci_custom_variables.jpg)  

**Create and Save the following variables:**  
PANTHEON_EMAIL: This should be the email of either your account or another account that also has access to the Pantheon project you just set up.  
PANTHEON_PASSWORD: This should be the email of either your account or another account that also has access to the Pantheon project you just set up.  
PANTHEON_CODE This should be the repository URL for the project that you created on Pantheon, ending in `.git`. You can get to this by clicking on "Connection Info" over at Pantheon. Note that when you copy the repository, it will have the name of your site appended to it after `.git`. Remove that bit.  

**Note** that my instructions above have you deploy with your Pantheon user account. If you work on a team or for a dev shop, you should consider creating a separate user that has access to your sites that you use only for deployment.

###Step Five: Add a deployment script

Inside the `bin` directory, create a file called `deploy` and add these contents:
~~~sh
#!/bin/bash

set -e

# Get Pantheon's Command Line Tool, terminus.
sudo curl https://github.com/pantheon-systems/cli/releases/download/0.5.5/terminus.phar -L -o /usr/local/bin/terminus && sudo chmod +x /usr/local/bin/terminus

# Log into terminus.
terminus auth login $PANTHEON_EMAIL --password=$PANTHEON_PASSWORD

# Clone deployment repository.
expect <<delim
  set timeout 60
  eval spawn git clone $PANTHEON_CODE pantheon
  set prompt ":|#|\\\$"
  interact -o -nobuffer -re $prompt return
  send "$PANTHEON_PASSWORD\r"
expect eof
delim

# Set variables
path=$(dirname "$0")
base=$(cd $path/.. && pwd)
pantheon=$base/pantheon
git="( $base/pantheon && git $git_flags)"

# Build the deployment artifact.
rm $base/cnf/settings.php
mv $base/cnf/pantheon.settings.php $base/cnf/settings.php

# Use this bit only if you are using my method of using Composer.
$base/bin/rootcanal --prod

# Add deployment artifact to the repository.
rm -Rf $pantheon/*
mv $base/www/* $pantheon/

# configure git env
git config --global user.email $PANTHEON_EMAIL
git config --global user.name $CIRCLE_PROJECT_USERNAME

# checkout publish branch
(cd $pantheon ; git checkout -b publish)
(cd $pantheon ; git branch -D master)
(cd $pantheon ; git checkout -b master)

# commit build
(cd $pantheon ; git add -Af)
(cd $pantheon ; git commit -m "Successful verified merge of $CIRCLE_PROJECT_USERNAME $CIRCLE_SHA1.")

# push to Pantheon
(cd $pantheon ; git push -f origin master)
~~~
This script gets [terminus](https://github.com/pantheon-systems/cli), Pantheon's command line tool, gets Pantheon's repository, rebuilds the Drupal root by coping everything over (use only if you are building Drupal with Composer using my suggested method, per [Part III](blog/2015/08/01/no-excuses-part3-composer/)), and then forceably commits only the Drupal root (not any of your provisioning or your `Vagrantfile`) to its repository. Your production repository will be a separate repository that is just an *artifact* of development.

Make sure that you update your `.gitignore` (if you are ignoring any executables in `bin`) so that you can ensure that this file is saved to your repository.

Now create a file called `pantheon.settings.php` and save it inside of `cnf` with the following contents:
~~~php
<?php
require_once DRUPAL_ROOT . '/sites/default/vendor/autoload.php';
~~~

###Step Six: Add Deployment to CircleCI

Add this to the bottom of your `circle.yml`:  
~~~yml
[...]

deployment:
  pantheon:
    branch: master
    commands:
      - composer install --no-dev --no-scripts
      - build/install.sh
      - bin/deploy
      - mysqldump -u ubuntu circle_test > pantheon.sql
      - terminus drush sqlc < pantheon.sql --site=no-excuses --env=dev
      - terminus site clear-caches --site=no-excuses --env=dev
~~~
Where I am passing the attribute `--site=no-excuses`, you should replace it with your Pantheon's site name.

What this bit tells circleCI is that on a successful merge to master (all tests pass), rebuild composer's vendor leaving out projects that are only needed for dev (like drush and behat), rebuild the Drupal project (in case there is any content or users remaining from the Behat tests, which can happen), commit and push only the resulting Drupal root to Pantheon's repository that is tagged with the hash of the development commit that builds it, and then push the database to Pantheon.

And with that, you have defined your deployment and the conditions that a deployment will occur, made it executable, and automated it.

Congratulations. You have achieved the gold standard of a development workflow.

**Want to make sure you followed all of my instructions?**
You can view/fork my no-excuses-example [here](https://github.com/craychee/no-excuses-Drupal/tree/0.5.0).

####Great ...Now what?
At the end of this series, you have been introduced to a lot of tools that can be iterated on endlessly. You could go back to Part I, where we made our system explicit, and ensure that your environment has more of the tools that you need. Perhaps instead of a bash script that makes your build explicit (as we did in Part II), you want to use [Gulp](http://gulpjs.com/) or [Grunt](http://gruntjs.com/) or [Drupal Console](http://drupalconsole.com/) to manage your build. Have Ansible install the requirements for the project of your choice.

There is always more that you can do with testing. Consider taking on not just a test driven development approach but a behavior driven development approach (see Dan North's seminal [blog post](http://dannorth.net/introducing-bdd/) to help understand the distinction) using Behat. Imagine if all of your features were built with human readable tests. Imagine running those tests throughout the project's lifecycle. You can do that now. You have the tools and the automation.

Once you have good system test coverage, build your custom code with unit tests (I highly recommend [phpspec](http://www.phpspec.net/en/latest/)). Add accessibility tests with tools like [a11y](http://a11yproject.com/). Add visual regression testing with [Wraith](https://github.com/BBC-News/wraith). Find tools that help you define done, get you to done, and ensure that you stay done.

You may (and almost certainly will) find that this way of working is so much better that you will want to convert existing projects into this model. Since we have abstracted the deployment process into a separate repository from the production repository, it will be easier for you to add this tooling around an existing repository that can then only contain the resulting product of your process.

I will be writing more about these and other topics in the coming months. Stayed tuned and tell me what you are working on or what you would like to see.

