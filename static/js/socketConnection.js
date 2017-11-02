// All implementations are made for CONNETO

var socketInfo;
//window.setTimeout(Test, 1000);
chrome.sockets.tcp.onReceive.addListener(function(info){	//tcp Listener 등록
	var msg = arrayBufferToString(info.data);
	console.log("Received: " + msg);
	var msgObject = JSON.parse(msg); //msg로부터 JSON 객체를 얻어낸다(Parsing).
	console.log(msgObject.command);
	switch(msgObject.command){	//msgOBject의 command값에 따라 다른 작업을 수행
		case "getHosts": //연결된 호스트들의 정보를 보내달라는 요청일 경우
			var msg = [];
			var i=0;
			for (var hostId in hosts){	//hosts는 모든 host들의 정보를 담고 있는 사전에 정의된 변수
				msg.push({"hostId": hostId,		//host의 id(고유한 값)
					"hostname": hosts[hostId].hostname,	//host의 이름
					"online": hosts[hostId].online,		//host가 현재 online인지
					"paired": hosts[hostId].paired		//host와 현재 pairing된 상태인지
				});
			}
			sendMsg({command: "hostList", list: msg});
			break;

		case "addHost":  //새로운 호스트를 연결해달라는 요청일 경우
			var randomNumber =msgObject.randomNumber; //Pairing에 쓰일 무작위 4자리숫자
			var _nvhttpHost = new NvHTTP(msgObject.hostIp, myUniqueid, msgObject.hostIp); //새로운 host의 정보를 담을 NvHTTP객체 생성
			pairTo(_nvhttpHost, function() {		//Pairing 작업을 수행할 PairTo함수를 호출, 두번째 인자는 pairing성공 시 호출할 콜백, 세번째 인자는 실패 시 호출
                beginBackgroundPollingOfHost(_nvhttpHost);
                addHostToGrid(_nvhttpHost);
                saveHosts();
                sendMsg({
                	"hostId": _nvhttpHost.hostId,
                	"hostname": _nvhttpHost.hostname,
                	"online": _nvhttpHost.online,
              		"paired": _nvhttpHost.paired
                });
            }, function() {
            	sendMsg({error: 3});
                snackbarLog('pairing to ' + msgObject.hostIp + ' failed!');
        	}, randomNumber);
			break;

		case "getAppList":  //특정 호스트의 플레이 가능 게임 리스트를 보내달라는 요청
			var host = hosts[msgObject.hostId];
			if(!host.online){
				sendMsg({"error": 1});
				break;
			}

			if(!host.paired){
				sendMsg({"error": 2});
				break;
			}

			host.getAppList().then(function(appList){	//getAppList는 host객체에 사전에 정의된 함수로 그 호스트의 실행가능한 게임들을 반환
				sendMsg(appList);
			});
			break;

		case "startGame":  //특정 호스트의 특정 게임을 실행해달라는 요청
			var host = hosts[msgObject.hostId];
			host.pollServer(function(){
				if(!host.online){
					sendMsg({"error": 1});
					return;
				}

				if(!host.paired){
					sendMsg({"error": 2});
					return;
				}
				startGame(hosts[msgObject.hostId], msgObject.appId, /* option을 추가해 줘야함 */);
				sendMsg({hostId: msgObject.hostId, appId: msgObject.appId});
			})

		case "loginApproval":
			var isApproved = msgObject.isApproved;
			var userID = msgObject.userID;
			var modal = document.querySelector('#loginDialog');

			if(isApproved){
				accID = userID;
				modal.close();

				$("#secondView").fadeOut("slow", function (){
		            $("#thirdView").fadeIn("slow");
		        });
			}
			else{
				// ChromeApplication에서는 alert 작동하지 않음
				// alert("ID나 비밀번호 값이 옳지 않습니다. 다시 입력해 주세요");
			}

		case "networkTest":
			/*
			JSON type of networkSetting instance {
				ip: xx; //networkTest는 내부IP값이 아닌 GlobalIP값을 반환해준다
				latency: xx;
				download: xx;
				resolution: xx;
				frame: xx;
			}
			*/

			/*
			720P 60FPS - 10Mbps
			1080P 60FPS - 20Mbps
			4KP 60FPS - 80Mbps

			720P 30FPS - 5Mbps
			1080P 30FPS - 10Mbps
			4KP 30FPS - 40Mbps
			*/

		default:
			break;
	}
});

chrome.sockets.tcp.create({}, function(createInfo){
	console.log("Tcp created");
	chrome.sockets.tcp.connect(createInfo.socketId, 'localhost', 4001, function(result){	//따로 만든 tcp서버에 연결하여 tcp socket을 만듬
		console.log("Tcp connected");
		console.log("Created socket's socketId: " + createInfo.socketId);
		console.log("Information of tcp connect result(minus value means error): " + result);
		socketInfo = createInfo;
	})
})

function sendMsg(msg){	//tcp소켓을 통해 메세지를 보낼 때 사용하는 함수(귀찮은 변환 과정을 함수로 만듬)
	chrome.sockets.tcp.send(socketInfo.socketId, stringToArrayBuffer(JSON.stringify(msg)), function(sendInfo){
		console.log("sent: " + sendInfo);
	});
}

// function Test(){
// 	console.log("Test");
// 	for(var hostid in hosts){
// 		console.log("fuck");
// 		var host = hosts[hostid];
// 		host.pollServer(function(){
// 			if(host.online){
// 				//hostChosen(host);
// 				host.getAppList().then(function(appList){
//     				appList.forEach(function (app) {
//     				console.log(app.title);
//     				//if(app.title === "Dead Space 3"){
//     					startGame(hosts['3764db53-fa7f-4adc-90c7-82b22d464e11'], app.id);
//     				//}
//     				})
// 				})
// 			}
// 		})
// 	}
// }

function arrayBufferToString(buffer){
    var arr = new Uint8Array(buffer);
    var str = String.fromCharCode.apply(String, arr);
    if(/[\u0080-\uffff]/.test(str)){
        throw new Error("this string seems to contain (still encoded) multibytes");
    }
    return str;
}

function stringToArrayBuffer(str){
    if(/[\u0080-\uffff]/.test(str)){
        throw new Error("this needs encoding, like UTF-8");
    }
    var arr = new Uint8Array(str.length);
    for(var i=str.length; i--; )
        arr[i] = str.charCodeAt(i);
    return arr.buffer;
}
