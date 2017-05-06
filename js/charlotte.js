// https://diarizer.blabbertabber.com?meeting=1766e8dc-28e1-11e7-a2c1-000c291285ff

meetingGuid = window.location.href.split('?')[1];
meetingGuid = meetingGuid.split('=')[1];
diarizationURL = 'https://diarizer.com/' + meetingGuid + '/diarization.txt';
transcriptionURL = 'https://diarizer.com/' + meetingGuid + '/transcription.txt';

jQuery.get(diarizationURL, function (data) {
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
});

jQuery.get(transcriptionURL, function (data) {
    var lines = data.split(/\n/);
    var out = "";
    lines.forEach(function (line) {
        out += line + "<br/>";
    });
    jQuery('#transcription').html(out);
});

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
}