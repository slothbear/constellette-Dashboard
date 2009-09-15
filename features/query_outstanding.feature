Feature: player queries outstanding players
   As a player
   I want to know how many players still need to submit their orders
   So that I can plan when to submit my orders
   And I won't be the last player, holding up the turn

   Scenario: query players without orders
      Given there is a game in progress
      When I display the widget
      Then the widget shows the number of players without orders

