// https://diarizer.blabbertabber.com?meeting=1766e8dc-28e1-11e7-a2c1-000c291285ff

HostURL = window.location.href.split('?')[0];
meetingGuid = window.location.href.split('?')[1].split('=')[1];
diarizationURL = HostURL + '/' + meetingGuid + '/diarization.txt';
transcriptionURL = HostURL + '/' + meetingGuid + '/transcription.txt';

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
    for (var spkr in speakerTimes) {
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

function displayTranscription(info) {
    var lines = info.split(/\n/);
    var out = "";
    lines.forEach(function (line) {
        out += line + "<br/>";
    });
    jQuery('#transcription').html(out);
}

function displayWaitDiarization(data) {
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
        "                <p class=\"lead\"><span class=\"glyphicon glyphicon-hourglass\" aria-hidden=\"true\"></span> Your file is\n" +
        "                    0MB. Our crystal ball predicts your results will be ready in 00 minutes.</p>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n");
    // TODO(brendan): instead of reload, trigger AJAX call that detects presence of file and THEN call reload
    setTimeout(diarization, 2000);
}

function displayWaitTranscription(info) {
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
        "                <p class=\"lead\"><span class=\"glyphicon glyphicon-hourglass\" aria-hidden=\"true\"></span> Your file is\n" +
        "                    0MB. Our crystal ball predicts your results will be ready in 00 minutes.</p>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n";
    jQuery('#transcription').html(transcriptionHtml);
    // TODO(brendan): instead of reload, trigger AJAX call that detects presence of file and THEN call reload
    setTimeout(transcription, 2000);
}

diarization();
transcription();

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
        url: transcriptionURL,
        type: 'get',
        error: displayWaitTranscription,
        success: displayTranscription
    });
}