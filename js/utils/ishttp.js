function validateURL(link) {
	console.log("Regarding: " + link);
    if(link.indexOf("http://") == 0 || link.indexOf("https://") == 0) {
        console.log("The link has http or https.");
    }
    else {
        console.log("The link doesn't have http or https.");
    }
}

validateURL("www.yogeshchauhan.com/");
validateURL("http://www.yogeshchauhan.com/");
validateURL(window.location.href);
