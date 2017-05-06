// https://diarizer.blabbertabber.com?meeting=1766e8dc-28e1-11e7-a2c1-000c291285ff

meetingGuid = window.location.href.split('?')[1];
meetingGuid = meetingGuid.split('=')[1];
diarizationURL = 'https://diarizer.com/' + meetingGuid + '/diarization.txt';
transcriptionURL = 'https://diarizer.com/' + meetingGuid + '/transcription.txt';

var speakerTimes = {};

jQuery.get(diarizationURL, function (data) {
    var lines = data.split(/\n/);
    var out = "";
    lines.forEach(function (line) {
        if (line.length > 0) {
            var fields = line.split(/\s+/);
            var startTime = fields[2].split(/=/)[1];
            var endTime = fields[3].split(/=/)[1];
            var speakerNum = fields[4].split(/=/)[1].split(/_/)[1];
            out = out + startTime + " " + endTime + " " + speakerNum + "<br />";
            if (!speakerTimes[speakerNum] || !("time" in speakerTimes[speakerNum])) {
                speakerTimes[speakerNum] = {time: endTime - startTime};
                speakerTimes[speakerNum].time = 0
            }
            speakerTimes[speakerNum].time += endTime - startTime;
        }
    });
    var times = "";
    for (var spkr in speakerTimes) {
        console.log(spkr);
        times += "time " + spkr + ": " + speakerTimes[spkr].time + "<br />";
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
