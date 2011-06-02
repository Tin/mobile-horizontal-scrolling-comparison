Mobile horizontal scrolling comparison
=============

We are building a horizontal scrolling widget to show some pictures in web page. This page is supposed to work under both Android and iOS devices, both tablet and phone. Acctually it's a vertical scrollable pane with swipe supports. Our homebrew version is under refactoring, and we are also reviewing other scrolling libraries, and steal some good parts from their codes in parallel. This codes is a test to tracking what we tried and how it feels. Currently I'm focusing on Android (Honeycomb 3.1) perfromance issues, so this is mostly tested.

Third Party Libraries
------

I include scrollability and iScroll in this test.

Our implementations
------

* We have one swipe function called swipeIt, it's developed by my colleague Alex.
* We add another swipe function called gSwipe which is inspired by google's mobile image search implementation, they doesn't play animation when 'touchmove'. It's not as responsible as common swipe library, but feels snappier on android devices ( which has bad css animation hardware acceleration ).
