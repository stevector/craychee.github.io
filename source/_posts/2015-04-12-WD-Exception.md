---
title: WD php: Exception: To start over, you must empty your existing database.
tags:
- troubleshooting
- Drupal
categories:
    - Drupal

---
So, you got the error `WD php: Exception: To start over, you must empty your existing database.` when attempting a `drush si`?

But you're a professional developer, how is this possible?

After you have checked that `php5-mysql` is installed and your `settings.php` points to a database that exists,
try pointing your host to your local ip rather than `localhost`:

    $databases['default']['default'] = array(
      'driver' => 'mysql',
       'database' => 'your_database',
       'username' => 'your_username',
       'password' => 'your_password',
       'host' => '127.0.0.1',
       'prefix' => '',
       );

I ran into this when automating a test built on [circleci][circle]. And this resolved it:

[circle]:https://circleci.com


~~~php
       'host' => '127.0.0.1',
~~~

Hope it saves some developer a bruised forehead and an identity crisis.
