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
    var lines = data.split(/\n/);
    var totalTime = 0;
    speakerTimes = getSpeakerTimes(lines);
    console.log(speakerTimes);
    var times = "";
    for (var spkr in speakerTimes) {
        totalTime += speakerTimes[spkr];
    }
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

function displayWaitTranscription(info) {
    // TODO(brian) replace Palantír with "crystal ball" when moving to production
    jQuery('#transcription').html("<div class=\"row\">\n" +
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
        "                    00kb. Our Palant&iacute;r predicts your results will be ready in 00 minutes.</p>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n");
    // TODO(brendan): instead of reload, trigger AJAX call that detects presence of file and THEN call reload
    setTimeout(function () {
        window.location.reload(true);
    }, 2000);
}

function displayWaitDiarization(data) {
    // TODO(brian) replace Palantír with "crystal ball" when moving to production
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
        "                    00kb. Our Palant&iacute;r predicts your results will be ready in 00 minutes.</p>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n");
    // TODO(brendan): instead of reload, trigger AJAX call that detects presence of file and THEN call reload
    setTimeout(function () {
        window.location.reload(true);
    }, 2000);
}

$.ajax({
    url: transcriptionURL,
    type: 'get',
    error: displayWaitTranscription,
    success: displayTranscription
});

$.ajax({
    url: diarizationURL,
    type: 'get',
    error: displayWaitDiarization,
    success: displayDiarization
});

// jQuery.get(transcriptionURL, function (data) {
//     displayTranscription(data);
// });