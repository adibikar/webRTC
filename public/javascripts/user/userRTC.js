$(document).ready(function () {
	var roomRTCName = $('#kdDosen').val();
	console.log('roomRTCName: ' + roomRTCName);
	var idPeerStu;
	var soc_webrtc = io.connect('/soc_webrtc');
	
	soc_webrtc.emit('join_room', {name:$('#namaRoom').val()});

	easyrtc.setDisconnectListener( function() {
        console.log("LOST-CONNECTION. Automatic refresh page to enroll again to your lecturer.");
		alert('LOST-CONNECTION. Automatic refresh page to enroll again to your lecturer.');
		// window.location.href = '/home';
		location.reload();
        // easyrtc.showError("LOST-CONNECTION", "Lost connection to signaling server");
    });
	// easyrtc.enableAudio(false);
	// easyrtc.enableAudioReceive(false);
	easyrtc.setUsername($('#kdUser').val());
	easyrtc.connect(roomRTCName,
		function (easyrtcid, roomOwner) {
			console.log('connecting peer.');
			idPeerStu = easyrtcid;
			console.log('student: ' + idPeerStu + ' > ' + easyrtc.idToName(easyrtcid));
		},
		function (et) {
			console.log('error on connecting peer: ' + et);
			$('#errorText').html(et);
			$('#notice').show();
			// easyrtc.showError(et);
		});

	soc_webrtc.on('lecCallStu', function (data) {
		console.log('peer id lecCallStu received: ' + data.idPeerLec + ' > ' + easyrtc.idToName(data.idPeerLec));
		soc_webrtc.emit('stuCallLec', {idPeerStu: idPeerStu});
	});

	easyrtc.setAcceptChecker(function (easyrtcid, acceptor) {
		console.log('id peer lecturer received: '+easyrtcid + ' > ' + easyrtc.idToName(easyrtcid));
		// document.getElementById('').style.display = "block";
		$('#acceptCallLabel').html("Accept incoming call from " + easyrtc.idToName(easyrtcid) +  " ?");
		$('#noticeCall').show();
		var acceptTheCall = function(wasAccepted) {
	        $('#noticeCall').hide();
	        if( wasAccepted && easyrtc.getConnectionCount() > 0 ) {
	            easyrtc.hangupAll();
	        }
	        acceptor(wasAccepted);
	    };
	    document.getElementById("callAcceptButton").onclick = function() {
	        acceptTheCall(true);
	    };
	    document.getElementById("callRejectButton").onclick = function() {
	        acceptTheCall(false);
	    };
	});

	easyrtc.setStreamAcceptor(function (easyrtcid, stream) {
		var videoLec = document.getElementById('lecturerVideo');
		var videoSelf = document.getElementById('studentVideo');
    	easyrtc.setVideoObjectSrc(videoLec, stream);
    	easyrtc.setVideoObjectSrc(videoSelf, easyrtc.getLocalStream());
	});

	easyrtc.setOnStreamClosed(function (easyrtcid) {
		console.log('lecturer disconnect. ' + easyrtcid + ' --->> ' + easyrtc.idToName(easyrtcid));
	    easyrtc.setVideoObjectSrc(document.getElementById('lecturerVideo'), '');
	    easyrtc.setVideoObjectSrc(document.getElementById('studentVideo'), '');
	});

	$('#cam').click(function () {
		soc_webrtc.emit('stuWantCam', {idPeerStu:idPeerStu});
	});

	$('#btnOk').click(function () {
		$('#notice').hide();
	});
});