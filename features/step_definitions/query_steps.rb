Given /^there is a game in progress$/ do
  # game northern6i in progress
end

When /^I display the widget$/ do
  # load()/show()/retrieveGameStatus()
end

Then /^the widget shows the number of players without orders$/ do
  # processGames()/set numWaitingFor
end


Given /^there is a game in progress called northern6i$/ do
  # joined 15Sep09
end

When /^I display the widget for the first time$/ do
  # no preferences, no values for game/password/id
end


When /^press the little \(i\) to switch to the back panel$/ do
  # pressed
end

When /^enter my id constella, password redacted, and game name northern6i$/ do
  # entered
end

When /^press the Done button$/ do
  # pressed
end

Then /^the front panel is displayed$/ do
  # done by Done/showFront()/
end

Then /^displays the game name northern6i$/ do
  # displays game name
end

Then /^updates the number of players outstanding$/ do
  # updated both with mock data and real server
end



Given /^the game specified on the back panel is in progress$/ do
  # well it's in progress!
end

Then /^the widget displays the current number of players without orders$/ do
  # displays correctly for mock data and newly entered prefs
end
