
app.controller('AdminCtrl', function($scope, $interval, socket) {

	$scope.generatedLetters = [
		{ letter:"", selected: false },
		{ letter:"", selected: false },
		{ letter:"", selected: false },
		{ letter:"", selected: false },
		{ letter:"", selected: false },
		{ letter:"", selected: false },
		{ letter:"", selected: false },
		{ letter:"", selected: false },
	];

	$scope.currentIndex = 0;

	$scope.users = [];

	$scope.state = 'newround';

	$scope.presenterTimer = 5;

	$scope.roundState = '';

	var audioClock = new Audio("sound/clock-ticking.wav");
	var audioClong = new Audio("sound/clong.wav");


	socket.on('user:join', function (data) {
	    $scope.users.push({name: data.name, points: 0});

	    console.log(data.name);
  	});

  	socket.on('user:submit', function(data) {
  		
  		angular.forEach($scope.users, function(value, key) {
  			if(value.name == data.name) {
  				value.word = data.word;
  			}
  		});

  	});

  	socket.emit('presenter:join', {});

	$scope.startGame = function(){
		console.log('start game');

		$scope.state = 'roundplaying';

		startCountdown(function() {
			// Start the 30 second timer!
			runRound(function() {
				// Show the post-round screen
				console.log('round done!');
				
				finishRound();
			});
		});
	};

	function startCountdown(callback){
		var count = 5;

		$scope.roundState = 'countdown';
		

	    $interval(function() {
	        socket.emit('game:countdown', { seconds: count });
	        $scope.presenterTimer = count;
	        count--;

	        if(count == -1) {
	            callback();

	            $interval.cancel();
	        }
	    }, 1000);
	}

	function runRound(callback) {
		console.log($scope.ad)
		audioClock.play();

		$scope.roundState = 'playing';

		var count = 10;
	    $interval(function() {
	        socket.emit('game:round', { seconds: count });
	        $scope.presenterTimer = count;
	        count--;

	        if(count == -1) {
	            callback();

	            $interval.cancel();
	        }
	    }, 1000);
	}

	function finishRound() {
		socket.emit('game:endround', {});

		audioClock.pause();
		audioClong.play();

		$scope.state = 'roundfinished';
		$scope.roundState = 'roundfinished';
	}

	$scope.generateVowel = function(){
		var vowels = ['A', 'E', 'I', 'O', 'U'];
		var random = Math.round(Math.random() * (vowels.length-1));
		console.log(random);

		var newLetter = vowels[random];

		$scope.generatedLetters[$scope.currentIndex].letter = newLetter;
		$scope.currentIndex++;

		sendLetter(newLetter);
	};

	$scope.generateConsonant = function(){
		var consonant = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'X', 'Z', 'W', 'Y'];
		var random = Math.round(Math.random() * (consonant.length-1));

		var newLetter = consonant[random];

		$scope.generatedLetters[$scope.currentIndex].letter = newLetter;
		$scope.currentIndex++;

		sendLetter(newLetter);
	};

	function sendLetter(letter) {
		console.log('Pushing letter: ' + letter);

		socket.emit('game:letterselected', { letter: letter });
	};

	$scope.disqualify = function(user) {
		user.word = "";
	}

	$scope.nextRound = function() {
		$scope.generatedLetters = [
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
			{ letter:"", selected: false },
		];
		$scope.currentIndex = 0;

		angular.forEach($scope.users, function(value, key){ 
			if(value.word){
				value.points += value.word.length;
			}
		});

		$scope.state = 'newround';
	}

});