// Firebase Configuration
var firebaseConfig = {
    apiKey: "AIzaSyDZhNF_mEaRlwNo1qnVFzfv3W3M4Cv6ej4",
    authDomain: "islamquiz-d8ce0.firebaseapp.com",
    databaseURL: "https://islamquiz-d8ce0-default-rtdb.firebaseio.com",
    projectId: "islamquiz-d8ce0",
    storageBucket: "islamquiz-d8ce0.appspot.com",
    messagingSenderId: "522615447008",
    appId: "1:522615447008:web:f21650769c3195f331df85",
};
firebase.initializeApp(firebaseConfig);

var provider = new firebase.auth.GoogleAuthProvider();
var points = 0;


function signInWithGoogle() {
    firebase.auth().signInWithRedirect(provider);
}


firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        var userId = user.uid;
        firebase.database().ref('users/' + userId).once('value').then(function(snapshot) {
            var userData = snapshot.val();
            var userName = user.displayName;
            points = userData ? userData.points : 0;

            document.getElementById('welcome-message').innerText = 'Welcome ' + userName + '!';
            document.getElementById('points-bar').innerText = 'Points: ' + points;

            document.getElementById('sign-in-screen').style.display = 'none';
            document.getElementById('home-screen').style.display = 'block';

            if (!userData) {
                firebase.database().ref('users/' + userId).set({
                    username: userName,
                    points: points,
                    highScore: 0,
                    highScoreDate: ''
                });
            }
        });
    } else {
        document.getElementById('sign-in-screen').style.display = 'block';
        document.getElementById('home-screen').style.display = 'none';
        document.getElementById('quiz-level-screen').style.display = 'none';
    }
});

var previousScreens = [];


function goBack() {
    var lastScreen = previousScreens.pop();
    if (lastScreen) {
        // Hide all screens
        document.getElementById('home-screen').style.display = 'none';
        document.getElementById('quiz-level-screen').style.display = 'none';
        document.getElementById('quiz-screen').style.display = 'none';
        document.getElementById('previous-results-screen').style.display = 'none';

        // Show the last screen
        document.getElementById(lastScreen).style.display = 'block';
    }
}


function goHome() {
    document.getElementById('home-screen').style.display = 'block';
    document.getElementById('quiz-level-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('previous-results-screen').style.display = 'none';
}


function startQuiz() {
    previousScreens.push('home-screen');
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('quiz-level-screen').style.display = 'block';
}


function startLevel(level) {
    previousScreens.push('quiz-level-screen');
    document.getElementById('quiz-level-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    document.getElementById('current-level').value = level; // Set the current level
    loadQuestion(level);
}


var currentQuestionIndex = 0;

var questions = {
    'Beginner': [
        { question: 'What is the first pillar of Islam?', options: ['Salah', 'Shahada', 'Zakat', 'Hajj'], correctAnswer: 1 },
        { question: 'What is the holy book of Islam?', options: ['Bible', 'Quran', 'Torah', 'Vedas'], correctAnswer: 1 },
        { question: 'Who is the last prophet in Islam?', options: ['Adam', 'Moses', 'Jesus', 'Muhammad'], correctAnswer: 3 },
    ],

    'Medium': [
        { question: 'What is the Islamic term for the moral responsibility of a person?', options: ['Taqwa', 'Amanah', 'Fitrah', 'Ibadah'], correctAnswer: 1 },
        { question: 'Which Surah of the Quran is known as the Heart of the Quran?', options: ['Surah Al-Fatiha', 'Surah Al-Ikhlas', 'Surah Ya-Sin', 'Surah Al-Mulk'], correctAnswer: 2 },
        // ... More Medium Questions ...
    ],

    'Hard': [
        { question: 'Who was the first martyr in Islam?', options: ['Hamza ibn Abdul-Muttalib', 'Bilal ibn Rabah', 'Sumayyah bint Khayyat', 'Uthman ibn Affan'], correctAnswer: 2 },
        { question: 'What is the name of the spring in Paradise from which rivers flow?', options: ['Kawthar', 'Salsabil', 'Tasneem', 'Zamzam'], correctAnswer: 0 },
        // ... More Hard Questions ...
    ]
};

function showPreviousResults() {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('previous-results-screen').style.display = 'block';
    var userId = firebase.auth().currentUser.uid;
    firebase.database().ref('users/' + userId).once('value').then(function(snapshot) {
        var userData = snapshot.val();
        document.getElementById('high-score').innerText = 'High Score: ' + userData.highScore;
        document.getElementById('high-score-date').innerText = 'Date: ' + userData.highScoreDate;
    });
}

function backToHome() {
    document.getElementById('previous-results-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'block';
}

function loadQuestion(level) {
    var questionData = questions[level][currentQuestionIndex];
    document.getElementById('question').innerText = questionData.question;
    for (var i = 0; i < 4; i++) {
        document.getElementById('option-' + i).innerText = questionData.options[i];
    }
}

function resetProgress() {
    var userId = firebase.auth().currentUser.uid;
    var userName = firebase.auth().currentUser.displayName;

    // Reset the user's data in Firebase
    firebase.database().ref('users/' + userId).set({
        username: userName,
        points: 0,
        highScore: 0,
        highScoreDate: ''
    });

    // Remove the user's answered questions
    firebase.database().ref('users/' + userId + '/questions').remove();

    // Reset the local points variable
    points = 0;

    // Update the points bar
    document.getElementById('points-bar').innerText = 'Points: 0';

    // Optionally, you can navigate the user to a different screen or show a confirmation message
    alert('Your progress has been reset.');
}


function checkAnswer(selectedOption) {
    var level = document.getElementById('current-level').value; // Get the current level
    var questionId = currentQuestionIndex; // Unique question ID
    var userId = firebase.auth().currentUser.uid;
    var correctAnswer = questions[level][currentQuestionIndex].correctAnswer;

    firebase.database().ref('users/' + userId + '/questions/' + questionId).once('value').then(function(snapshot) {
        if (snapshot.exists()) {
            // Question already answered, do not award points
            return;
        }

        if (selectedOption === correctAnswer) {
            points += 5;
            firebase.database().ref('users/' + userId).update({
                points: points
            });
            // Record the question as answered
            firebase.database().ref('users/' + userId + '/questions/' + questionId).set(true);
            document.getElementById('feedback').innerText = 'Correct! +5 points';
            document.getElementById('feedback').style.color = 'green';
        } else {
            document.getElementById('feedback').innerText = 'Incorrect! Try again.';
            document.getElementById('feedback').style.color = 'red';
        }

        document.getElementById('points-bar').innerText = 'Points: ' + points;

        currentQuestionIndex++;
        if (currentQuestionIndex < questions[level].length) {
            setTimeout(function() {
                document.getElementById('feedback').innerText = '';
                loadQuestion(level);
            }, 2000);
        } else {
            // End the quiz and show the results
        }
    });
}
