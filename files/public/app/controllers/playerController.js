app.controller('GameCtrl', function($scope, socket) {

	$scope.name = '';

	$scope.inSelected = false;
	$scope.outSelected = false;

	$scope.timer = 10;

	$scope.state = 'join';

	var selectedIndex = 0;
	
	function reset(){

		selectedIndex = 0;

		$scope.lettersIn = [
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
		];
		$scope.lettersOut = [
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
		];
	}

	reset();

	socket.on('news', function (data) {
  		console.log(data);
	});

	socket.on('game:letterselected', function(data) {
		console.log("Got new letter! " + data.letter);

		$scope.lettersIn[selectedIndex] = { letter: data.letter, selected: false };

		selectedIndex++;
	});

	socket.on('game:countdown', function(data) {
		$scope.roundState = 'countdown';

		$scope.timer = data.seconds;
	});

	socket.on('game:round', function(data) {
		$scope.roundState = 'playing';

		$scope.timer = data.seconds;
	});

	socket.on('game:endround', function(data) {
		$scope.roundState = 'ended';

		var word = [];

		angular.forEach($scope.lettersOut, function(value, key) {
			if(value.letter != "")
			{
				word.push(value.letter);
			}
		});

		var wordJoined = word.join("");

		console.log("My word is: " + wordJoined);

		socket.emit('user:submit', { name: $scope.name, word: wordJoined  });

		reset();

	});

	$scope.lastSelectedLetterIndex = -1;

	$scope.selectLetter = function(letter, array){
		$scope.lastSelectedLetterIndex++;

		letter.selected = true;

		$scope.lettersOut[$scope.lastSelectedLetterIndex].letter = letter.letter;

		letter.letter = "";
	}

	$scope.undoLetter = function() {
		var selectedLetter = $scope.lettersOut[$scope.lastSelectedLetterIndex];

		if(selectedLetter != "")
		{
			var keepGoing = true;

			// find an empty slot and put the letter there
			angular.forEach($scope.lettersIn, function(letter, key){
				

				if(keepGoing && letter.selected){
					letter.selected = false;
					letter.letter = selectedLetter.letter;

					selectedLetter.letter = "";
					selectedLetter.selected = false;

					$scope.lastSelectedLetterIndex--;

					keepGoing = false;
				}
			});
		}
	}

	$scope.joinGame = function(){
		console.log('join game');

		socket.emit('user:join', {
      		name: $scope.name
    	});

    	$scope.state = 'game';
	};

});