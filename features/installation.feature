@api
Feature: Installation Verification
  As the editor of craychee,
  I want to know that the blog has installed,
  So that I can rely on the build for my project.

  Scenario: Verify that the site and its variables are installed.
    Given I am on homepage
    Then I should see "Craychee"
    And I should see "I make and test websites. This is a record of the small innovations and insights I make along the way."
    When I follow "About"
    Then I should see "About Michelle"
