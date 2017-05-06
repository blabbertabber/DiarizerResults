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
        // display the raw time values
        jQuery('#speaker_time_' + spkr).html(speakerTimes[spkr]);
        // calculate and display the percent
        percent = speakerTimes[spkr] / totalTime;
        jQuery('#speaker_percent_' + spkr).html(percent);
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