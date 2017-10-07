// https://diarizer.blabbertabber.com?meeting=test


// Global variables are the devil's candy
var HostURL = window.location.href.split('?')[0];
var meetingGuid = window.location.href.split('?')[1].split('=')[1];
var diarizationURL = HostURL + '/' + meetingGuid + '/diarization.txt';
var transcriptionURL = HostURL + '/' + meetingGuid + '/transcription.txt';
var transcriptionFinishedURL = HostURL + '/' + meetingGuid + '/05_transcription_finished';
var timesAndSizeURL = HostURL + '/' + meetingGuid + '/times_and_size.json';
var estimatedDiarizationFinishTime;
var estimatedTranscriptionFinishTime;

getSpeakerTimes = function (lines) {
    var speakerTimes = {};
    var out = "";
    lines.forEach(function (line) {
        if (line.length > 0) {
            var fields = line.split(/\s+/);
            var startTime = fields[2].split(/=/)[1];
            var endTime = fields[3].split(/=/)[1];
            var speakerNum = fields[4].split(/=/)[1].split(/_/)[1];
            out = out + startTime + " " + endTime + " " + speakerNum + "<br />";
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
    console.log(speakerTimes);
    var times = "";
    for (var spkr in speakerTimes) {
        totalTime += speakerTimes[spkr];
    }
    jQuery('#diarization').html(diarizationHtml);
    for (spkr in speakerTimes) {
        console.log(spkr);
        speakerTime = Math.round(speakerTimes[spkr]);
        percent = (Math.floor(10000 * speakerTimes[spkr] / totalTime) ) / 100;
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

function displayWaitDiarization(data) {
    var finishTime = new Date(estimatedDiarizationFinishTime);
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
        "                    was " + durationOfMeeting(wavFileSizeInBytes) + "long. " +
        "                    We think we'll have figured out who spoke when by " +
        finishTime + ".</p>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n");
    setTimeout(diarization, 2000);
}

function durationOfMeeting(wavFileSizeInBytes) {
    var timeString = "";
    var seconds = wavFileSizeInBytes / 32000;
    var minutes = Math.round(seconds / 60);
    var hours = Math.round(minutes / 60);
    if (hours > 0) {
        timeString = hours + " hours ";
    }
    minutes %= 60;
    if (minutes > 0) {
        timeString += minutes + " minutes ";
    }
    seconds = Math.round(seconds % 60);
    if (seconds > 0) {
        timeString += seconds + " seconds ";
    }
    return timeString;
}

function displayWaitTranscription(info) {
    var finishTime = new Date(estimatedTranscriptionFinishTime);
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
        "                    was " + durationOfMeeting(wavFileSizeInBytes) + "long. " +
        "                    We think we'll finish transcribing it at " +
        finishTime + ".</p>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n";
    jQuery('#transcription_wait').html(transcriptionHtml);
    $.ajax({
        url: transcriptionURL,
        type: 'get',
        success: displayTranscription
    });
    displayTranscription(info); // show the transcription so far
    setTimeout(transcription, 2000);
}

function displayTranscription(info) {
    var lines = info.split(/\n/);
    var out = "";
    lines.forEach(function (line) {
        out += line + "<br/>";
    });
    jQuery('#transcription').html(out);
}

function displayNoWaitTranscription(info) {
    jQuery('#transcription_wait').html(""); // clear out the "Processing" notification
    $.ajax({
        url: transcriptionURL,
        type: 'get',
        success: displayTranscription
    });
}

timesAndSizeFromServer();
diarization();
transcription();

// timesAndSizeURL

function timesAndSizeFromServer() {
    $.ajax({
        dataType: "json",
        url: timesAndSizeURL,
        success: initializeTimesAndSize
    });
}

function diarization() {
    $.ajax({
        url: diarizationURL,
        type: 'get',
        error: displayWaitDiarization,
        success: displayDiarization
    });
}

function transcription() {
    $.ajax({
        url: transcriptionFinishedURL,
        type: 'get',
        error: displayWaitTranscription,
        success: displayNoWaitTranscription
    });
}