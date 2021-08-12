<script>
    import { io } from 'socket.io-client';

    // const URL = 'http://localhost:3000';
    const socket = io();

    socket.onAny((event, data) => {
        console.log(event, data);
    });

    let users = {};
    socket.on('users', (data) => {
        users = {};
        for (const user of data) {
            users[user.userId] = user;
        }
    });
    socket.on('username_change', data => {
        users = {
            ...users,
            [data.userId]: { ...users[data.userId], ...data }
        };
    })
    socket.on('user_connected', (data) => {
        users = {
            ...users,
            [data.userId]: data
        };
    });
    socket.on('user_disconnected', (data) => {
        const { [data.userId]: removed, ...rest } = users;
        users = rest;
    });

    function random(arr, n) {
        const shuffled = arr.sort(() => 0.5 - Math.random());
        let selected = shuffled.slice(0, n);
        return selected;
    }

    let mustUseWords = [];

    let inputSentence;
    $: {
        console.log(inputSentence);
        calculateWordUsage(inputSentence);
    }

    let includesWords = [];
    function calculateWordUsage(text = '') {
        const _includesWords = [];
        text = text.toLowerCase();
        for (const words of mustUseWords) {
            words.containedInText = false;
            for (const word of words) {
                if(text.includes(word)) {
                    _includesWords.push(word);
                    words.containedInText = true;
                    break;
                }
            }
        }
        mustUseWords = mustUseWords;
        includesWords = _includesWords;
    }

    let story = [];

    function escape(str) {
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    }

    function onSubmitSentence() {

        for (const includedWord of includesWords) {
            var reg = new RegExp(escape(includedWord), 'ig');
            inputSentence = inputSentence.replace(reg, `<span class="bonus">${includedWord}</span>`)
        }

        story = [...story, inputSentence];

        socket.emit('submit_sentence', inputSentence);

        inputSentence = '';
    }

    socket.on('start_sentence', (data) => {
        state = states.MY_TURN;
        mustUseWords = data.words; 
    });

    socket.on('stop_sentence', () => {
        state = states.OTHER_TURN;
    })

    socket.on('new_sentence', sentence => {
        story = [...story, sentence];
    })

    function onInputKeyup(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            onSubmitSentence();
        }
    }

    socket.on('start_game', data => {
        story = data.story;
        for(const userId in data.scores) {
            users[userId].score = data.scores[userId];
        }
        console.log(users)
        users = users;
    });
    socket.on('score_update', data => {
        for(const userId in data) {
            users[userId].score = data[userId];
        }
    })

    const states = {
        STOPPED: 'stopped',
        MY_TURN: 'my_turn',
        OTHER_TURN: 'other_turn'
    };
    let state = states.STOPPED;
    socket.on('stop_game', () => {
        state = states.STOPPED;
    })

    let username = localStorage.getItem('username') || 'Anonymous';
    function onSaveSettings() {
        localStorage.setItem('username', username);
        socket.emit('update_settings', { username });
    }
    onSaveSettings();

    function onResetGame() {
        socket.emit('reset_game');
    }

    let title = '';
    let interval;
    function startTitleBlink() {
        interval = setInterval(() => {
            title = title ? '' : '<';
        }, 1000);
    }

    function stopTitleBlink() {
        clearInterval(interval);
        title = '';
    }

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && interval){
            stopTitleBlink();
        }
    });

    $: {
        if(document.hidden && state == states.MY_TURN) {
            startTitleBlink();
        }
    }
</script>

<svelte:head>
    <title>Masterpričam{title}</title>
</svelte:head>
<main>
    <div class="story">
        {#each story as sentence}
            <div class="story__sentence">{@html sentence}</div>
        {/each}
    </div>

    <div class="input-sentence">
        {#if state == states.MY_TURN}
            <h3>Na tebi je red da nastaviš priču</h3>
            <div class="flex-row pills">
                {#each mustUseWords as word}
                    <span class="pill" class:used={word.containedInText} title={word.join(', ')}>{word[0]}</span>
                {/each}
            </div>
            <textarea class="dp-textarea" bind:value={inputSentence} on:keyup={onInputKeyup}></textarea>
            <div class="btn-group">
                <button class="btn" on:click={onSubmitSentence}>Pošalji</button>
            </div>
        {/if}

        {#if state == states.OTHER_TURN}
            <h3>Čekaj</h3>
            <p>Drugi igrač piše...</p>
        {/if}

        {#if state == states.STOPPED}
            <h3>Nađi drugog igrača</h3>
            <p>Igra je zaustavljena...</p>
        {/if}
    </div>

    <div class="settings">
        <h3>Postavke</h3>
        <div class="form-group">
            <label>Username</label>
            <input bind:value={username}>
        </div>
        <div class="btn-group">
            <button class="btn" on:click={onSaveSettings}>Snimi</button>
            <button class="btn" on:click={onResetGame}>Resetiraj igru</button>
        </div>
    </div>

    <div class="players">
        <h3>Igrači</h3>
        {#each Object.values(users) as player}
            <div class="player">
                {player.username}: {player.score}
            </div>
        {/each}
    </div>
</main>

<style>
    .story__sentence:nth-child(even) {
        background: #f0f0f0;
    }

    :global(.bonus)  {
        background: #ffffba;
    }

    .flex-row {
        display: flex;
        flex-direction: row;
    }

    .pills {
        padding: 0.4em 0.4em;
    }

    .pill.used {
        background: #b2ffb2;
    }

    .pill {
        border-radius: 4px;
        border: 1px solid #aaaaaa;
        padding: 0.2em 0.4em;
        margin-right: 0.4em;
    }

    .input-sentence, .settings {
        margin-top: 2em;
    }

    .dp-textarea {
        resize: vertical;
        width: 100%;
        padding: 0.8rem;
        font-size: 1rem;
        min-height: 100px;
    }

	main {
        max-width: 520px;
        margin: 2em auto;
	}
    
	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

    .btn-group {
        padding: 0.4em 0;
    }

    .btn {
        background: white;
        border: 1px solid #aaa;
        border-radius: 0.2rem;
        padding: 0.2rem 0.4rem;
        font-family: 'Segoe UI';
        font-size: 0.8rem;
        cursor: pointer;
    }

    .btn:hover {
        background: #f9f9f9;
    }
</style>