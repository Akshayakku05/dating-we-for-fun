let score = 0;
let startTime;
APPSCRIPT_URL = `


https://script.google.com/macros/s/AKfycbxFzsHMDymNhAqfpxoXdzrHvNYo0IfmjWiUpjY9fy_cf_7WoUnJh8ZAZ8B4cEGgAGQV/exec

            `.trim()
function startGame() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('Please enter your name!');
        return;
    }
    document.getElementById('nameStep').style.display = 'none';
    document.getElementById('gameStep').style.display = 'block';
    startTime = new Date();
}

function moveNoButton() {
    const noButton = document.querySelector('.no');
    const x = Math.random() * (window.innerWidth - noButton.offsetWidth);
    const y = Math.random() * (window.innerHeight - noButton.offsetHeight);
    noButton.style.left = `${x}px`;
    noButton.style.top = `${y}px`;
    score += 1;
}

async function showMessage() {
    const playerName = document.getElementById('playerName').value;
    const endTime = new Date();
    const timeSpent = ((endTime - startTime) / 1000).toFixed(2);

    document.getElementById('gameStep').style.display = 'none';
    document.getElementById('leaderboardStep').style.display = 'block';
    document.getElementById('scoreBody').innerHTML = '<tr><td colspan="3">Loading scores...</td></tr>';

    const scoreData = {
        Name: playerName,
        Score: score,
        Time: timeSpent
    };

    try {
        const message = document.createElement('p');
        message.innerHTML = `Let's go on a date! ❤️<br>Your score: ${score}<br>Time: ${timeSpent}s`;
        document.getElementById('leaderboardStep').prepend(message);
        
        await fetch(APPSCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(scoreData)
        });

        setTimeout(async () => {
            await fetchLeaderboard();
        }, 1000);

    } catch (error) {
        console.log('Error:', error);
        document.getElementById('scoreBody').innerHTML = '<tr><td colspan="3">Error loading scores</td></tr>';
    }
}


async function fetchLeaderboard() {
    try {
        const response = await fetch(APPSCRIPT_URL);
        const data = await response.json();
        const scoreBody = document.getElementById('scoreBody');
        scoreBody.innerHTML = '';

        data.forEach(entry => {
            const row = `<tr>
            <td>${entry.Name}</td>
            <td>${entry.Score}</td>
            <td>${entry.Time}</td>
        </tr>`;
            scoreBody.innerHTML += row;
        });
    } catch (error) {
        console.log('Error fetching leaderboard:', error);
    }
}
