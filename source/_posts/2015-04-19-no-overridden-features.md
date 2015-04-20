---
title: Add this to your automated tests: check for overridden features
tags:
- automated testing
- Drupal
categories:
    - Testing
    - Drupal

---
If you are automating your Drupal test, you have automated your Drupal build. If you have automated your Drupal build, you have exported your config. If you have exported your config, you are using features. If you are using features, it is only a matter of time before they are overridden and become a black hole of uselessness.

Don't let that happen. You are doing everything else right.

In your `circle.yml` or your `.travis.yml` add these lines:

~~~php
# Under your travis script or your circleci tests:
...
  - >
    drush fl
    | grep -qi 'overridden'
    && (echo 'Feature override test: fail' && exit 1)
    || (echo 'Feature override test: pass' && exit 0)
~~~

Guard build from uncertainty.