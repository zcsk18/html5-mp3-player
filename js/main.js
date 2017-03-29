var audio = new Audio;
audio.preload = "metadata";

var controls = new Object;
var song_list = new Array;
var now_index = 1;
var slider;

function setCookie(c_name,value,expiredays)
{
	var exdate=new Date()
	exdate.setDate(exdate.getDate()+expiredays)
	document.cookie=c_name+ "=" +escape(value)+((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
}

function getCookie(c_name)
{
	if (document.cookie.length>0)
  	{
  		c_start=document.cookie.indexOf(c_name + "=")
  		if (c_start!=-1)
    	{ 
    		c_start=c_start + c_name.length+1 
    		c_end=document.cookie.indexOf(";",c_start)
    		if (c_end==-1) c_end=document.cookie.length
    			return unescape(document.cookie.substring(c_start,c_end))
    	} 
  	}
	return 0;
}


function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}


function writeObj(obj){ 
	var description = ""; 
	for(var i in obj){ 
		var property=obj[i]; 
		description+=i+" = "+property+"\n"; 
	} 
	return (description); 
} 

function debug(str)
{
	console.log(str);
}

function play(index){
	if(index==0)
	{
		index = 1;
	}
	var song = song_list[index-1]
	pause()
	if(index!=now_index)
	{
		audio.src = song.url;
		$("#song"+now_index).css("background-color","#fff");
		debug("now play:"+song.url)
	}
	
	audio.play();
	now_index = index;
	
	setCookie("now_index",index,1);
	$("#song"+now_index).css("background-color","#d2e9ff");
}

function pause(){
	audio.pause();
	
	//controls.play.attr("class","glyphicon glyphicon-play")
}

function play_or_pause()
{
	if(controls.play.attr("class")=="glyphicon glyphicon-play")
	{
		play(now_index)
	}
	else
	{
		pause()
	}
}


function next(){
	var index = now_index + 1
	if(index > song_list.length)
	{
		index = 1;
	}
	play(index)
}

function last(){
	var index = now_index - 1
	if(index < 1)
	{
		index = song_list.length
	}
	play(index)
}


function toggle_list()
{
	$("#song_list").toggle()
}

function update(){
	if(!audio.paused)
	{
		var num = audio.currentTime*100/audio.duration
		controls.progress.css("width",num+"%");
		var str = "";
		var time = Math.floor(audio.currentTime);
		str = Math.floor((time/60))+":"+(time-Math.floor(time/60)*60)
		controls.progress.html(str)
		controls.cur_time.html(str)

		time = Math.floor(audio.duration - audio.currentTime)
		str = "["+now_index+"]"+Math.floor((time/60))+":"+(time-Math.floor(time/60)*60);
		if(IsPC())
		{
			$("title").html(str);
		}
		setCookie("cur",audio.currentTime,1);
	}
	var t = setTimeout("update()",1000)
}

function add_song(title,url)
{
	var song = new Object;
	song.title = title;
	song.url = url;
	var len = song_list.push(song);
	update();
}

var DATA = add_song
function init(){
	debug("start");
	
	controls.progress = $("#song_progress");
	controls.load = $("#load_progress");
	controls.cur_time = $("#cur_time");
	controls.total_time = $("#total_time");
	
	controls.last_song = $("#last_song");
	controls.play = $("#play");
	controls.play_pause = $("#play_pause");
	controls.next_song = $("#next_song");
	
	controls.last_song.attr("onclick","last()");
	controls.play_pause.attr("onclick","play_or_pause()");
	controls.next_song.attr("onclick","next()");
	
	if(IsPC())
	{
		rem = 24;
	}	
	for (var i=0;i<song_list.length;i++)
	{
		var num = i+1;
		var song = song_list[i]
		var title = song.title
		$("#song_list").append('<button type="button" class="list-group-item" onclick="play('+num+')" id="song'+num+'" style="font-size:'+rem+'px;">'+'['+num+']'+title+'</button>');
	}
	
	var height = (document.documentElement.clientHeight-document.getElementById("player_zone").clientHeight)-100
	
	$("#song_list").css("height",height+"px");
/*
	$("#play_progess").click(function(e){
		set_progess(e);	
	});
*/

	document.getElementById("play_progess").addEventListener('mousedown',function(e){
    	var now_v = e.layerX;
		var max_v = document.getElementById("play_progess").offsetWidth
		audio.currentTime  = audio.duration * (now_v/max_v);
		debug("mousedown:"+audio.currentTime);
	});
	// Without JQuery
	slider = new Slider('#ex1', {
		formatter: function(value) {
			return 'Current volume: ' + value;
		}
	});
	
	$("#ex1").on("slide", function(slideEvt) {
		audio.volume = slideEvt.value/100;
		debug(slideEvt.value);
	});

	audio.src=song_list[0].url;
	audio.volume = 0.50;

/*
	if(getCookie("need_back")=="1")
	{
		play(Number(getCookie("now_index")));
		var cur = Number(getCookie("cur"));
		audio.currentTime = Math.floor(cur);
	}
*/
//	play(Number(getCookie("now_index")));
}

audio.onended = function(e){//结束
	debug("onended")
	next();
}

audio.onerror = function(e){//出错
	debug("onerror")
	next();
}

audio.onpause = function(e){//暂停
	debug("onpause")
	controls.play.attr("class","glyphicon glyphicon-play")
}

audio.onloadedmetadata = function(e){//当元数据（比如分辨率和时长）被加载时运行的脚本
	debug("onloadedmetadata")
	controls.progress.css("width","0%");
	
	var time = Math.floor(audio.duration);
	var str = Math.floor((time/60))+":"+(time-Math.floor(time/60)*60)
	controls.total_time.html(str)
}

audio.onplay = function(e){//当元数据（比如分辨率和时长）被加载时运行的脚本
	debug("onplay")
	controls.play.attr("class","glyphicon glyphicon-pause")
}

audio.onplaying = function(e){//当媒介已开始播放时运行的脚本
	debug("onplaying")
}

audio.onprogress = function(e){//当浏览器正在获取媒介数据时运行的脚本。
	
	var len = audio.buffered.length;
	if(len>0)
	{
		var index = len-1;
		debug("onprogress" +"|"+ audio.duration +"|"+audio.buffered.end(index)+"|"+len)
		var num = Math.floor(audio.buffered.end(index)*100/audio.duration)
		controls.load.css("width",num+"%");
	}
	setCookie("need_back",0,1);
	
}

audio.onstalled = function(e){//在浏览器不论何种原因未能取回媒介数据时运行的脚本。
	debug("onstalled")
	setCookie("need_back",1,1);
	var cur = audio.currentTime;
	var state = audio.paused
	var index = now_index;
	if(IsPC())
	{
		audio.pause();
		audio.src = song_list[index-1].url 
		audio.currentTime = cur;
		if(!state)
		{	
			audio.play();
		}
	}
}

audio.onsuspend = function(e){//在媒介数据完全加载之前不论何种原因终止取回媒介数据时运行的脚本。
	debug("onsuspend")
	if(audio.buffered.length>0)
	{
		var num = Math.floor(audio.buffered.end(0)*100/audio.duration)
		controls.load.css("width",num+"%");
	}
	else
	{
		controls.load.css("width","0%");
	}
}

audio.onwaiting = function(e){//当媒介已停止播放但打算继续播放时（比如当媒介暂停已缓冲更多数据）运行脚本
	debug("onwaiting")
}













