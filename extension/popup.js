var rating = 0;
var sites = [];
var found = 0;
var verdict;
var id = "0";



function checkLogin() {
    chrome.storage.local.get(['id'], function(result) {
        id = result.id;
		if(id == null) id = "0";
    });
}

function login(username, password) {
    $.ajax({
        url: 'http://trinitygames.xyz/nolies/api/trinityLogin',
        data: {
            'user': username,
            'pass': password
        }
    }).done(function(data) {
        console.log(data.jwt);
        chrome.storage.local.set({'id': data.jwt});
    });
}

function getRelatedNews(q, url) {
    $.ajax({
        url: 'http://trinitygames.xyz/nolies/api/getRelated',
        data: {
            'q': q,
            'url': url,
        }
    }).done(function(data) {
        for (var news of data.articles) {
            var newSite = document.createElement("a")
            var title = news.title
            if (title.length > 40) {
                var title = news.title.substring(0, 37);
                title += "...";
            }
            newSite.innerText = title
            newSite.classList.add("sec-color")
            newSite.href = news.url
            newSite.target = "_blank"
            document.getElementById("sites").appendChild(newSite)
            document.getElementById("sites").appendChild(document.createElement("br"))
        }
        setColor();
    });
}

function rate(url, rating) {
     $.ajax({
        url: 'http://trinitygames.xyz/nolies/api/checkUser',
        data: {
            'url': url,
            'user': id
        }
    }).done(function(data) {
        console.log(data);
        if (data.found == 0) {
	        $.ajax({
                url: 'http://trinitygames.xyz/nolies/api/giveRating',
                data: {
                    'url': url,
			        'rating': rating,
                    'user': id
                }
            }).done(function(data) {
                success = data.success;
                console.log(success);
                if (success == 1) {
                    colorDots(url);
                    
                }
                else {
			        console.log("Error at rate");
                }
            });
        }
    });
}
function getAverageRating(url, callback) {
    $.ajax({
        url: 'http://trinitygames.xyz/nolies/api/getRating',
        data: {
            'url': url
        }
    }).done(function(data) {
        let result = data.map(data => data.rating);
        var sum = 0;
        for (var i = 0; i < result.length; ++i) {
            sum += result[i];
        }
        if (result.length != 0) {
            var average = (sum * 1.0) / (result.length * 1.0);
            callback(average);
        }
        else
            callback(2);
    });
}
function checkUrl(url, callback) {
    var found;
    $.ajax({
        url: 'http://trinitygames.xyz/nolies/api/checkUrl',
        data: {
            'url': url
        }
    }).done(function(data) {
        if (Object.keys(data).length!=0) {
            console.log(data);
            found = data.found;
            console.log(found);
            callback(found);
        }
    });
}

function setColor() {
    console.log('set')

    var prim, sec;
    if(rating > 70)
    {
        prim = "#64D27A"
        sec = "#C0F3CB"
        document.getElementById("scoretext").innerText="FACT"
        document.getElementById("scoretext").classList.add("bigtext")
        document.getElementsByClassName("progress")[0].style.stroke = "#64D27A";
    }
    else if(rating > 30)
    {
        prim = "#D2B564"
        sec = "#F3E5C0"
        document.getElementById("scoretext").innerText="QUESTIONABLE"
        document.getElementById("scoretext").classList.add("smalltext")
        document.getElementsByClassName("progress")[0].style.stroke = "#D2B564";
    }
    else
    {
        prim = "#D26464"
        sec = "#F3C0C0"
        document.getElementById("scoretext").innerText="LIE"
        document.getElementById("scoretext").classList.add("bigtext")
        document.getElementsByClassName("progress")[0].style.stroke = "#D26464";
    }
    const primary = document.getElementsByClassName("prim-color")
    for(var x=0; x<primary.length; x++)
    {
        primary[x].style.color = prim
    }
    const primarybg = document.getElementsByClassName("primbg-color")
    for(var x=0; x<primarybg.length; x++)
    {
        primarybg[x].style.backgroundColor = prim
    }
    const secondary = document.getElementsByClassName("sec-color")
    for(var x=0; x<secondary.length; x++)
    {
        secondary[x].style.color = sec
    }
    const secondarybg = document.getElementsByClassName("secbg-color")
    for(var x=0; x<secondarybg.length; x++)
    {
        secondarybg[x].style.backgroundColor = sec
    }
    document.getElementsByClassName("progress")[0].style.strokeDashoffset = (100-rating)/100 * -745

    
    const dots = document.getElementsByClassName("ratebtn");

    return 0;
}


