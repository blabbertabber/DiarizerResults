// https://diarizer.blabbertabber.com?meeting=test

function timesAndSizeFromServer() {
    $.ajax({
        dataType: "json",
        url: timesAndSizeURL,
        success: initializeTimesAndSize,
        async: false
    });
}

function initializeTimesAndSize(data) {
    diarizer = data.diarizer;
    transcriber = data.transcriber;
    wavFileSizeInBytes = data.wav_file_size_in_bytes;
    estimatedDiarizationFinishTime = data.estimated_diarization_finish_time;
    estimatedTranscriptionFinishTime = data.estimated_transcription_finish_time;
}

function diarization() {
    $.ajax({
        url: diarizationReadyURL,
        error: diarizationNotReady,
        success: diarizationReady
    });
}

function transcription() {
    if (transcriber == 'null') {
        jQuery('#transcription_heading').html('')
    } else {
        $.ajax({
            url: transcriptionReadyURL,
            error: transcriptionNotReady,
            success: transcriptionReady
        });
    }
}

function diarizationReady() {
    switch (diarizer) {
        case 'IBM':
            loadIBMResults();
            displayIBMDiarization(IBMResults);
            break;
        case 'Aalto':
            $.ajax({
                url: diarizationAaltoURL,
                success: displayAaltoDiarization
            });
            break;
        default:
    }
}

function loadIBMResults() {
    if (IBMResults == null) {
        $.ajax({
            dataType: "json",
            url: IBMResultsURL,
            success: initializeIBMResults,
            async: false
        });
    }
}

function initializeIBMResults(data) {
    IBMResults = data;
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

function transcriptionReady() {
    switch (transcriber) {
        case 'CMU Sphinx 4':
            $.ajax({
                url: transcriptionCMUURL,
                success: displayCMUTranscription
            });
            break;
        case 'IBM':
            loadIBMResults();
            displayIBMTranscription(IBMResults);
            break;
        default:
    }
    jQuery('#transcription_wait').html(""); // clear out the "Processing" notification

    $.ajax({
        url: transcriptionCMUURL,
        success: displayCMUTranscription
    });
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
        url: transcriptionCMUURL,
        type: 'get',
        success: displayCMUTranscription
    }); // show as much transcription as we've gotten so far
    setTimeout(transcription, 3000);
}

function getAaltoSpeakerTimes(lines) {
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
}

function getIBMSpeakerTimes(speakerData) {
    var speakerTimes = {};
    speakerData.forEach(function (speakerDatum) {
        speakerNum = speakerDatum.speaker;
        if (!speakerTimes[speakerNum]) {
            speakerTimes[speakerNum] = 0;
        }
        speakerTimes[speakerNum] += speakerDatum.to - speakerDatum.from;
    });
    return speakerTimes;
}

function displayAaltoDiarization(data) {
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
    speakerTimes = getAaltoSpeakerTimes(lines);
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

function displayIBMDiarization(results) {
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
    var totalTime = 0;
    speakerTimes = getIBMSpeakerTimes(results);
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

function displayCMUTranscription(info) {
    jQuery('#transcription').html(newlinesToHTMLBreaks(info));
}

function displayIBMTranscription(speakerData) {
    for (spkr in speakerData) {
        logue = '<dt>Speaker ' + speakerData[spkr].speaker + ':</dt>'
            + '<dd>' + speakerData[spkr].transcript + '</dd>';
        $('#transcription').append(logue);
    }
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

function newlinesToHTMLBreaks(info) {
    var lines = info.split(/\n/);
    var out = "";
    lines.forEach(function (line) {
        out += line + "<br/>";
    });
    return (out);
}

if (typeof module !== 'undefined') {
    module.exports = {
        newlinesToHTMLBreaks: newlinesToHTMLBreaks,
        millisecondsToString: millisecondsToString
    };
}
