---
title: Introducing the No Excuses Series
tags:
- Ansible
- php
- Pantheon
- CI
categories:
    - devops
    - CI
    - configuration management
description: Introducing the complete 5 part series to make your Drupal workflow modern and sane.
---

A few weeks ago I had the pleasure of talking about Drupal and Continuous Integration with Mike Anello, Ted Bowman, and Ryan Price over at [DrupalEasy](http://drupaleasy.com/podcast/2015/08/drupaleasy-podcast-160-shamed-michelle-krejci-automated-drupal-deployment). During that conversation, I maintained that the barrier of entry is now low enough that there is now no excuse for not implementing a continuous integration workflow.

To prove it, I created the No Excuses series. In five parts, I walk through the basics to get a CI workflow set up for your Drupal process.

In this series, I share how to establish a known-state (via ansible and vagrant), how to make your project build explicit and executable (via bash), how to add testing to define and verify a feature's completion (via behat), how to automate the build and the tests with a CI server (via CircleCI), and finally, how to automate the deployment.

**Part I: [Drupal-optomized Environment Config with (Ph)Ansible and Vagrant](/blog/2015/05/20/no-excuse-config-management-drupal/)**  
**Part II: [Making your Drupal Build explicit and executable](/blog/2015/07/29/no-excuses-part2-drupal-config/)**  
**Part III: [Build drupal with Composer](/blog/2015/08/01/no-excuses-part3-composer/)**  
**Part IV: [System testing Drupal with a BDD tool (Behat)](/blog/2015/08/04/no-excuses-part4-testing/)**  
**Part V: [Automated Deployment](/blog/2015/08/08/no-excuses-part5-deployment/)**  

The series was written to be followed in order but you could, of course, take from it what is most immediately applicable to you.

This series is meant to be the first iteration: the quickest way that I could come up with to get these tools in your hands so that you can start doing what you know you should be doing. I have vague plans to follow-up with an iteration two, where I go back and improve upon everything we have done here, but my experience has also shown me that once developers have the tools and know how to use them, they can improve upon their usage easily themselves.

I would love to know what you think of the series and what you would like to see in a possible feature series. Feel free to reach out to me over [twitter](https://twitter.com/dev_meshev) or via email below.

**UPDATE** [Jeff Geerling](http://jeffgeerling.com/) is offering a coupon for 50% off the recommended price for his recently published book *Ansible for DevOps: Server and configuration management for humans* to reader's of this series who want to learn more about Ansible: [http://leanpub.com/ansible-for-devops/c/zDAUa4QMP1CL)](http://leanpub.com/ansible-for-devops/c/zDAUa4QMP1CL). If I do my job right, that will be everyone.
