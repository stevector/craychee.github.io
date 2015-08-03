---
title: Fooling Behat into Using Phantomjs rather than Selenium
tags:
- automated testing
- CI
- Drupal
categories:
    - automated testing
    - Drupal
description: Here's a special April Fool's Day trick for Behat: swap out your Selenium Driver with Phantomjs for better performance.
---
Here's a special April Fool's Day trick for Behat: swap out your Selenium Driver with Phantomjs.

**Materials that you will need:**

- Phantomjs
~~~php
# Somewhere in your provisioning script.
wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-linux-x86_64.tar.bz2 -O - | tar xj -C /tmp
cp /tmp/phantom*/bin/phantomjs /opt
~~~
  
- A browser
~~~php
# Somewhere in that same provisioning script.
sudo apt-get update -y && sudo apt-get install -q -y iceweasel
~~~

Kick that driver into gear:
~~~php
# Somewhere in that same provisioning script.
/opt/phantomjs --webdriver=8643 &> /dev/null &
~~~

Now here is the tricky part, in your `behat.yml` tell behat to use the Selenium Driver at the same point where you have phantomjs listening:
~~~php
# Your behat.yml
...
  extensions:
    Behat\MinkExtension:
      goutte: ~
      selenium2:
        wd_host: "http://127.0.0.1:8643/wd/hub"
      base_url: http://your-alias.dev
~~~

Behat will get the last laugh, though: phantomjs is far more efficient than Selenium.
