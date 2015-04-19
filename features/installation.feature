@api
Feature: Installation Verification
  As the editor of craychee,
  I want to know that the blog has installed,
  So that I can rely on the build for my project.

  Scenario: Verify that the site and its variables are installed.
    Given I am on homepage
    Then I should see "Craychee"
    And I should see "I make websites. I made this one."
