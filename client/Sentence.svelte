<script>
    export let fixed = [];
    export let syllables = [];
</script>

<div class="syl-sentence syls">
    <div class="syl syl-fixed">
        {fixed[0]}
    </div>
    <div class="syl syl-added">
        {syllables.join('')}
    </div>
    <div class="syl syl-fixed">
        {fixed[1]}
    </div>
</div>

<style>
    .syl-sentence {
        display: flex;   
    }

    .syls {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .syl {
        height: 1.5em;
        padding: 0 0.2em;
        margin: 0.1em;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .syl-fixed {
        background-color: rgb(109, 109, 109);
        color: white;
    }

    .syl-added {
        background-color: rgb(0, 184, 240);
        color: white;
    }
</style>