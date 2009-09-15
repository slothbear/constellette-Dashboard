Feature: player queries outstanding players
   As a player
   I want to know how many players still need to submit their orders
   So that I can plan when to submit my orders
   And I won't be the last player, holding up the turn

   Scenario: query players without orders
      Given there is a game in progress
      When I display the widget
      Then the widget shows the number of players without orders

	Scenario: enter my credentials and query outstanding
	  Given there is a game in progress called northern6i
	  When I display the widget for the first time
	  And press the little (i) to switch to the back panel
	  And enter my id constella, password redacted, and game name northern6i
	  And press the Done button
	  Then the front panel is displayed
	  And displays the game name northern6i
	  And updates the number of players outstanding
	
	Scenario: update number of players outstanding upon display
	  Given the game specified on the back panel is in progress
	  When I display the widget
	  Then the widget displays the current number of players without orders
	
	
	
	
	
	