function colorDots(url) {
    const dots = document.getElementsByClassName("ratebtn");
    
     $.ajax({
        url: 'http://trinitygames.xyz/nolies/api/checkUser',
        data: {
            'url': url,
            'user': id
        }
    }).done(function(data) {
        if (data.found != 0) {
            let result = data.map(data => data.rating);
            console.log(result);
            item = result[0] - 1;
            console.log(item);
            for(var x=0; x<dots.length; x++)
            {
                if(x<=item) {
                    dots[x].classList.replace('secbg-color', 'primbg-color')
                }
                else {
                    dots[x].classList.replace('primbg-color', 'secbg-color')
                }
            }
            setColor();
        }
    });
}

function setScore() {
    if (found == 1) {
        verdict = "This website is surely fake or satire. It is found in our blacklist";    
    }
    else {
        verdict = "This website as a user score of " + rating + " out of 100";
    }
    console.log(verdict);
    document.getElementById("score").innerText = rating
}

function setLoginState() {
    checkLogin();
    if (id == "0") {
        console.log("Not logged in");    
        $('#dots').hide();
        $('#login_button').show();
    }
    else {
        console.log("Logged in with id:", id);
        $('#dots').show();
        $('#login_button').hide();
    }
}

function showLoginDialog() {
    $('#login_container').show();
}

function addListeners(url) {
    $('#login_btn').on('click', function(e){
        const user = $('#username').val();
        const password = $('#password').val();
        console.log("test"); console.log(user); console.log(password);
        login(user, password);
        e.preventDefault();
    });
    $('#star1').on("click", function(e){
        rate(url, 1);
        e.preventDefault();
 
    });
    $('#star2').on("click", function(e){
        rate(url, 2);
        e.preventDefault();
 
    });
    $('#star3').on("click", function(e){
        rate(url, 3);
        e.preventDefault();
 
    });
    $('#star4').on("click", function(e){
        rate(url, 4);
        e.preventDefault();
 
    });
    $('#star5').on("click", function(e){
        rate(url, 5);
        e.preventDefault();
 
    });
     $('#login_button').on("click", function(e){
        showLoginDialog();
        e.preventDefault();
 
    });
}

function extractWordsFromString(s, url) {
    var myWord = "", words = "";
    s = s.toLowerCase()
    for (var i = 0; i < s.length; ++i) {
        if (s[i] >= 'a' && s[i] <= 'z') {
            myWord += s[i];
        }
        else {
            if (myWord != "") {
                if (url.indexOf(myWord) == -1) {
                    words += " " + myWord;
                }
                myWord = "";    
            }
        }
    }
    if (url.indexOf(myWord) == -1) {
        words += " " + myWord;
    }
    return words;
}


chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    var url = tabs[0].url;
    var title = tabs[0].title;
    var truncatedUrl = "";
    var sl = 0;
    for (var x = 0; x < url.length; ++x) {
        if (url[x] == '/') {
            sl++;
            if (sl >= 3) {
                break;
            }
        }
        else {
            if (sl == 2) {
                truncatedUrl += url[x];        
            }
        }
    }
    url = truncatedUrl;
    console.log(url);
    getAverageRating(url, function(ad) {
        rating = (ad / 5) * 100;
        rating = parseInt(rating);
        console.log("AD:" + ad);
        checkUrl(url, function(fnd) {
           if (fnd == true) {
                rating = 5;
				document.getElementById('score').innerHTML = '5';
                found = 1; 
           }
        });
    });

    var words = extractWordsFromString(title, url);
    console.log(words);

    addListeners(url);
    getRelatedNews(words, url);

    checkLogin();

    setTimeout(function(){
        setLoginState();        
        setScore();
        setColor();
        colorDots(url);
    }, 200);
});


