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

	$scope.selectLetter = function(letter, array){
		letter.selected = letter.selected ? false : true;

		if(array == 'in'){
			$scope.inSelected = letter.selected ? true : false;
		}else{
			$scope.outSelected = letter.selected ? true : false;
		}

		if($scope.inSelected && $scope.outSelected){
			$scope.swapLetters();
			$scope.inSelected = false;
			$scope.outSelected = false;
		}
	}
	
	$scope.swapLetters = function(){
		var inIndex = 0;
		var outIndex = 0;

		angular.forEach($scope.lettersIn, function(letter, key){
			if(letter.selected){
				letter.selected = false;
				inIndex = key;
			}
		});

		angular.forEach($scope.lettersOut, function(letter, key){
			if(letter.selected){
				letter.selected = false;
				outIndex = key;
			}
		});

		//swap letters
		var inLetter = $scope.lettersIn[inIndex].letter;
		$scope.lettersIn[inIndex].letter = $scope.lettersOut[outIndex].letter;
		$scope.lettersOut[outIndex].letter = inLetter;
	};

	$scope.joinGame = function(){
		console.log('join game');

		socket.emit('user:join', {
      		name: $scope.name
    	});

    	$scope.state = 'game';
	};

});