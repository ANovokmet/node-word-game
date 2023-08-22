<script>
    import { io } from 'socket.io-client';
    import { connect } from './users-store';

    const socket = io();

    socket.onAny((event, data) => {
        console.log(event, data);
    });

    let users = connect(socket);
    
    function calculateWordUsage(text = '') {
        text = text.toLowerCase();
        for (const words of bonusWords) {
            words.containedInText = false;
            for (const word of words) {
                if(text.includes(word)) {
                    words.containedInText = true;
                    break;
                }
            }
        }
        bonusWords = bonusWords;
    }

    let inputSentence;
    $: {
        calculateWordUsage(inputSentence);
    }

    function onSubmitSentence() {
        socket.emit('submit_sentence', inputSentence);
        inputSentence = '';
    }

    let story = [];
    let bonusWords = [];
    socket.on('start_sentence', (data) => {
        state = STATE.playing;
        bonusWords = data.words; 
    });

    socket.on('stop_sentence', () => {
        state = STATE.waiting;
    });

    socket.on('new_sentence', sentence => {
        story = [...story, sentence];
    });

    function onInputKeyup(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            onSubmitSentence();
        }
    }


    const STATE = {
        stopped: 'stopped',
        playing: 'playing',
        waiting: 'waiting'
    };
    let state = STATE.stopped;
    socket.on('start_game', data => {
        state = STATE.waiting;
        story = data.story;
        for(const userId in data.scores) {
            $users[userId].score = data.scores[userId];
        }
        console.log($users)
        $users = $users;
    });

    socket.on('start_turn', data => {
        state = STATE.playing;
        syls = data.syls;
        added = [];
        game.sentence = data.sentence.split('_');
        game.results = [];
    });

    const game = {
        sentence: null,
        results: []
    };

    socket.on('end_turn', data => {
        state = STATE.waiting;
        for(const [userId, syls] of data.syls) {
            game.results.push({
                userId,
                syls
            });
        }   
    })

    socket.on('stop_game', () => {
        state = STATE.stopped;
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
            title = title ? '' : '☞';
        }, 1000);
    }

    function stopTitleBlink() {
        clearInterval(interval);
        title = '';
    }

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && interval){
            stopTitleBlink();
        }
    });

    $: {
        if(document.hidden && state == STATE.playing) {
            startTitleBlink();
        }
    }

    let syls = [];
    let added = [];
    function remove(syl) {
        added = added.filter(s => s !== syl);
    }
    function add(syl) {
        added = [...added, syl];
    }
    $: {
        socket.emit('submit_sentence', [added, false]);
    }

    let time = null;
    socket.on('time', data => time = data);

    import Sentence from './Sentence.svelte';

    function insertSpace(index) {

    }
</script>

<svelte:head>
    <title>{title}Masterpričam</title>
</svelte:head>
<main>
    <div class="time">
        <h2>{time}s</h2>
        <small>time left</small>
    </div>

    <div class="input-sentence">
        {#if state == STATE.playing}
        

            <h3>Nadopuni rečenicu</h3>
            <div class="syl-sentence syls">
                <div class="syl syl-fixed">
                    {game.sentence[0]}  
                </div>
                {#each added as syl, i}
                    <div class="syl syl-added"
                        on:click={e => remove(syl)}>
                        {syl}
                    </div>
                    {#if i !== added.length - 1}
                        <div class="space" on:click={e => insertSpace(i)}>
                        </div>
                    {/if}
                {/each}
                <div class="syl syl-fixed">
                    {game.sentence[1]} 
                </div>
            </div>
            <p></p>
            <div class="syls">
                {#each syls.filter(s => !added.includes(s)) as syl}
                    <div class="syl syl-added"
                        on:click={e => add(syl)}>
                        {syl}
                    </div>
                {/each}
            </div>
            <div class="btn-group">
                <button class="btn" on:click={onSubmitSentence}>Pošalji</button>
            </div>
        {/if}

        {#if state == STATE.waiting}
            <h3>Results</h3>
            {#each game.results as result}
                <div class="flex-row">
                    <strong>{$users[result.userId].username}</strong>
                    <Sentence syllables={result.syls} fixed={game.sentence}></Sentence>
                </div>
            {/each}
        {/if}

        {#if state == STATE.stopped}
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
        {#each Object.values($users) as player}
            <div class="player">
                {player.username}: {player.score}
            </div>
        {/each}
    </div>
</main>

<style>
    .time {
        border: 1px solid #ccc;
        width: 100px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    .syl-sentence {
        display: flex;   
    }

    .space {
        width: 0.2em;
        color: transparent;
        transition: all 0.2s ease-in-out;
    }

    .space:hover {
        width: 0.4em;
        background: rgb(255, 255, 0);
    }

    .syl {
        padding: 0 1em;
        height: 3em;
        margin: 0.2em;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .syl-added {
        width: 3em;
        background-color: rgb(0, 184, 240);
        color: white;
    }

    .syl-fixed {
        background-color: rgb(109, 109, 109);
        color: white;
    }

    .syls {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

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