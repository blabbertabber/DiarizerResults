// Global variables are the devil's candy, and I like candy a lot
var HostURL = window.location.href.split('?')[0];
var meetingGuid = window.location.href.split('?')[1].split('=')[1];
var diarizationAaltoURL = HostURL + '/' + meetingGuid + '/diarization.txt';
var IBMResultsURL = HostURL + '/' + meetingGuid + '/ibm_out.json';
var transcriptionCMUURL = HostURL + '/' + meetingGuid + '/transcription.txt';
var diarizationReadyURL = HostURL + '/' + meetingGuid + '/04_diarization_finished';
var transcriptionReadyURL = HostURL + '/' + meetingGuid + '/05_transcription_finished';
var timesAndSizeURL = HostURL + '/' + meetingGuid + '/times_and_size.json';
var estimatedDiarizationFinishTime;
var estimatedTranscriptionFinishTime;
var wavFileSizeInBytes;
var diarizer;
var transcriber;
var IBMResults;

timesAndSizeFromServer();
diarization();
transcription();