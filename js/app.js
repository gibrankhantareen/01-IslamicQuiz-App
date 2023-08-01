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

function startQuiz() {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('main-buttons').style.display = 'none';
    document.getElementById('quiz-level-screen').style.display = 'block';
}

function startLevel(level) {
    document.getElementById('quiz-level-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    loadQuestion(level);
}

var currentQuestionIndex = 0;

var questions = {
    'Beginner': [
        { question: 'What is the first pillar of Islam?', options: ['Salah', 'Shahada', 'Zakat', 'Hajj'], correctAnswer: 1 },
        { question: 'What is the holy book of Islam?', options: ['Bible', 'Quran', 'Torah', 'Vedas'], correctAnswer: 1 },
        { question: 'Who is the last prophet in Islam?', options: ['Adam', 'Moses', 'Jesus', 'Muhammad'], correctAnswer: 3 },
    ],
    'Normal': [
        { question: 'What is the Islamic term for fasting?', options: ['Salah', 'Sawm', 'Zakat', 'Hajj'], correctAnswer: 1 },
        { question: 'Which angel revealed the Quran to Muhammad?', options: ['Michael', 'Gabriel', 'Raphael', 'Uriel'], correctAnswer: 1 },
    ],
    'Medium': [
        { question: 'What is the minimum amount of wealth required for Zakat?', options: ['Nisab', 'Riba', 'Fidya', 'Kaffara'], correctAnswer: 0 },
        { question: 'Which battle was fought in Ramadan in the 2nd year of Hijra?', options: ['Uhud', 'Badr', 'Khandaq', 'Tabuk'], correctAnswer: 1 },
    ],
    'Hard': [
        { question: 'What is the name of the treaty that was signed between the Muslims and the Quraysh?', options: ['Treaty of Hudaybiyyah', 'Treaty of Taif', 'Treaty of Medina', 'Treaty of Mecca'], correctAnswer: 0 },
        { question: 'Which companion was given the title "Sword of Allah"?', options: ['Umar ibn al-Khattab', 'Ali ibn Abi Talib', 'Khalid ibn al-Walid', 'Abu Bakr al-Siddiq'], correctAnswer: 2 },
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

function checkAnswer(selectedOption) {
    var level = 'Beginner'; // Update this based on the selected level
    var correctAnswer = questions[level][currentQuestionIndex].correctAnswer;
    var userId = firebase.auth().currentUser.uid;

    firebase.database().ref('users/' + userId).once('value').then(function(snapshot) {
        var userData = snapshot.val();

        if (points > userData.highScore) {
            firebase.database().ref('users/' + userId).update({
                highScore: points,
                highScoreDate: new Date().toLocaleDateString()
            });
        }

        if (selectedOption === correctAnswer) {
            points += 5;
            firebase.database().ref('users/' + userId).update({
                points: points
            });
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
