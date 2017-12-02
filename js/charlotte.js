// https://diarizer.blabbertabber.com?meeting=test

getSpeakerTimes = function (lines) {
    var speakerTimes = {};
    lines.forEach(function (line) {
        if (line.length > 0) {
            var fields = line.split(/\s+/);
            var startTime = fields[2].split(/=/)[1];
            var endTime = fields[3].split(/=/)[1];
            var speakerNum = fields[4].split(/=/)[1].split(/_/)[1];
            if (!speakerTimes[speakerNum]) {
                speakerTimes[speakerNum] = 0;
            }
            speakerTimes[speakerNum] += endTime - startTime;
        }
    });
    return speakerTimes;
};

function initializeTimesAndSize(data) {
    wavFileSizeInBytes = data.wav_file_size_in_bytes;
    estimatedDiarizationFinishTime = data.estimated_diarization_finish_time;
    estimatedTranscriptionFinishTime = data.estimated_transcription_finish_time;
}

function diarizationReady() {
    $.ajax({
        url: diarizationURL,
        success: displayDiarization
    });
}

function displayDiarization(data) {
    var diarizationHtml = "<div id=\"speaker_bar\" class=\"progress\">\n" +
        "    </div>\n" +
        "\n" +
        "    <div class=\"panel panel-default\">\n" +
        "    <div class=\"panel-heading\">\n" +
        "    <h3 class=\"panel-title\">Aggregate View</h3>\n" +
        "</div>\n" +
        "<div class=\"panel-body\">\n" +
        "    <table class=\"table\" id=\"speaker_table\">\n" +
        "    <thead>\n" +
        "    <tr>\n" +
        "    <th>Speaker</th>\n" +
        "    <th style=\"text-align: right\">Duration (seconds)</th>\n" +
        "    <th style=\"text-align: right\">Percent of Total Speaking Time</th>\n" +
        "</tr>\n" +
        "</thead>\n" +
        "<tbody>\n" +
        "</tbody>\n" +
        "</table>\n" +
        "</div>\n" +
        "</div>\n";
    var lines = data.split(/\n/);
    var totalTime = 0;
    speakerTimes = getSpeakerTimes(lines);
    var times = "";
    for (var spkr in speakerTimes) {
        totalTime += speakerTimes[spkr];
    }
    jQuery('#diarization').html(diarizationHtml);
    for (spkr in speakerTimes) {
        speakerTime = Math.round(speakerTimes[spkr]);
        percent = (Math.floor(10000 * speakerTimes[spkr] / totalTime)) / 100;
        speakerCell = '<td>Speaker ' + spkr + '</td>';
        timeCell = '<td align="right">' + speakerTime + '</td>';
        percentCell = '<td align="right">' + percent + '%</td>';
        $('#speaker_table > tbody:last-child').append('<tr>' + speakerCell + timeCell + percentCell + '</tr>');

        // update Speaker Percentage Bar
        bar = '<div class="progress-bar speaker-' + spkr + '"  style="width: ' + percent + '%">' +
            '<span class="sr-only">Speaker ' + spkr + '</span>' +
            '</div>';
        $('#speaker_bar').append(bar);
    }
}

function diarizationNotReady() {
    var finishTime = new Date(estimatedDiarizationFinishTime);
    var duration = finishTime - Date.now();
    jQuery('#diarization').html("<div class=\"row\">\n" +
        "    <div class=\"col-md-6 col-md-offset-3\">\n" +
        "        <h1>Processing...</h1>\n" +
        "\n" +
        "    </div>\n" +
        "\n" +
        "    <div class=\"row\">\n" +
        "        <div class=\"col-md-6 col-md-offset-3\">\n" +
        "            <div>\n" +
        "                <br/>\n" +
        "                <p class=\"lead\"><span class=\"glyphicon glyphicon-hourglass\" aria-hidden=\"true\"></span> Your recorded  meeting" +
        "                    was " + durationOfMeeting(wavFileSizeInBytes) + " long. " +
        "                    We think we'll have figured out who spoke in " +
        millisecondsToString(duration) + ".</p>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n");
    setTimeout(diarization, 3000);
}

function durationOfMeeting(wavFileSizeInBytes) {
    var milliseconds = wavFileSizeInBytes / 32; // 32000 bytes/sec => 32 bytes/millisecond
    return millisecondsToString(milliseconds);
}

function millisecondsToString(milliseconds) {
    var seconds = Math.floor((milliseconds / 1000) % 60);
    var minutes = Math.floor((milliseconds / 1000 / 60) % 60);
    var hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

    var timeString = "";
    if (hours > 0) {
        timeString = " " + hours + (hours !== 1 ? " hours" : " hour");
    }
    if (minutes > 0) {
        timeString += " " + minutes + (minutes !== 1 ? " minutes" : " minute");
    }
    if (seconds !== 0 || timeString === "") { // don't display 0 seconds unless that's the only time you got (no hours or minutes)
        timeString += " " + seconds + (seconds !== 1 ? " seconds" : " second");
    }
    return timeString;
}

function transcriptionNotReady() {
    var finishTime = new Date(estimatedTranscriptionFinishTime);
    var duration = finishTime - Date.now();
    var transcriptionHtml = "<div class=\"row\">\n" +
        "    <div class=\"col-md-6 col-md-offset-3\">\n" +
        "        <h1>Processing...</h1>\n" +
        "\n" +
        "    </div>\n" +
        "\n" +
        "    <div class=\"row\">\n" +
        "        <div class=\"col-md-6 col-md-offset-3\">\n" +
        "            <div>\n" +
        "                <br/>\n" +
        "                <p class=\"lead\"><span class=\"glyphicon glyphicon-hourglass\" aria-hidden=\"true\"></span> Your recorded  meeting" +
        "                    was " + durationOfMeeting(wavFileSizeInBytes) + " long. " +
        "                    We think we'll finish transcribing it in " +
        millisecondsToString(duration) + ".</p>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n";
    jQuery('#transcription_wait').html(transcriptionHtml);
    $.ajax({
        url: transcriptionURL,
        type: 'get',
        success: displayTranscription
    }); // show as much transcription as we've gotten so far
    setTimeout(transcription, 3000);
}

function displayTranscription(info) {
    jQuery('#transcription').html(newlinesToHTMLBreaks(info));
}

function newlinesToHTMLBreaks(info) {
    var lines = info.split(/\n/);
    var out = "";
    lines.forEach(function (line) {
        out += line + "<br/>";
    });
    return (out);
}

function transcriptionReady() {
    jQuery('#transcription_wait').html(""); // clear out the "Processing" notification
    $.ajax({
        url: transcriptionURL,
        success: displayTranscription
    });
}

function timesAndSizeFromServer() {
    $.ajax({
        dataType: "json",
        url: timesAndSizeURL,
        success: initializeTimesAndSize
    });
}

function diarization() {
    $.ajax({
        url: diarizationReadyURL,
        error: diarizationNotReady,
        success: diarizationReady
    });
}

function transcription() {
    $.ajax({
        url: transcriptionReadyURL,
        error: transcriptionNotReady,
        success: transcriptionReady
    });
}

if (typeof module !== 'undefined') {
    module.exports = {
        newlinesToHTMLBreaks: newlinesToHTMLBreaks
    };
}
